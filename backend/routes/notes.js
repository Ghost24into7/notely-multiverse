const express = require('express');
const Note = require('../models/Note');
const { authenticate, ensureTenantIsolation } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Apply authentication and tenant isolation to all routes
router.use(authenticate);
router.use(ensureTenantIsolation);

// Create a new note
router.post('/', async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;

    // Basic validation
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (title.length > 255) {
      return res.status(400).json({ error: 'Title cannot exceed 255 characters' });
    }

    if (content.length > 10000) {
      return res.status(400).json({ error: 'Content cannot exceed 10000 characters' });
    }

    // Check subscription limits
    const currentNotesCount = await Note.countByTenant(req.tenantId);
    const notesLimit = req.tenant.getNotesLimit();

    if (notesLimit !== null && currentNotesCount >= notesLimit) {
      return res.status(403).json({
        error: 'Notes limit reached for current subscription plan',
        currentCount: currentNotesCount,
        limit: notesLimit,
        subscription: req.tenant.subscription,
        message: 'Upgrade to Pro for unlimited notes'
      });
    }

    // Create note
    const note = await Note.create({
      title,
      content,
      tags,
      tenantId: req.tenantId,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    // Populate user information
    await note.populate('createdBy', 'email role');
    await note.populate('updatedBy', 'email role');

    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Get all notes for current tenant
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    const options = {
      sort: { [sort]: order === 'desc' ? -1 : 1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const notes = await Note.findByTenant(req.tenantId, options);
    const totalNotes = await Note.countByTenant(req.tenantId);

    res.json({
      notes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalNotes / parseInt(limit)),
        totalNotes,
        hasMore: parseInt(page) * parseInt(limit) < totalNotes
      },
      tenant: {
        subscription: req.tenant.subscription,
        notesLimit: req.tenant.getNotesLimit(),
        currentCount: totalNotes
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get a specific note by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findOne({ 
      _id: id, 
      tenantId: req.tenantId, 
      isActive: true 
    })
    .populate('createdBy', 'email role')
    .populate('updatedBy', 'email role');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ note });
  } catch (error) {
    console.error('Get note error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid note ID format' });
    }
    
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Update a note
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Basic validation
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'At least one field must be provided' });
    }

    if (updates.title && updates.title.length > 255) {
      return res.status(400).json({ error: 'Title cannot exceed 255 characters' });
    }

    if (updates.content && updates.content.length > 10000) {
      return res.status(400).json({ error: 'Content cannot exceed 10000 characters' });
    }

    const note = await Note.findOne({ 
      _id: id, 
      tenantId: req.tenantId, 
      isActive: true 
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check if user can modify this note (note owner or admin)
    if (!note.canModify(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. You can only edit your own notes.' 
      });
    }

    // Update note
    Object.assign(note, updates);
    note.updatedBy = req.user._id;
    note.updatedAt = new Date();

    await note.save();
    await note.populate('createdBy', 'email role');
    await note.populate('updatedBy', 'email role');

    res.json({
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Update note error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid note ID format' });
    }
    
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findOne({ 
      _id: id, 
      tenantId: req.tenantId, 
      isActive: true 
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check if user can modify this note (note owner or admin)
    if (!note.canModify(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. You can only delete your own notes.' 
      });
    }

    // Soft delete - mark as inactive
    note.isActive = false;
    note.updatedBy = req.user._id;
    note.updatedAt = new Date();

    await note.save();

    res.json({
      message: 'Note deleted successfully',
      noteId: id
    });
  } catch (error) {
    console.error('Delete note error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid note ID format' });
    }
    
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Get notes statistics for current tenant
router.get('/stats/overview', async (req, res) => {
  try {
    const totalNotes = await Note.countByTenant(req.tenantId);
    const userNotes = await Note.countDocuments({ 
      tenantId: req.tenantId, 
      createdBy: req.user._id, 
      isActive: true 
    });

    const notesLimit = req.tenant.getNotesLimit();

    res.json({
      stats: {
        totalNotes,
        userNotes,
        notesLimit,
        remainingNotes: notesLimit ? Math.max(0, notesLimit - totalNotes) : null,
        subscription: req.tenant.subscription,
        canCreateNotes: notesLimit === null || totalNotes < notesLimit
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;