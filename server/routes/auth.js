const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const NotificationManager = require('../services/notificationManager');
const { authenticateUser } = require('../middleware/auth');

const notificationManager = new NotificationManager();
const db = admin.firestore();

/**
 * Complete user registration (called after Firebase Auth signup)
 * This endpoint handles post-registration tasks like sending welcome emails
 */
router.post('/complete-registration', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = req.user.email;
    
    console.log(`📧 Completing registration for user: ${userEmail} (${userId})`);
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User document not found' });
    }
    
    const userData = userDoc.data();
    
    // Send welcome email
    const welcomeResult = await notificationManager.sendWelcomeEmail(userId, userData);
    
    if (welcomeResult.success) {
      console.log(`✅ Welcome email sent to ${userEmail}`);
      
      // Update user document to mark welcome email as sent
      await db.collection('users').doc(userId).update({
        welcomeEmailSent: true,
        welcomeEmailSentAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
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
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User document not found' });
    }
    
    const userData = userDoc.data();
    
    // Send welcome email
    const result = await notificationManager.sendWelcomeEmail(userId, userData);
    
    if (result.success) {
      // Update user document
      await db.collection('users').doc(userId).update({
        welcomeEmailSent: true,
        welcomeEmailSentAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
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
    const resetDoc = await db.collection('password_resets')
      .where('email', '==', email)
      .where('token', '==', token)
      .where('used', '==', false)
      .limit(1)
      .get();
    
    if (resetDoc.empty) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    const resetData = resetDoc.docs[0].data();
    
    // Check if token is expired (1 hour)
    if (resetData.expiresAt.toDate() < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }
    
    // Update user password in Firebase Auth
    try {
      // Get user by email
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // Update password
      await admin.auth().updateUser(userRecord.uid, {
        password: newPassword
      });
      
      // Mark token as used
      await resetDoc.docs[0].ref.update({
        used: true,
        usedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Send confirmation email (optional)
      const result = await notificationManager.sendSystemNotification(
        userRecord.uid,
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
      console.error('Firebase Auth error:', authError);
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
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User document not found' });
    }
    
    const userData = userDoc.data();
    
    res.json({
      userId,
      email: userData.email,
      welcomeEmailSent: userData.welcomeEmailSent || false,
      welcomeEmailSentAt: userData.welcomeEmailSentAt?.toDate() || null,
      registrationCompleted: true,
      trialStatus: {
        plan: userData.plan,
        trialEndsAt: userData.trialEndsAt?.toDate() || null,
        isExpired: userData.trialEndsAt ? new Date() > userData.trialEndsAt.toDate() : false
      }
    });
  } catch (error) {
    console.error('Error getting registration status:', error);
    res.status(500).json({ error: 'Failed to get registration status' });
  }
});

module.exports = router;