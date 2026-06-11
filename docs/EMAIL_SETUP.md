# 📧 Email Notifications Setup Guide

RageRadar uses [Resend](https://resend.com) for reliable email delivery. This guide will help you set up email notifications.

## 🚀 Quick Setup

### 1. Create Resend Account
1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email address
3. Complete the onboarding process

### 2. Get API Key
1. In your Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it "RageRadar Production" (or similar)
4. Copy the API key (starts with `re_`)

### 3. Configure Domain (Optional but Recommended)
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow DNS setup instructions
5. Wait for verification (usually takes a few minutes)

### 4. Update Environment Variables
Add these to your `server/.env` file:

```bash
# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
CLIENT_URL=https://yourdomain.com
```

**Important Notes:**
- If you haven't set up a custom domain, use `onboarding@resend.dev` as FROM_EMAIL
- CLIENT_URL should be your frontend URL for email links

### 5. Test Email Setup
1. Start your server: `npm run dev`
2. **Test Welcome Email**: Create a new account to receive welcome email
3. **Test Password Reset**: Go to `/reset-password` and enter your email
4. **Test Notifications**: Go to Settings → Notifications and click test buttons
5. Check your inbox (and spam folder)

## 📋 Email Types

RageRadar sends these types of emails:

### 🎉 Welcome Emails
- **When**: Immediately after user registration
- **Frequency**: Once per user
- **Content**: Getting started guide, trial information, feature highlights

### 🔒 Password Reset
- **When**: User requests password reset
- **Frequency**: On-demand
- **Content**: Secure reset link (expires in 1 hour)

### 🚨 Rage Spike Alerts
- **When**: Sentiment drops 20%+ from previous measurement
- **Frequency**: Real-time (as detected)
- **Content**: Current vs previous scores, recent negative mentions

### 📊 Weekly Reports
- **When**: Every Monday at 9 AM
- **Frequency**: Weekly
- **Content**: Summary of all brands, mention counts, sentiment trends

### 🔍 New Mention Alerts
- **When**: Important negative mentions or high-impact positive mentions detected
- **Frequency**: Real-time (filtered for importance)
- **Content**: Mention details, source, sentiment analysis

### 📢 System Notifications
- **When**: Account events, billing issues, security alerts
- **Frequency**: As needed
- **Content**: Account-related information and actions

## ⚙️ Configuration Options

### Notification Preferences
Users can control notifications in **Settings → Notifications**:
- Enable/disable each notification type
- Test notifications before enabling
- View notification history

### Scheduling
Automated notifications run on these schedules:
- **Rage Spike Monitoring**: Every 30 minutes
- **Weekly Reports**: Mondays at 9 AM EST
- **Daily Summaries**: Daily at 6 PM EST (if enabled)

### Rate Limiting
- Rage spike alerts: Max 1 per brand per hour
- Mention alerts: Max 5 per brand per day
- System notifications: No limit (important account info)

## 🔧 Troubleshooting

### Common Issues

**"No token provided" error**
- User needs to be logged in to test notifications
- Check Firebase authentication setup

**"Failed to send email" error**
- Verify RESEND_API_KEY is correct
- Check if FROM_EMAIL domain is verified in Resend
- Ensure server has internet access

**Emails not received**
- Check spam/junk folder
- Verify email address is correct
- Test with different email providers
- Check Resend dashboard for delivery logs

**Scheduled emails not working**
- Verify server is running continuously
- Check server logs for cron job errors
- Ensure timezone settings are correct

### Resend Dashboard
Monitor email delivery in your Resend dashboard:
- **Logs**: See all sent emails and delivery status
- **Analytics**: Track open rates and engagement
- **Domains**: Manage domain verification
- **API Keys**: Manage and rotate keys

## 🔒 Security Best Practices

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables only
   - Rotate keys regularly
   - Use different keys for development/production

2. **Domain Verification**
   - Always verify your sending domain
   - Use DKIM and SPF records
   - Monitor domain reputation

3. **Rate Limiting**
   - Built-in rate limiting prevents spam
   - Monitor sending volume in Resend dashboard
   - Set up alerts for unusual activity

## 📈 Monitoring

### Server Logs
Monitor these log messages:
- `✅ Rage spike alert sent`
- `✅ Weekly report sent`
- `📧 Email notifications: Enabled`

### Resend Dashboard
Track email performance:
- Delivery rates
- Bounce rates
- Spam complaints
- Open rates (if tracking enabled)

### Notification History
Users can view their notification history in the app:
- Go to Settings → Notifications
- View recent notifications and delivery status

## 🆘 Support

If you need help:
1. Check server logs for error messages
2. Verify environment variables are set correctly
3. Test with Resend's API directly using their docs
4. Contact Resend support for delivery issues
5. Check RageRadar documentation for app-specific issues

---

**Next Steps:**
- Set up your Resend account and API key
- Test notifications in development
- Configure your production domain
- Monitor email delivery and user engagement