const express = require('express');
const router = express.Router();
const NotificationManager = require('../services/notificationManager');
const { authenticateUser } = require('../middleware/auth');

const notificationManager = new NotificationManager();

/**
 * Get user notification preferences
 */
router.get('/preferences', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const preferences = await notificationManager.getUserNotificationPreferences(userId);
    
    if (!preferences) {
      return res.status(404).json({ error: 'User preferences not found' });
    }
    
    res.json({ preferences });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({ error: 'Failed to get notification preferences' });
  }
});

/**
 * Update user notification preferences
 */
router.put('/preferences', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({ error: 'Preferences are required' });
    }
    
    const result = await notificationManager.updateUserNotificationPreferences(userId, preferences);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

/**
 * Send test notification
 */
router.post('/test', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { type } = req.body;
    
    let result;
    
    switch (type) {
      case 'rage_spike':
        // Send test rage spike alert
        result = await notificationManager.emailService.sendRageSpikeAlert(
          req.user.email,
          'Test Brand',
          2.1,
          4.5,
          [
            {
              source: 'Twitter',
              text: 'This is a test negative mention for demonstration purposes.',
              sentiment: 'negative',
              score: -0.8
            }
          ]
        );
        break;
        
      case 'weekly_report':
        // Send test weekly report
        result = await notificationManager.emailService.sendWeeklyReport(
          req.user.email,
          {
            weekRange: 'Test Week',
            totalMentions: 42,
            avgSentiment: 3.2,
            brands: [
              { name: 'Test Brand 1', mentions: 25, sentiment: 3.5 },
              { name: 'Test Brand 2', mentions: 17, sentiment: 2.9 }
            ]
          }
        );
        break;
        
      case 'new_mention':
        // Send test new mention alert
        result = await notificationManager.emailService.sendNewMentionAlert(
          req.user.email,
          'Test Brand',
          {
            source: 'Reddit',
            text: 'This is a test mention for demonstration purposes.',
            sentiment: 'negative',
            score: -0.6
          }
        );
        break;
        
      case 'system':
        // Send test system notification
        result = await notificationManager.emailService.sendSystemNotification(
          req.user.email,
          'account_created',
          'This is a test system notification.',
          {
            additionalInfo: 'This is for testing purposes only.',
            actionUrl: process.env.CLIENT_URL || 'https://rageradar.com',
            actionText: 'Go to Dashboard'
          }
        );
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid notification type' });
    }
    
    if (result.success) {
      res.json({ 
        message: 'Test notification sent successfully',
        emailId: result.data.id 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send test notification',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

/**
 * Get notification history
 */
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit = 50, offset = 0 } = req.query;
    
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    const notificationsSnapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();
    
    const notifications = notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
    
    res.json({ notifications });
  } catch (error) {
    console.error('Error getting notification history:', error);
    res.status(500).json({ error: 'Failed to get notification history' });
  }
});

/**
 * Manually trigger weekly reports (admin only)
 */
router.post('/trigger-weekly-reports', authenticateUser, async (req, res) => {
  try {
    // Check if user is admin (you might want to implement proper admin check)
    if (!req.user.email.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const results = await notificationManager.sendWeeklyReports();
    
    res.json({ 
      message: 'Weekly reports triggered',
      results 
    });
  } catch (error) {
    console.error('Error triggering weekly reports:', error);
    res.status(500).json({ error: 'Failed to trigger weekly reports' });
  }
});

/**
 * Send welcome email (typically called after user registration)
 */
router.post('/welcome', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { userData } = req.body;
    
    // Get user data from Firestore if not provided
    let userInfo = userData;
    if (!userInfo) {
      const admin = require('firebase-admin');
      const db = admin.firestore();
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      userInfo = userDoc.data();
    }
    
    const result = await notificationManager.sendWelcomeEmail(userId, userInfo);
    
    if (result.success) {
      res.json({ 
        message: 'Welcome email sent successfully',
        emailId: result.data.id 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send welcome email',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ error: 'Failed to send welcome email' });
  }
});

/**
 * Send password reset email
 */
router.post('/password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Generate password reset link (you might want to use Firebase Auth for this)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetLink = `${process.env.CLIENT_URL || 'https://rageradar.com'}/reset-password-form?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Store reset token in database with expiration (1 hour)
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    await db.collection('password_resets').add({
      email,
      token: resetToken,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      used: false
    });
    
    const result = await notificationManager.sendPasswordResetEmail(email, resetLink);
    
    if (result.success) {
      res.json({ 
        message: 'Password reset email sent successfully',
        emailId: result.data.id 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send password reset email',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
});

/**
 * Check notification service health
 */
router.get('/health', async (req, res) => {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        resend: !!process.env.RESEND_API_KEY,
        firebase: true
      }
    };
    
    res.json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});

module.exports = router;