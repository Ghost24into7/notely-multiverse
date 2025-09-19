import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Auth state changed in Login:', { isAuthenticated });
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Redirect if already authenticated (immediate check)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Login attempt started for:', formData.email);
    const result = await login(formData.email, formData.password);
    console.log('Login result:', result);
    
    if (result.success) {
      console.log('Login successful, attempting navigation...');
      // Force navigation after successful login
      setTimeout(() => {
        console.log('Navigating to dashboard...');
        navigate('/dashboard', { replace: true });
      }, 200);
    } else {
      console.log('Login failed:', result.error);
      setError(result.error);
    }
    
    setLoading(false);
  };

  const testAccounts = [
    { email: 'admin@acme.test', role: 'Admin', tenant: 'Acme' },
    { email: 'user@acme.test', role: 'Member', tenant: 'Acme' },
    { email: 'admin@globex.test', role: 'Admin', tenant: 'Globex' },
    { email: 'user@globex.test', role: 'Member', tenant: 'Globex' },
  ];

  const fillTestAccount = (email) => {
    setFormData({ email, password: 'password' });
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">SaaS Notes</h1>
        <p className="login-subtitle">Multi-tenant notes application</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input password-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="test-accounts">
          <h4>Test Accounts (Password: password)</h4>
          <ul>
            {testAccounts.map((account, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => fillTestAccount(account.email)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: 'inherit',
                    padding: 0,
                  }}
                >
                  {account.email}
                </button>
                {' '}({account.role}, {account.tenant})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;