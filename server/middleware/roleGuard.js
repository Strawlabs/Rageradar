/**
 * Role Guard Middleware
 * Provides reusable middleware for role-based and plan-based route access control.
 */

const { supabase } = require('../supabase');
const logger = require('../utils/logger');

// Role hierarchy (higher index = more privileges)
const ROLE_HIERARCHY = ['user', 'enterprise_user', 'admin', 'super_admin'];

const VALID_ROLES = new Set(ROLE_HIERARCHY);

/**
 * Get the privilege level of a role (higher = more privileged)
 * @param {string} role
 * @returns {number}
 */
function getRoleLevel(role) {
  const index = ROLE_HIERARCHY.indexOf(role);
  return index >= 0 ? index : -1;
}

/**
 * Check if a role meets the minimum required role level.
 * @param {string} userRole
 * @param {string} minimumRole
 * @returns {boolean}
 */
function meetsMinimumRole(userRole, minimumRole) {
  return getRoleLevel(userRole) >= getRoleLevel(minimumRole);
}

/**
 * Middleware: require user to have one of the specified roles.
 * Must be used AFTER authenticateUser middleware.
 *
 * @param {...string} allowedRoles - Roles that are allowed access
 * @returns {Function} Express middleware
 *
 * @example
 *   router.get('/admin/users', authenticateUser, requireRole('super_admin', 'admin'), handler);
 */
function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get the authoritative role from the database (not from JWT claims)
      let userRole = req.userPlan?.role;

      if (!userRole) {
        const { data: userRow, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();

        if (error || !userRow) {
          return res.status(403).json({ error: 'User profile not found' });
        }
        userRole = userRow.role;
      }

      if (!allowedRoles.includes(userRole)) {
        logger.warn('ACCESS_DENIED', {
          userId: userId.substring(0, 8) + '...',
          userRole,
          requiredRoles: allowedRoles,
          endpoint: req.originalUrl
        });

        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
          code: 'ROLE_ACCESS_DENIED'
        });
      }

      next();
    } catch (error) {
      logger.error('Role guard error', { error: error.message });
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

/**
 * Middleware: allow access if the user has the required role OR is accessing their own resource.
 * Checks req.params.id against req.user.uid for self-access.
 *
 * @param {...string} allowedRoles - Roles that bypass the self-check
 * @returns {Function} Express middleware
 *
 * @example
 *   router.get('/users/:id', authenticateUser, requireRoleOrSelf('super_admin', 'admin'), handler);
 */
function requireRoleOrSelf(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Self-access: user is accessing their own resource
      const targetId = req.params.id;
      if (targetId && targetId === userId) {
        return next();
      }

      // Otherwise, check role
      let userRole = req.userPlan?.role;
      if (!userRole) {
        const { data: userRow, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();

        if (error || !userRow) {
          return res.status(403).json({ error: 'User profile not found' });
        }
        userRole = userRow.role;
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: 'You can only access your own data, or need an elevated role.',
          code: 'ROLE_OR_SELF_DENIED'
        });
      }

      next();
    } catch (error) {
      logger.error('Role-or-self guard error', { error: error.message });
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

/**
 * Middleware: require user to have one of the specified subscription plans.
 *
 * @param {...string} allowedPlans - Plans that are allowed access
 * @returns {Function} Express middleware
 *
 * @example
 *   router.get('/ai-insights', authenticateUser, requirePlan('pro', 'enterprise'), handler);
 */
function requirePlan(...allowedPlans) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Admins and super_admins bypass plan checks
      const userRole = req.userPlan?.role;
      if (userRole === 'super_admin' || userRole === 'admin') {
        return next();
      }

      let userPlan = req.userPlan?.plan;
      if (!userPlan) {
        const { data: userRow, error } = await supabase
          .from('users')
          .select('plan')
          .eq('id', userId)
          .single();

        if (error || !userRow) {
          userPlan = 'trial';
        } else {
          userPlan = userRow.plan;
        }
      }

      if (!allowedPlans.includes(userPlan)) {
        return res.status(403).json({
          error: 'Plan upgrade required',
          message: `This feature requires one of the following plans: ${allowedPlans.join(', ')}. You are currently on the "${userPlan}" plan.`,
          code: 'PLAN_UPGRADE_REQUIRED',
          currentPlan: userPlan,
          requiredPlans: allowedPlans,
          upgradeUrl: '/pricing'
        });
      }

      next();
    } catch (error) {
      logger.error('Plan guard error', { error: error.message });
      res.status(500).json({ error: 'Plan check failed' });
    }
  };
}

module.exports = {
  ROLE_HIERARCHY,
  VALID_ROLES,
  getRoleLevel,
  meetsMinimumRole,
  requireRole,
  requireRoleOrSelf,
  requirePlan
};
