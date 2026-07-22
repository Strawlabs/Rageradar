const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const { authenticateUser } = require('../middleware/auth');
const { requireRole, VALID_ROLES } = require('../middleware/roleGuard');
const logger = require('../utils/logger');

/**
 * GET /api/admin/users
 * List all users. Requires admin or super_admin role.
 */
router.get('/users', authenticateUser, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch users', { error: error.message });
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json(users || []);
  } catch (error) {
    logger.error('Admin list users error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/users/:id
 * Get a single user's details. Requires admin or super_admin role.
 */
router.get('/users/:id', authenticateUser, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Admin get user error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PATCH /api/admin/users/:id/role
 * Update a user's role. Requires super_admin role.
 * Admins cannot promote users to super_admin.
 */
router.patch('/users/:id/role', authenticateUser, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !VALID_ROLES.has(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        validRoles: Array.from(VALID_ROLES)
      });
    }

    // Prevent self-demotion
    if (id === req.user.uid && role !== 'super_admin') {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const { error } = await supabase
      .from('users')
      .update({
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      logger.error('Failed to update user role', { error: error.message, targetUser: id, newRole: role });
      return res.status(500).json({ error: 'Failed to update role' });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action: 'role_change',
      user_id: req.user.uid,
      details: { targetUser: id, newRole: role },
      compliance: 'rbac'
    });

    logger.info('User role updated', { targetUser: id, newRole: role, by: req.user.uid });
    res.json({ message: 'Role updated successfully', role });
  } catch (error) {
    logger.error('Admin update role error', { error: error.message });
    res.status(500).json({ error: 'Failed to update role' });
  }
});

/**
 * PATCH /api/admin/users/:id/plan
 * Update a user's subscription plan. Requires admin or super_admin role.
 */
router.patch('/users/:id/plan', authenticateUser, requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    const validPlans = ['trial', 'free', 'starter', 'pro', 'enterprise'];
    if (!plan || !validPlans.includes(plan)) {
      return res.status(400).json({
        error: 'Invalid plan',
        validPlans
      });
    }

    // Set max_brands based on plan
    const planBrands = {
      trial: 1,
      free: 1,
      starter: 3,
      pro: 10,
      enterprise: 9999
    };

    const { error } = await supabase
      .from('users')
      .update({
        plan,
        max_brands: planBrands[plan] || 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      logger.error('Failed to update user plan', { error: error.message, targetUser: id, newPlan: plan });
      return res.status(500).json({ error: 'Failed to update plan' });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action: 'plan_change',
      user_id: req.user.uid,
      details: { targetUser: id, newPlan: plan },
      compliance: 'subscription'
    });

    logger.info('User plan updated', { targetUser: id, newPlan: plan, by: req.user.uid });
    res.json({ message: 'Plan updated successfully', plan });
  } catch (error) {
    logger.error('Admin update plan error', { error: error.message });
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Deactivate a user. Requires super_admin role.
 * Sets subscription_status to 'deactivated' instead of hard-deleting.
 */
router.delete('/users/:id', authenticateUser, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user.uid) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    // Soft-deactivate: set status rather than deleting
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'deactivated',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      logger.error('Failed to deactivate user', { error: error.message, targetUser: id });
      return res.status(500).json({ error: 'Failed to deactivate user' });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action: 'user_deactivated',
      user_id: req.user.uid,
      details: { targetUser: id },
      compliance: 'user_management'
    });

    logger.info('User deactivated', { targetUser: id, by: req.user.uid });
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    logger.error('Admin delete user error', { error: error.message });
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

module.exports = router;
