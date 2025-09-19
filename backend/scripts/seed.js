const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saas-notes');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data (be careful in production!)
    await Promise.all([
      User.deleteMany({}),
      Tenant.deleteMany({})
    ]);
    console.log('Cleared existing data...');

    // Create tenants
    const acmeTenant = await Tenant.create({
      name: 'Acme Corporation',
      slug: 'acme',
      subscription: 'free'
    });

    const globexTenant = await Tenant.create({
      name: 'Globex Corporation',
      slug: 'globex',
      subscription: 'free'
    });

    console.log('Tenants created:', { acme: acmeTenant._id, globex: globexTenant._id });

    // Create test users
    const testUsers = [
      {
        email: 'admin@acme.test',
        password: 'password',
        role: 'admin',
        tenantId: acmeTenant._id
      },
      {
        email: 'user@acme.test',
        password: 'password',
        role: 'member',
        tenantId: acmeTenant._id
      },
      {
        email: 'admin@globex.test',
        password: 'password',
        role: 'admin',
        tenantId: globexTenant._id
      },
      {
        email: 'user@globex.test',
        password: 'password',
        role: 'member',
        tenantId: globexTenant._id
      }
    ];

    // Create users
    const createdUsers = await User.create(testUsers);
    console.log('Test users created:', createdUsers.map(u => ({ email: u.email, role: u.role, tenant: u.tenantId })));

    console.log('\n=== SEEDING COMPLETED SUCCESSFULLY ===');
    console.log('\nTest accounts created:');
    console.log('1. admin@acme.test (Admin, Acme) - password: password');
    console.log('2. user@acme.test (Member, Acme) - password: password');
    console.log('3. admin@globex.test (Admin, Globex) - password: password');
    console.log('4. user@globex.test (Member, Globex) - password: password');
    console.log('\nBoth tenants start with FREE subscription (3 notes limit)');
    console.log('Admins can upgrade their tenant to PRO (unlimited notes)');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
};

// Run seeding
if (require.main === module) {
  seedData();
}

module.exports = seedData;