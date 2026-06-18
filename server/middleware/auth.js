const { supabase } = require('../supabase');

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      uid: data.user.id,
      email: data.user.email,
      role: data.user.role || 'user',
      ...data.user
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticateUser };