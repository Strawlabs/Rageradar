const EmailService = require('./emailService');
const admin = require('firebase-admin');

class NotificationManager {
  constructor() {
    this.emailService = new EmailService();
    this.db = admin.firestore();
  }

  /**
   * Check for rage spikes and send alerts
   */
  async checkRageSpikes(brandId, currentSentiment, previousSentiment) {
    try {
      // Define rage spike threshold (20% drop in sentiment)
      const RAGE_THRESHOLD = -20;
      
      if (!previousSentiment || previousSentiment === 0) return;
      
      const changePercent = ((currentSentiment - previousSentiment) / Math.abs(previousSentiment)) * 100;
      
      if (changePercent <= RAGE_THRESHOLD) {
        console.log(`🚨 Rage spike detected for brand ${brandId}: ${changePercent.toFixed(1)}% drop`);
        
        // Get brand details and user email
        const brandDoc = await this.db.collection('brands').doc(brandId).get();
        if (!brandDoc.exists) return;
        
        const brandData = brandDoc.data();
        const userId = brandData.userId;
        
        // Get user notification preferences
        const userDoc = await this.db.collection('users').doc(userId).get();
        if (!userDoc.exists) return;
        
        const userData = userDoc.data();
        
        // Check if user has rage alerts enabled
        if (!userData.notifications?.rageAlerts?.enabled) {
          console.log('User has rage alerts disabled');
          return;
        }
        
        // Get recent negative mentions
        const mentionsSnapshot = await this.db.collection('mentions')
          .where('brandId', '==', brandId)
          .where('sentiment', '==', 'negative')
          .orderBy('timestamp', 'desc')
          .limit(5)
          .get();
        
        const mentions = mentionsSnapshot.docs.map(doc => doc.data());
        
        // Send rage spike alert
        const result = await this.emailService.sendRageSpikeAlert(
          userData.email,
          brandData.name,
          currentSentiment,
          previousSentiment,
          mentions
        );
        
        if (result.success) {
          // Log the alert
          await this.logNotification(userId, 'rage_spike', {
            brandId,
            brandName: brandData.name,
            changePercent,
            emailId: result.data.id
          });
        }
        
        return result;
      }
    } catch (error) {
      console.error('Error checking rage spikes:', error);
    }
  }

  /**
   * Send weekly reports to all users
   */
  async sendWeeklyReports() {
    try {
      console.log('📊 Sending weekly reports...');
      
      // Get all users with weekly reports enabled
      const usersSnapshot = await this.db.collection('users')
        .where('notifications.weeklyReports.enabled', '==', true)
        .get();
      
      const results = [];
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userId = userDoc.id;
        
        try {
          // Generate report data for this user
          const reportData = await this.generateWeeklyReportData(userId);
          
          if (reportData.totalMentions > 0) {
            const result = await this.emailService.sendWeeklyReport(
              userData.email,
              reportData
            );
            
            if (result.success) {
              await this.logNotification(userId, 'weekly_report', {
                reportData,
                emailId: result.data.id
              });
            }
            
            results.push({ userId, success: result.success, error: result.error });
          }
        } catch (error) {
          console.error(`Error sending weekly report to user ${userId}:`, error);
          results.push({ userId, success: false, error: error.message });
        }
      }
      
      console.log(`✅ Weekly reports sent to ${results.filter(r => r.success).length}/${results.length} users`);
      return results;
    } catch (error) {
      console.error('Error sending weekly reports:', error);
      throw error;
    }
  }

  /**
   * Send new mention alerts
   */
  async sendNewMentionAlert(brandId, mention) {
    try {
      // Get brand details
      const brandDoc = await this.db.collection('brands').doc(brandId).get();
      if (!brandDoc.exists) return;
      
      const brandData = brandDoc.data();
      const userId = brandData.userId;
      
      // Get user notification preferences
      const userDoc = await this.db.collection('users').doc(userId).get();
      if (!userDoc.exists) return;
      
      const userData = userDoc.data();
      
      // Check if user has mention alerts enabled
      if (!userData.notifications?.mentionAlerts?.enabled) {
        console.log('User has mention alerts disabled');
        return;
      }
      
      // Only send alerts for negative mentions or high-impact positive mentions
      const shouldAlert = mention.sentiment === 'negative' || 
                         (mention.sentiment === 'positive' && mention.score > 0.8);
      
      if (!shouldAlert) return;
      
      const result = await this.emailService.sendNewMentionAlert(
        userData.email,
        brandData.name,
        mention
      );
      
      if (result.success) {
        await this.logNotification(userId, 'new_mention', {
          brandId,
          brandName: brandData.name,
          mention,
          emailId: result.data.id
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error sending new mention alert:', error);
    }
  }

  /**
   * Send welcome email for new user registration
   */
  async sendWelcomeEmail(userId, userData) {
    try {
      const result = await this.emailService.sendWelcomeEmail(
        userData.email,
        userData
      );
      
      if (result.success) {
        await this.logNotification(userId, 'welcome', {
          userData,
          emailId: result.data.id
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userEmail, resetLink) {
    try {
      const result = await this.emailService.sendPasswordResetEmail(
        userEmail,
        resetLink
      );
      
      if (result.success) {
        // Log without userId since we might not have it during password reset
        await this.db.collection('notifications').add({
          email: userEmail,
          type: 'password_reset',
          data: { resetLink, emailId: result.data.id },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          sent: true
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send system notifications
   */
  async sendSystemNotification(userId, type, message, details = {}) {
    try {
      // Get user email
      const userDoc = await this.db.collection('users').doc(userId).get();
      if (!userDoc.exists) return;
      
      const userData = userDoc.data();
      
      const result = await this.emailService.sendSystemNotification(
        userData.email,
        type,
        message,
        details
      );
      
      if (result.success) {
        await this.logNotification(userId, 'system', {
          type,
          message,
          details,
          emailId: result.data.id
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error sending system notification:', error);
    }
  }

  /**
   * Generate weekly report data for a user
   */
  async generateWeeklyReportData(userId) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Get user's brands
    const brandsSnapshot = await this.db.collection('brands')
      .where('userId', '==', userId)
      .get();
    
    const brands = [];
    let totalMentions = 0;
    let totalSentiment = 0;
    let sentimentCount = 0;
    
    for (const brandDoc of brandsSnapshot.docs) {
      const brandData = brandDoc.data();
      const brandId = brandDoc.id;
      
      // Get mentions for this brand in the last week
      const mentionsSnapshot = await this.db.collection('mentions')
        .where('brandId', '==', brandId)
        .where('timestamp', '>=', oneWeekAgo)
        .get();
      
      const mentions = mentionsSnapshot.docs.map(doc => doc.data());
      const brandMentions = mentions.length;
      
      // Calculate average sentiment for this brand
      let brandSentiment = 0;
      if (mentions.length > 0) {
        const sentimentSum = mentions.reduce((sum, mention) => {
          const score = mention.score || 0;
          return sum + score;
        }, 0);
        brandSentiment = sentimentSum / mentions.length;
      }
      
      brands.push({
        name: brandData.name,
        mentions: brandMentions,
        sentiment: brandSentiment
      });
      
      totalMentions += brandMentions;
      if (brandSentiment !== 0) {
        totalSentiment += brandSentiment;
        sentimentCount++;
      }
    }
    
    const avgSentiment = sentimentCount > 0 ? totalSentiment / sentimentCount : 0;
    
    // Format date range
    const endDate = new Date();
    const startDate = new Date(oneWeekAgo);
    const weekRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    
    return {
      weekRange,
      totalMentions,
      avgSentiment,
      brands: brands.sort((a, b) => b.mentions - a.mentions) // Sort by mention count
    };
  }

  /**
   * Log notification for tracking
   */
  async logNotification(userId, type, data) {
    try {
      await this.db.collection('notifications').add({
        userId,
        type,
        data,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        sent: true
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserNotificationPreferences(userId) {
    try {
      const userDoc = await this.db.collection('users').doc(userId).get();
      if (!userDoc.exists) return null;
      
      const userData = userDoc.data();
      return userData.notifications || {
        rageAlerts: { enabled: true },
        weeklyReports: { enabled: true },
        mentionAlerts: { enabled: true },
        systemAlerts: { enabled: true }
      };
    } catch (error) {
      console.error('Error getting user notification preferences:', error);
      return null;
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserNotificationPreferences(userId, preferences) {
    try {
      await this.db.collection('users').doc(userId).update({
        notifications: preferences,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Updated notification preferences for user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = NotificationManager;