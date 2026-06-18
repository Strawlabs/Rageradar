const EmailService = require('./emailService');
const { supabase } = require('../supabase');

class NotificationManager {
  constructor() {
    this.emailService = new EmailService();
    this.supabase = supabase;
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
        
        // Get brand details (derived from analyses)
        const { data: analyses, error: brandError } = await this.supabase
          .from('analyses')
          .select('user_id, brand_name')
          .eq('brand_id', brandId)
          .limit(1);

        if (brandError || !analyses || analyses.length === 0) return;
        
        const brandData = {
          userId: analyses[0].user_id,
          name: analyses[0].brand_name
        };
        const userId = brandData.userId;
        
        // Get user notification preferences
        const { data: userData, error: userError } = await this.supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError || !userData) return;
        
        // Check if user has rage alerts enabled
        const prefs = userData.notifications || { rageAlerts: { enabled: true } };
        if (prefs.rageAlerts?.enabled === false) {
          console.log('User has rage alerts disabled');
          return;
        }
        
        // Get recent negative mentions from latest analysis
        const { data: latestAnalyses } = await this.supabase
          .from('analyses')
          .select('search_results')
          .eq('brand_id', brandId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        let mentions = [];
        if (latestAnalyses && latestAnalyses.length > 0) {
          const list = latestAnalyses[0].search_results || [];
          mentions = list.filter(m => m.sentiment === 'negative').slice(0, 5);
        }
        
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
      
      // Get all users
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*');

      if (error || !users) return [];
      
      // Filter users with weekly reports enabled
      const enabledUsers = users.filter(u => {
        const prefs = u.notifications || { weeklyReports: { enabled: true } };
        return prefs.weeklyReports?.enabled !== false;
      });
      
      const results = [];
      
      for (const userData of enabledUsers) {
        const userId = userData.id;
        
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
      const { data: analyses, error: brandError } = await this.supabase
        .from('analyses')
        .select('user_id, brand_name')
        .eq('brand_id', brandId)
        .limit(1);

      if (brandError || !analyses || analyses.length === 0) return;
      
      const brandData = {
        userId: analyses[0].user_id,
        name: analyses[0].brand_name
      };
      const userId = brandData.userId;
      
      // Get user notification preferences
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !userData) return;
      
      // Check if user has mention alerts enabled
      const prefs = userData.notifications || { mentionAlerts: { enabled: true } };
      if (prefs.mentionAlerts?.enabled === false) {
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
        await this.supabase
          .from('notifications')
          .insert({
            user_id: null,
            title: 'Password Reset Sent',
            message: `Password reset email sent to ${userEmail}.`,
            type: 'password_reset',
            read: false,
            created_at: new Date().toISOString()
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
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !userData) return;
      
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
    
    // Get user's unique brand names from analyses
    const { data: analyses, error } = await this.supabase
      .from('analyses')
      .select('brand_id, brand_name')
      .eq('user_id', userId);
    
    const uniqueBrands = [];
    const seen = new Set();
    if (analyses) {
      analyses.forEach(row => {
        if (row.brand_name && !seen.has(row.brand_name.toLowerCase())) {
          seen.add(row.brand_name.toLowerCase());
          uniqueBrands.push({
            id: row.brand_id,
            name: row.brand_name
          });
        }
      });
    }
    
    const brands = [];
    let totalMentions = 0;
    let totalSentiment = 0;
    let sentimentCount = 0;
    
    for (const brand of uniqueBrands) {
      // Get analyses for this brand in the last week
      const { data: weeklyAnalyses } = await this.supabase
        .from('analyses')
        .select('search_results, weighted_sentiment_score')
        .eq('brand_id', brand.id)
        .gte('created_at', oneWeekAgo.toISOString());
      
      let brandMentions = 0;
      let brandSentiment = 0;
      if (weeklyAnalyses && weeklyAnalyses.length > 0) {
        weeklyAnalyses.forEach(row => {
          brandMentions += (row.search_results || []).length;
          brandSentiment += row.weighted_sentiment_score;
        });
        brandSentiment = brandSentiment / weeklyAnalyses.length;
      }
      
      brands.push({
        name: brand.name,
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
      let title = 'Notification';
      let message = '';
      if (type === 'rage_spike') {
        title = 'Rage Spike Alert';
        message = `Rage spike detected for brand: ${data.brandName || ''}.`;
      } else if (type === 'weekly_report') {
        title = 'Weekly Report Ready';
        message = `Weekly report for ${data.reportData?.weekRange || ''} is ready.`;
      } else if (type === 'new_mention') {
        title = 'New Negative Mention';
        message = `New critical mention detected for brand: ${data.brandName || ''}.`;
      } else if (type === 'welcome') {
        title = 'Welcome to RageRadar';
        message = 'Thank you for signing up for RageRadar!';
      } else {
        title = 'System Notification';
        message = data.message || 'System alert';
      }

      await this.supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          read: false,
          created_at: new Date().toISOString()
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
      const { data: userData, error } = await this.supabase
        .from('users')
        .select('notifications')
        .eq('id', userId)
        .single();

      if (error || !userData) return null;
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
      const { error } = await this.supabase
        .from('users')
        .update({
          notifications: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      console.log(`✅ Updated notification preferences for user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = NotificationManager;