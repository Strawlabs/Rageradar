const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const NotificationManager = require('../services/notificationManager');
const { authenticateUser } = require('../middleware/auth');

const notificationManager = new NotificationManager();

/**
 * Complete user registration (called after Supabase Auth signup)
 * This endpoint handles post-registration tasks like sending welcome emails
 */
router.post('/complete-registration', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = req.user.email;
    
    console.log(`📧 Completing registration for user: ${userEmail} (${userId})`);
    
    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      return res.status(404).json({ error: 'User document not found' });
    }
    
    const camelUserData = {
      email: userData.email,
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      companyName: userData.company_name || '',
      plan: userData.plan || 'trial',
      trialEndsAt: userData.trial_ends_at
    };
    
    // Send welcome email
    const welcomeResult = await notificationManager.sendWelcomeEmail(userId, camelUserData);
    
    if (welcomeResult.success) {
      console.log(`✅ Welcome email sent to ${userEmail}`);
      
      // Update user document to mark welcome email as sent
      await supabase
        .from('users')
        .update({
          welcome_email_sent: true,
          welcome_email_sent_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      res.json({ 
        message: 'Registration completed successfully',
        welcomeEmailSent: true,
        emailId: welcomeResult.data.id
      });
    } else {
      console.error(`❌ Failed to send welcome email to ${userEmail}:`, welcomeResult.error);
      
      // Still return success since the user is registered, just log the email failure
      res.json({ 
        message: 'Registration completed, but welcome email failed',
        welcomeEmailSent: false,
        error: welcomeResult.error
      });
    }
  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(500).json({ error: 'Failed to complete registration' });
  }
});

/**
 * Resend welcome email
 */
router.post('/resend-welcome', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = req.user.email;
    
    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      return res.status(404).json({ error: 'User document not found' });
    }
    
    const camelUserData = {
      email: userData.email,
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      companyName: userData.company_name || '',
      plan: userData.plan || 'trial',
      trialEndsAt: userData.trial_ends_at
    };
    
    // Send welcome email
    const result = await notificationManager.sendWelcomeEmail(userId, camelUserData);
    
    if (result.success) {
      // Update user document
      await supabase
        .from('users')
        .update({
          welcome_email_sent: true,
          welcome_email_sent_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      res.json({ 
        message: 'Welcome email resent successfully',
        emailId: result.data.id 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to resend welcome email',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error resending welcome email:', error);
    res.status(500).json({ error: 'Failed to resend welcome email' });
  }
});

/**
 * Confirm password reset with token
 */
router.post('/reset-password-confirm', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    
    if (!token || !email || !newPassword) {
      return res.status(400).json({ error: 'Token, email, and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Verify token
    const { data: resetData, error: resetError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('email', email)
      .eq('token', token)
      .eq('used', false)
      .limit(1)
      .single();
    
    if (resetError || !resetData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    // Check if token is expired (1 hour)
    if (new Date(resetData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }
    
    // Update user password in Supabase Auth
    try {
      // Find the user's ID
      const { data: userRow, error: userLookupError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userLookupError || !userRow) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userId = userRow.id;
      
      // Update password
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });
      
      if (authError) throw authError;
      
      // Mark token as used
      await supabase
        .from('password_resets')
        .update({
          used: true,
          used_at: new Date().toISOString()
        })
        .eq('id', resetData.id);
      
      // Send confirmation email (optional)
      const result = await notificationManager.sendSystemNotification(
        userId,
        'password_changed',
        'Your RageRadar password has been successfully updated.',
        {
          additionalInfo: 'If you did not make this change, please contact support immediately.',
          actionUrl: `${process.env.CLIENT_URL}/login`,
          actionText: 'Sign In'
        }
      );
      
      res.json({ 
        message: 'Password updated successfully',
        emailSent: result?.success || false
      });
      
    } catch (authError) {
      console.error('Supabase Auth error:', authError);
      return res.status(500).json({ error: 'Failed to update password' });
    }
    
  } catch (error) {
    console.error('Error confirming password reset:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

/**
 * Get user registration status
 */
router.get('/registration-status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      return res.status(404).json({ error: 'User document not found' });
    }
    
    res.json({
      userId,
      email: userData.email,
      welcomeEmailSent: userData.welcome_email_sent || false,
      welcomeEmailSentAt: userData.welcome_email_sent_at || null,
      registrationCompleted: true,
      trialStatus: {
        plan: userData.plan,
        trialEndsAt: userData.trial_ends_at || null,
        isExpired: userData.trial_ends_at ? new Date() > new Date(userData.trial_ends_at) : false
      }
    });
  } catch (error) {
    console.error('Error getting registration status:', error);
    res.status(500).json({ error: 'Failed to get registration status' });
  }
});

module.exports = router;