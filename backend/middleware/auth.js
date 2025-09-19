const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

// JWT authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and populate tenant information
      const user = await User.findById(decoded.userId).populate('tenantId');
      
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid token. User not found or inactive.' });
      }

      // Add user and tenant info to request
      req.user = user;
      req.tenant = user.tenantId;
      
      next();
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed.' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        requiredRole: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Admin-only middleware
const requireAdmin = authorize('admin');

// Tenant isolation middleware - ensures user can only access their tenant's data
const ensureTenantIsolation = (req, res, next) => {
  if (!req.tenant) {
    return res.status(401).json({ error: 'Tenant information required.' });
  }

  // Add tenant ID to request params/body for consistent access
  req.tenantId = req.tenant._id;
  
  next();
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Verify token utility
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticate,
  authorize,
  requireAdmin,
  ensureTenantIsolation,
  generateToken,
  verifyToken
};