const mongoose = require('mongoose');
const User = require('./models/User');
const Tenant = require('./models/Tenant');
require('dotenv').config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Test finding user
    const user = await User.findOne({ email: 'admin@acme.test', isActive: true }).populate('tenantId');
    console.log('User found:', !!user);
    
    if (user) {
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Tenant:', user.tenantId.name);
      
      // Test password
      const isValid = await user.comparePassword('password');
      console.log('Password valid:', isValid);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();