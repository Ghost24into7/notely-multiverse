import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, TrashIcon } from 'lucide-react';
import api from '../utils/api';

const Dashboard = () => {
  const { user, logout, isAdmin, getTenant } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tenant = getTenant();

  useEffect(() => {
    fetchNotes();
    fetchSubscription();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await api.get(`/tenants/${tenant.slug}/subscription`);
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const createNote = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/notes', newNote);
      setNotes([response.data.note, ...notes]);
      setNewNote({ title: '', content: '' });
      setShowCreateModal(false);
      setSuccess('Note created successfully!');
      await fetchSubscription(); // Update subscription stats
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create note';
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter(note => note._id !== noteId));
      setSuccess('Note deleted successfully!');
      await fetchSubscription(); // Update subscription stats
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete note';
      setError(message);
    }
  };

  const upgradeToPro = async () => {
    setUpgrading(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/tenants/${tenant.slug}/upgrade`);
      setSuccess('Successfully upgraded to Pro! You now have unlimited notes.');
      await fetchSubscription(); // Refresh subscription status
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to upgrade subscription';
      setError(message);
    } finally {
      setUpgrading(false);
    }
  };

  const canCreateNotes = subscription?.canCreateNotes !== false;
  const isFreePlan = subscription?.plan === 'free';
  const showUpgradeOption = isFreePlan && isAdmin();

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <h2>Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-brand">SaaS Notes</div>
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <div className="tenant-badge">
            {tenant.name}
          </div>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Success/Error Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Subscription Banner */}
        {subscription && (
          <div className="subscription-banner">
            <div className="subscription-info">
              <h3>
                {subscription.plan.toUpperCase()} Plan
              </h3>
              <p>
                {subscription.notesLimit 
                  ? `${subscription.currentNotesCount}/${subscription.notesLimit} notes used`
                  : `${subscription.currentNotesCount} notes (unlimited)`
                }
              </p>
            </div>
            {showUpgradeOption && (
              <button 
                className="upgrade-button" 
                onClick={upgradeToPro}
                disabled={upgrading}
              >
                {upgrading ? 'Upgrading...' : 'Upgrade to Pro'}
              </button>
            )}
          </div>
        )}

        {/* Notes Section */}
        <div className="notes-section">
          <div className="notes-header">
            <h2 className="notes-title">Your Notes</h2>
            <button
              className="add-note-button"
              onClick={() => setShowCreateModal(true)}
              disabled={!canCreateNotes}
            >
              <PlusIcon size={16} />
              Add Note
            </button>
          </div>

          <div className="notes-list">
            {notes.length === 0 ? (
              <div className="empty-state">
                <h3>No notes yet</h3>
                <p>Create your first note to get started!</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note._id} className="note-card">
                  <div className="note-header">
                    <h3 className="note-title">{note.title}</h3>
                    <div className="note-actions">
                      <button
                        className="action-button delete-button"
                        onClick={() => deleteNote(note._id)}
                        title="Delete note"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="note-content">
                    {note.content}
                  </div>
                  <div className="note-meta">
                    <span className="note-author">
                      By: {note.createdBy.email}
                    </span>
                    <span>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Note</h3>
              <button 
                className="close-button"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form className="modal-form" onSubmit={createNote}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="form-input"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  required
                  placeholder="Enter note title"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="content">
                  Content
                </label>
                <textarea
                  id="content"
                  className="form-textarea"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  required
                  placeholder="Enter note content"
                  rows={6}
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-button"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;