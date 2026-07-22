const EmailService = require('./emailService');
const { supabase } = require('../supabase');
const axios = require('axios');

class NotificationManager {
  constructor() {
    this.emailService = new EmailService();
    this.supabase = supabase;
    this.recentAlertsCache = new Map();
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
      let title = data?.title || 'Notification';
      let message = data?.message || '';
      if (!data?.title && !data?.message) {
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
          message = 'System alert';
        }
      }

      const fullMessage = data.evidenceUrl && !message.includes(data.evidenceUrl)
        ? `${message} Evidence: ${data.evidenceUrl}`
        : message;

      await this.supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message: fullMessage,
          type,
          read: false,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Check if alert is a duplicate within the cooldown window (default 60 mins)
   */
  async isDuplicateAlert(userId, brandId, alertType, cooldownMinutes = 60) {
    const key = `${userId}_${brandId}_${alertType}`;
    const now = Date.now();
    const cooldownMs = cooldownMinutes * 60 * 1000;

    if (this.recentAlertsCache.has(key)) {
      const lastTriggered = this.recentAlertsCache.get(key);
      if (now - lastTriggered < cooldownMs) {
        console.log(`Suppressed duplicate alert ${alertType} for brand ${brandId} (in memory cooldown)`);
        return true;
      }
    }

    try {
      const cutoffIso = new Date(now - cooldownMs).toISOString();
      const { data, error } = await this.supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', alertType)
        .ilike('message', `%${brandId}%`)
        .gte('created_at', cutoffIso)
        .limit(1);

      if (!error && data && data.length > 0) {
        this.recentAlertsCache.set(key, now);
        console.log(`Suppressed duplicate database alert ${alertType} for brand ${brandId}`);
        return true;
      }
    } catch (err) {
      // If database check fails, rely on in-memory cache
    }

    this.recentAlertsCache.set(key, now);
    return false;
  }

  /**
   * Send Slack Notification formatted cleanly with Block Kit & evidence links
   */
  async sendSlackNotification(webhookUrl, brandData, alertPayload) {
    if (!webhookUrl) return { success: false, error: 'No Slack webhook provided' };
    try {
      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 ${alertPayload.title || 'RageRadar Alert'}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Brand:* ${brandData.name || brandData.brandName}\n*Severity:* ${alertPayload.severity || 'high'}\n*Current Value:* ${alertPayload.currentValue || 'N/A'}\n*Description:* ${alertPayload.description || ''}`
          }
        }
      ];

      if (alertPayload.evidenceUrl) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<${alertPayload.evidenceUrl}|🔍 View Evidence Mentions & Analysis>`
          }
        });
      }

      await axios.post(webhookUrl, {
        text: `🚨 ${alertPayload.title || 'RageRadar Alert'}: ${brandData.name}`,
        blocks
      }, { timeout: 8000 });

      return { success: true };
    } catch (error) {
      console.error('Slack notification delivery failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Generic Webhook Notification
   */
  async sendWebhookNotification(webhookUrl, brandData, alertPayload) {
    if (!webhookUrl) return { success: false, error: 'No custom webhook provided' };
    try {
      await axios.post(webhookUrl, {
        event: alertPayload.type || 'rage_alert',
        brand: brandData.name || brandData.brandName,
        brandId: brandData.id || brandData.brandId,
        alert: alertPayload,
        timestamp: new Date().toISOString()
      }, { timeout: 8000 });

      return { success: true };
    } catch (error) {
      console.error('Webhook notification delivery failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Dispatch multi-channel alert with deduplication and evidence linking
   */
  async dispatchAlert(userId, brandData, alertPayload, channels = ['email', 'web_dashboard']) {
    const brandId = brandData.id || brandData.brandId || brandData.name || 'unknown';
    const alertType = alertPayload.type || 'alert';

    if (await this.isDuplicateAlert(userId, brandId, alertType)) {
      return { success: false, duplicate: true, message: 'Suppressed by deduplication engine' };
    }

    const results = {};
    const evidenceUrl = alertPayload.evidenceUrl || `/dashboard/mentions?brand=${encodeURIComponent(brandData.name || brandData.brandName || '')}&severity=${alertPayload.severity || 'high'}`;
    const enrichedPayload = {
      ...alertPayload,
      evidenceUrl,
      timestamp: new Date().toISOString()
    };

    let userData = null;
    try {
      const { data } = await this.supabase.from('users').select('*').eq('id', userId).single();
      userData = data;
    } catch (err) {}

    const userEmail = userData?.email;
    const prefs = userData?.notifications || {};

    // 1. Web Dashboard (In-app notification)
    if (channels.includes('web_dashboard') || channels.includes('web') || !channels || channels.length === 0) {
      try {
        await this.logNotification(userId, alertType, {
          title: alertPayload.title,
          message: `${alertPayload.description || ''}`,
          brandId,
          brandName: brandData.name || brandData.brandName,
          evidenceUrl,
          currentValue: alertPayload.currentValue
        });
        results.web_dashboard = { success: true };
      } catch (err) {
        results.web_dashboard = { success: false, error: err.message };
      }
    }

    // 2. Email
    if (channels.includes('email') && userEmail) {
      try {
        if (alertType === 'rage_spike' || alertPayload.severity === 'critical') {
          await this.emailService.sendRageSpikeAlert(
            userEmail,
            brandData.name || brandData.brandName,
            alertPayload.currentSentiment || 0,
            alertPayload.previousSentiment || 0,
            alertPayload.topMentions || []
          );
        } else {
          await this.emailService.sendSystemNotification(
            userEmail,
            alertType,
            `${alertPayload.title}: ${alertPayload.description}`,
            { actionUrl: evidenceUrl, actionText: 'View Evidence' }
          );
        }
        results.email = { success: true };
      } catch (err) {
        results.email = { success: false, error: err.message };
      }
    }

    // 3. Slack
    if (channels.includes('slack')) {
      const webhookUrl = alertPayload.slackWebhook || prefs.slackWebhook || userData?.slack_webhook || process.env.SLACK_WEBHOOK_URL;
      if (webhookUrl) {
        results.slack = await this.sendSlackNotification(webhookUrl, brandData, enrichedPayload);
      } else {
        results.slack = { success: false, error: 'No Slack webhook configured' };
      }
    }

    // 4. Webhook
    if (channels.includes('webhook')) {
      const webhookUrl = alertPayload.customWebhook || prefs.customWebhook || userData?.webhook_url || process.env.CUSTOM_WEBHOOK_URL;
      if (webhookUrl) {
        results.webhook = await this.sendWebhookNotification(webhookUrl, brandData, enrichedPayload);
      } else {
        results.webhook = { success: false, error: 'No custom webhook configured' };
      }
    }

    return { success: true, duplicate: false, results, evidenceUrl };
  }

  /**
   * Check and trigger scan alerts after a research run completes
   */
  async checkAndTriggerScanAlerts(userId, brandId, analysis) {
    if (!analysis || !userId) return null;

    const brandData = {
      id: brandId,
      name: analysis.brandName || analysis.brand_name || 'Brand'
    };

    const rageIndex = analysis.rageIndex || analysis.rage_index || 0;
    const totalMentions = analysis.totalMentions || analysis.total_mentions || 0;
    const topMentions = (analysis.searchResults || analysis.search_results || [])
      .filter(m => m.sentiment === 'negative' || m.rageIndex >= 60)
      .slice(0, 5);

    let userData = null;
    try {
      const { data } = await this.supabase.from('users').select('notifications, email, plan').eq('id', userId).single();
      userData = data;
    } catch (err) {}

    const prefs = userData?.notifications || {};
    const activeChannels = prefs.channels || ['email', 'web_dashboard', 'slack', 'webhook'];

    let alertTriggered = null;

    if (rageIndex >= 70 || analysis.rageAlert || analysis.rage_alert) {
      const payload = {
        type: 'rage_spike',
        title: 'Critical Rage Index Alert',
        description: `Rage Index for ${brandData.name} breached critical threshold (${Math.round(rageIndex)}%)`,
        currentValue: `${Math.round(rageIndex)}%`,
        severity: 'critical',
        topMentions,
        slackWebhook: prefs.slackWebhook,
        customWebhook: prefs.customWebhook
      };
      alertTriggered = await this.dispatchAlert(userId, brandData, payload, activeChannels);
    } else if (totalMentions >= 1000) {
      const payload = {
        type: 'volume_spike',
        title: 'High Mention Volume Alert',
        description: `${brandData.name} mention volume surged to ${totalMentions.toLocaleString()} mentions`,
        currentValue: `${totalMentions.toLocaleString()}`,
        severity: 'high',
        topMentions,
        slackWebhook: prefs.slackWebhook,
        customWebhook: prefs.customWebhook
      };
      alertTriggered = await this.dispatchAlert(userId, brandData, payload, activeChannels);
    }

    return alertTriggered;
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
        systemAlerts: { enabled: true },
        channels: ['email', 'web_dashboard']
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