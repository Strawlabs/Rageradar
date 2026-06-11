const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@rageradar.com';
  }

  /**
   * Send a rage spike alert email
   */
  async sendRageSpikeAlert(userEmail, brandName, currentScore, previousScore, mentions) {
    try {
      const scoreChange = ((currentScore - previousScore) / previousScore * 100).toFixed(1);
      
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [userEmail],
        subject: `🚨 Rage Alert: ${brandName} sentiment dropped ${Math.abs(scoreChange)}%`,
        html: this.generateRageSpikeTemplate({
          brandName,
          currentScore,
          previousScore,
          scoreChange,
          mentions: mentions.slice(0, 5) // Top 5 mentions
        })
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error };
      }

      console.log('✅ Rage spike alert sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send weekly summary report
   */
  async sendWeeklyReport(userEmail, reportData) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [userEmail],
        subject: `📊 Weekly RageRadar Report - ${reportData.weekRange}`,
        html: this.generateWeeklyReportTemplate(reportData)
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error };
      }

      console.log('✅ Weekly report sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send new mention alert
   */
  async sendNewMentionAlert(userEmail, brandName, mention) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [userEmail],
        subject: `🔍 New ${mention.sentiment} mention for ${brandName}`,
        html: this.generateNewMentionTemplate({ brandName, mention })
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error };
      }

      console.log('✅ New mention alert sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email for new user registration
   */
  async sendWelcomeEmail(userEmail, userData) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [userEmail],
        subject: '🎉 Welcome to RageRadar - Your Brand Monitoring Journey Starts Now!',
        html: this.generateWelcomeTemplate(userData)
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error };
      }

      console.log('✅ Welcome email sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userEmail, resetLink) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [userEmail],
        subject: '🔒 Reset Your RageRadar Password',
        html: this.generatePasswordResetTemplate({ userEmail, resetLink })
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error };
      }

      console.log('✅ Password reset email sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send system notification
   */
  async sendSystemNotification(userEmail, type, message, details = {}) {
    try {
      const subjects = {
        'account_created': '🎉 Welcome to RageRadar!',
        'billing_issue': '💳 Billing Issue - Action Required',
        'api_limit': '⚠️ API Limit Reached',
        'security_alert': '🔒 Security Alert'
      };

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [userEmail],
        subject: subjects[type] || '📢 RageRadar Notification',
        html: this.generateSystemNotificationTemplate({ type, message, details })
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error };
      }

      console.log('✅ System notification sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate rage spike alert HTML template
   */
  generateRageSpikeTemplate({ brandName, currentScore, previousScore, scoreChange, mentions }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rage Alert - ${brandName}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #ef4444, #f97316); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🚨 Rage Alert</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${brandName} sentiment has dropped significantly</p>
      </div>

      <!-- Alert Summary -->
      <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #dc2626; margin: 0 0 15px 0; font-size: 20px;">Alert Summary</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="font-weight: 600;">Current Score:</span>
          <span style="color: #dc2626; font-weight: bold;">${currentScore.toFixed(1)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="font-weight: 600;">Previous Score:</span>
          <span>${previousScore.toFixed(1)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-weight: 600;">Change:</span>
          <span style="color: #dc2626; font-weight: bold;">${scoreChange}%</span>
        </div>
      </div>

      <!-- Recent Mentions -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #374151; margin: 0 0 15px 0;">Recent Negative Mentions</h3>
        ${mentions.map(mention => `
          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 10px; background: #f9fafb;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">${mention.source || 'Unknown Source'}</div>
            <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">${mention.text}</div>
            <div style="font-size: 12px; color: #9ca3af;">
              Sentiment: <span style="color: #dc2626; font-weight: 600;">${mention.sentiment}</span> | 
              Score: ${mention.score?.toFixed(2) || 'N/A'}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/dashboard" 
           style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
          View Full Analysis →
        </a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>You're receiving this because you have rage alerts enabled for ${brandName}.</p>
        <p>
          <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/settings" style="color: #3b82f6;">Manage Notifications</a> | 
          <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/unsubscribe" style="color: #6b7280;">Unsubscribe</a>
        </p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate weekly report HTML template
   */
  generateWeeklyReportTemplate(reportData) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Weekly RageRadar Report</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">📊 Weekly Report</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${reportData.weekRange}</p>
      </div>

      <!-- Summary Stats -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #0369a1;">${reportData.totalMentions || 0}</div>
          <div style="color: #0369a1; font-size: 14px;">Total Mentions</div>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #059669;">${reportData.avgSentiment?.toFixed(1) || 'N/A'}</div>
          <div style="color: #059669; font-size: 14px;">Avg Sentiment</div>
        </div>
      </div>

      <!-- Brand Performance -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #374151; margin: 0 0 15px 0;">Brand Performance</h3>
        ${(reportData.brands || []).map(brand => `
          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 10px; background: #f9fafb;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-weight: 600; color: #1f2937;">${brand.name}</div>
              <div style="color: ${brand.sentiment >= 0 ? '#059669' : '#dc2626'}; font-weight: bold;">
                ${brand.sentiment?.toFixed(1) || 'N/A'}
              </div>
            </div>
            <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">
              ${brand.mentions || 0} mentions this week
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/reports" 
           style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
          View Full Report →
        </a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Your weekly RageRadar summary</p>
        <p>
          <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/settings" style="color: #3b82f6;">Manage Notifications</a> | 
          <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/unsubscribe" style="color: #6b7280;">Unsubscribe</a>
        </p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate new mention alert template
   */
  generateNewMentionTemplate({ brandName, mention }) {
    const sentimentColor = {
      'positive': '#059669',
      'negative': '#dc2626',
      'neutral': '#6b7280'
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Mention Alert</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🔍 New Mention</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${brandName} was mentioned</p>
      </div>

      <!-- Mention Details -->
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px; background: #f9fafb;">
        <div style="margin-bottom: 15px;">
          <span style="font-weight: 600; color: #374151;">Source:</span>
          <span style="color: #6b7280;">${mention.source || 'Unknown'}</span>
        </div>
        <div style="margin-bottom: 15px;">
          <span style="font-weight: 600; color: #374151;">Sentiment:</span>
          <span style="color: ${sentimentColor[mention.sentiment] || '#6b7280'}; font-weight: bold; text-transform: capitalize;">
            ${mention.sentiment || 'Unknown'}
          </span>
        </div>
        <div style="margin-bottom: 15px;">
          <span style="font-weight: 600; color: #374151;">Content:</span>
        </div>
        <div style="background: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 15px; font-style: italic; color: #4b5563;">
          "${mention.text || 'No content available'}"
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/mentions" 
           style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
          View All Mentions →
        </a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>You're receiving this because you have mention alerts enabled for ${brandName}.</p>
        <p>
          <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/settings" style="color: #3b82f6;">Manage Notifications</a> | 
          <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/unsubscribe" style="color: #6b7280;">Unsubscribe</a>
        </p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate welcome email HTML template
   */
  generateWelcomeTemplate(userData) {
    const firstName = userData.firstName || 'there';
    const companyName = userData.companyName || 'your company';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to RageRadar</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #ef4444, #f97316, #eab308); padding: 40px 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <div style="background: white; width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <span style="color: #ef4444; font-size: 28px; font-weight: bold;">R</span>
        </div>
        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Welcome to RageRadar!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your brand monitoring journey starts now</p>
      </div>

      <!-- Welcome Message -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px;">Hi ${firstName}! 👋</h2>
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 15px;">
          Thank you for joining RageRadar! We're excited to help you monitor and protect ${companyName}'s online reputation.
        </p>
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 15px;">
          Your <strong>3-day free trial</strong> has started, giving you full access to all our features. No credit card required!
        </p>
      </div>

      <!-- Getting Started Steps -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
        <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">🚀 Get Started in 3 Easy Steps</h3>
        
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
            <div style="background: #ef4444; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 15px; flex-shrink: 0;">1</div>
            <div>
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">Add Your First Brand</div>
              <div style="color: #6b7280; font-size: 14px;">Start monitoring mentions of ${companyName} across the web</div>
            </div>
          </div>
          
          <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
            <div style="background: #f97316; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 15px; flex-shrink: 0;">2</div>
            <div>
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">Set Up Alerts</div>
              <div style="color: #6b7280; font-size: 14px;">Get notified when sentiment drops or important mentions appear</div>
            </div>
          </div>
          
          <div style="display: flex; align-items: flex-start;">
            <div style="background: #eab308; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 15px; flex-shrink: 0;">3</div>
            <div>
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px;">Explore Insights</div>
              <div style="color: #6b7280; font-size: 14px;">Discover trends, competitive analysis, and actionable insights</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Highlight -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">✨ What You Get During Your Trial</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px;">
            <div style="color: #dc2626; font-weight: 600; margin-bottom: 5px;">🚨 Rage Spike Alerts</div>
            <div style="color: #7f1d1d; font-size: 14px;">Instant notifications when sentiment drops</div>
          </div>
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 15px;">
            <div style="color: #0369a1; font-weight: 600; margin-bottom: 5px;">📊 Real-time Analytics</div>
            <div style="color: #0c4a6e; font-size: 14px;">Live sentiment tracking and trends</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 15px;">
            <div style="color: #059669; font-weight: 600; margin-bottom: 5px;">🔍 Mention Discovery</div>
            <div style="color: #064e3b; font-size: 14px;">Find mentions across social media and web</div>
          </div>
          <div style="background: #fefbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 15px;">
            <div style="color: #d97706; font-weight: 600; margin-bottom: 5px;">📈 Competitive Intel</div>
            <div style="color: #92400e; font-size: 14px;">Compare against competitors</div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/analyze" 
           style="background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
          Start Monitoring Your Brand →
        </a>
      </div>

      <!-- Support Section -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h4 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px;">Need Help Getting Started?</h4>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">
          Our team is here to help you succeed. Don't hesitate to reach out if you have any questions!
        </p>
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          <a href="mailto:support@rageradar.com" style="color: #3b82f6; text-decoration: none; font-size: 14px;">📧 Email Support</a>
          <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/docs" style="color: #3b82f6; text-decoration: none; font-size: 14px;">📚 Documentation</a>
          <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/help" style="color: #3b82f6; text-decoration: none; font-size: 14px;">❓ Help Center</a>
        </div>
      </div>

      <!-- Trial Info -->
      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <div style="background: #10b981; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
            <span style="font-size: 12px;">✓</span>
          </div>
          <span style="color: #065f46; font-weight: 600;">Your 3-Day Free Trial is Active</span>
        </div>
        <p style="color: #047857; font-size: 14px; margin: 0;">
          Full access to all features • No credit card required • Cancel anytime
        </p>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p style="margin-bottom: 10px;">Welcome to the RageRadar family! 🎉</p>
        <p style="margin-bottom: 15px;">
          <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/settings" style="color: #3b82f6;">Manage Account</a> | 
          <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/unsubscribe" style="color: #6b7280;">Unsubscribe</a>
        </p>
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          RageRadar - Brand Monitoring Made Simple<br>
          This email was sent because you created a RageRadar account.
        </p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate password reset HTML template
   */
  generatePasswordResetTemplate({ userEmail, resetLink }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your RageRadar Password</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <div style="background: white; width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <span style="color: #3b82f6; font-size: 28px;">🔒</span>
        </div>
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Password Reset Request</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Secure your RageRadar account</p>
      </div>

      <!-- Reset Message -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 22px;">Reset Your Password</h2>
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 15px;">
          We received a request to reset the password for your RageRadar account associated with <strong>${userEmail}</strong>.
        </p>
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
          If you made this request, click the button below to reset your password. If you didn't request this, you can safely ignore this email.
        </p>
      </div>

      <!-- Reset Button */
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${resetLink}" 
           style="background: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
          Reset My Password
        </a>
      </div>

      <!-- Alternative Link -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h4 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px;">Button not working?</h4>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
          Copy and paste this link into your browser:
        </p>
        <div style="background: white; border: 1px solid #d1d5db; border-radius: 4px; padding: 10px; word-break: break-all; font-family: monospace; font-size: 12px; color: #374151;">
          ${resetLink}
        </div>
      </div>

      <!-- Security Notice -->
      <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="color: #d97706; font-size: 20px; margin-right: 10px;">⚠️</span>
          <span style="color: #92400e; font-weight: 600;">Security Notice</span>
        </div>
        <ul style="color: #92400e; font-size: 14px; margin: 0; padding-left: 20px;">
          <li>This link will expire in 1 hour for security</li>
          <li>Only use this link if you requested the password reset</li>
          <li>Never share this link with anyone</li>
          <li>If you didn't request this, please ignore this email</li>
        </ul>
      </div>

      <!-- Help Section -->
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h4 style="color: #0369a1; margin: 0 0 10px 0; font-size: 16px;">Need Help?</h4>
        <p style="color: #0c4a6e; font-size: 14px; margin-bottom: 15px;">
          If you're having trouble resetting your password or didn't request this reset, our support team is here to help.
        </p>
        <a href="mailto:support@rageradar.com" style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 600;">
          📧 Contact Support
        </a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p style="margin-bottom: 15px;">
          <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}" style="color: #3b82f6;">RageRadar Dashboard</a> | 
          <a href="mailto:support@rageradar.com" style="color: #6b7280;">Support</a>
        </p>
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          RageRadar - Brand Monitoring Made Simple<br>
          This email was sent because a password reset was requested for your account.
        </p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate system notification template
   */
  generateSystemNotificationTemplate({ type, message, details }) {
    const typeConfig = {
      'account_created': { color: '#059669', icon: '🎉' },
      'billing_issue': { color: '#dc2626', icon: '💳' },
      'api_limit': { color: '#d97706', icon: '⚠️' },
      'security_alert': { color: '#dc2626', icon: '🔒' }
    };

    const config = typeConfig[type] || { color: '#3b82f6', icon: '📢' };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RageRadar Notification</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: ${config.color}; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">${config.icon} System Notification</h1>
      </div>

      <!-- Message -->
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <p style="margin: 0; font-size: 16px; color: #374151;">${message}</p>
        ${details.additionalInfo ? `<p style="margin: 15px 0 0 0; font-size: 14px; color: #6b7280;">${details.additionalInfo}</p>` : ''}
      </div>

      <!-- Action Button -->
      ${details.actionUrl ? `
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${details.actionUrl}" 
           style="background: ${config.color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
          ${details.actionText || 'Take Action'} →
        </a>
      </div>
      ` : ''}

      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>This is an automated message from RageRadar.</p>
        <p>
          <a href="${process.env.CLIENT_URL || 'https://rageradar.com'}/settings" style="color: #3b82f6;">Manage Notifications</a>
        </p>
      </div>
    </body>
    </html>
    `;
  }
}

module.exports = EmailService;