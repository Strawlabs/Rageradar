const { supabase } = require('../supabase');

/**
 * Authentication middleware.
 * Validates the JWT token via Supabase Auth, loads the authoritative role
 * from the public.users table (not from JWT user_metadata which is user-editable),
 * checks session expiry, and updates last_login.
 */
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    // Validate token with Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const supabaseUser = data.user;

    // Load authoritative role and session info from public.users
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('role, plan, session_expires_at, max_brands, brands_used')
      .eq('id', supabaseUser.id)
      .single();

    // Check explicit session expiry (if set)
    if (userRow?.session_expires_at) {
      const expiresAt = new Date(userRow.session_expires_at);
      if (new Date() > expiresAt) {
        return res.status(401).json({
          error: 'Session expired. Please sign in again.',
          code: 'SESSION_EXPIRED'
        });
      }
    }

    // Build req.user with authoritative role from DB
    const role = userRow?.role || 'user';
    req.user = {
      uid: supabaseUser.id,
      email: supabaseUser.email,
      role,
      ...supabaseUser
    };

    // Attach plan info
    if (userRow) {
      req.userPlan = {
        plan: userRow.plan || 'trial',
        role,
        maxBrands: userRow.max_brands,
        brandsUsed: userRow.brands_used
      };
    }

    // Update last_login (fire-and-forget, don't block the request)
    supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', supabaseUser.id)
      .then(() => {})
      .catch(() => {});

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

module.exports = { authenticateUser };