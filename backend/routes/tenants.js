const express = require('express');
const Tenant = require('../models/Tenant');
const Note = require('../models/Note');
const { authenticate, requireAdmin, ensureTenantIsolation } = require('../middleware/auth');

const router = express.Router();

// Get tenant information
router.get('/:slug', authenticate, async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Ensure user can only access their own tenant's info
    if (req.tenant.slug !== slug) {
      return res.status(403).json({ error: 'Access denied to this tenant' });
    }

    const tenant = await Tenant.findOne({ slug });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Get current notes count for subscription limit info
    const notesCount = await Note.countByTenant(tenant._id);

    res.json({
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subscription: tenant.subscription,
        notesLimit: tenant.getNotesLimit(),
        currentNotesCount: notesCount,
        canCreateNotes: tenant.getNotesLimit() === null || notesCount < tenant.getNotesLimit()
      }
    });
  } catch (error) {
    console.error('Tenant fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant information' });
  }
});

// Upgrade tenant subscription (Admin only)
router.post('/:slug/upgrade', authenticate, requireAdmin, ensureTenantIsolation, async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Ensure admin can only upgrade their own tenant
    if (req.tenant.slug !== slug) {
      return res.status(403).json({ error: 'Access denied to this tenant' });
    }

    const tenant = await Tenant.findOne({ slug });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (tenant.subscription === 'pro') {
      return res.status(400).json({ error: 'Tenant is already on Pro plan' });
    }

    // Upgrade to Pro
    await tenant.upgradeToPro();

    res.json({
      message: 'Tenant successfully upgraded to Pro plan',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subscription: tenant.subscription,
        notesLimit: tenant.getNotesLimit()
      }
    });
  } catch (error) {
    console.error('Tenant upgrade error:', error);
    res.status(500).json({ error: 'Failed to upgrade tenant subscription' });
  }
});

// Get tenant subscription status
router.get('/:slug/subscription', authenticate, ensureTenantIsolation, async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Ensure user can only access their own tenant's subscription info
    if (req.tenant.slug !== slug) {
      return res.status(403).json({ error: 'Access denied to this tenant' });
    }

    const notesCount = await Note.countByTenant(req.tenant._id);
    const notesLimit = req.tenant.getNotesLimit();

    res.json({
      subscription: {
        plan: req.tenant.subscription,
        notesLimit: notesLimit,
        currentNotesCount: notesCount,
        canCreateNotes: notesLimit === null || notesCount < notesLimit,
        canUpgrade: req.tenant.subscription === 'free' && req.user.role === 'admin'
      }
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

module.exports = router;