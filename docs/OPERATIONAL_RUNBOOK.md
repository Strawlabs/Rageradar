# 📋 RageRadar Operational Runbook

## Quick Reference

**Emergency Contacts:**
- On-Call Engineer: [Your Phone]
- Backup Contact: [Backup Phone]
- Sentry Alerts: [Email]
- Uptime Alerts: [Email]

**Critical Links:**
- Production: https://yourdomain.com
- Admin Panel: https://yourdomain.com/admin
- Sentry: https://sentry.io/organizations/your-org
- Firebase Console: https://console.firebase.google.com
- Stripe Dashboard: https://dashboard.stripe.com

---

## Daily Operations

### Morning Checklist (5 minutes)

```bash
# 1. Check application health
curl https://yourdomain.com/api/health

# 2. Review overnight errors (Sentry)
# Go to Sentry dashboard → Last 24 hours

# 3. Check server logs
tail -n 100 server/logs/error-$(date +%Y-%m-%d).log

# 4. Verify backups completed
# Check Firebase Console → Backups

# 5. Monitor API quota usage
# Google Cloud Console → APIs → Custom Search API
```

### Weekly Checklist (15 minutes)

- [ ] Review Sentry error trends
- [ ] Check API quota usage (should be < 80%)
- [ ] Review slow endpoints (> 2s response time)
- [ ] Check disk space on servers
- [ ] Review user feedback/support tickets
- [ ] Update dependencies if needed
- [ ] Review security logs for anomalies

### Monthly Checklist (1 hour)

- [ ] Test backup restoration
- [ ] Review and update documentation
- [ ] Security audit review
- [ ] Performance optimization review
- [ ] Cost analysis and optimization
- [ ] Update SSL certificates (if manual)
- [ ] Team training on new features

---

## Common Operations

### Deploying Updates

**Standard Deployment:**
```bash
# 1. Merge to main branch
git checkout main
git pull origin main

# 2. GitHub Actions will automatically:
#    - Run tests
#    - Build Docker images
#    - Deploy to production (if configured)

# 3. Monitor deployment
# Check GitHub Actions → Latest workflow run

# 4. Verify deployment
curl https://yourdomain.com/api/health

# 5. Monitor for errors
# Sentry dashboard → Last 15 minutes
```

**Rollback Procedure:**
```bash
# 1. Identify last working commit
git log --oneline -10

# 2. Revert to previous version
git revert HEAD
git push origin main

# 3. Or use Docker image tag
docker-compose down
docker-compose up -d --force-recreate

# 4. Verify rollback
curl https://yourdomain.com/api/health
```

### Scaling Operations

**Horizontal Scaling (More Instances):**
```bash
# Railway/Render: Use dashboard to increase replicas
# Docker: Update docker-compose.yml
services:
  server:
    deploy:
      replicas: 3  # Increase from 1
```

**Vertical Scaling (More Resources):**
```bash
# Update instance size in hosting dashboard
# Railway: Settings → Resources → Increase memory/CPU
# Render: Settings → Instance Type → Upgrade
```

### Database Operations

**Check Database Health:**
```bash
# Firebase Console → Firestore → Usage tab
# Monitor:
# - Read/Write operations
# - Storage size
# - Active connections
```

**Manual Backup:**
```bash
gcloud firestore export gs://your-backup-bucket/manual-backup-$(date +%Y%m%d) \
  --project=your-project-id \
  --collection-ids=users,analyses
```

**Restore from Backup:**
```bash
# ⚠️ CAUTION: This overwrites data!
gcloud firestore import gs://your-backup-bucket/backups/YYYYMMDD_HHMMSS \
  --project=your-project-id
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

**Application Health:**
- Uptime: Target 99.9% (< 43 minutes downtime/month)
- Response Time: < 2 seconds average
- Error Rate: < 1% of requests
- API Success Rate: > 99%

**Infrastructure:**
- CPU Usage: < 70% average
- Memory Usage: < 80%
- Disk Space: > 20% free
- Network Latency: < 100ms

**Business Metrics:**
- Active Users: Daily/Weekly/Monthly
- Analyses Performed: Daily count
- Payment Success Rate: > 95%
- API Quota Usage: < 80% of limit

### Alert Thresholds

**Critical (Immediate Action):**
- Application down (UptimeRobot)
- Error rate > 5%
- Payment processing failures
- Database connection failures
- API quota > 95%

**Warning (Review within 1 hour):**
- Response time > 3 seconds
- Error rate > 2%
- Memory usage > 85%
- Disk space < 15%
- API quota > 80%

**Info (Review daily):**
- New error types
- Slow queries
- Unusual traffic patterns

---

## Troubleshooting Guide

### Application Won't Start

**Symptoms:** Server fails to start, health check fails

**Diagnosis:**
```bash
# Check logs
docker-compose logs server

# Common issues:
# - Missing environment variables
# - Port already in use
# - Database connection failure
```

**Solutions:**
```bash
# 1. Verify environment variables
cat .env.production

# 2. Check port availability
lsof -i :5001

# 3. Restart services
docker-compose restart

# 4. Full rebuild
docker-compose down
docker-compose up --build
```

### High Error Rate

**Symptoms:** Sentry showing spike in errors

**Diagnosis:**
```bash
# Check error logs
tail -f server/logs/error-$(date +%Y-%m-%d).log

# Check Sentry for error patterns
# Common errors:
# - API rate limits exceeded
# - Database timeout
# - External API failures
```

**Solutions:**
```bash
# 1. Identify error pattern in Sentry
# 2. Check if external service is down
# 3. Verify API quotas
# 4. Scale if needed
# 5. Deploy fix if bug identified
```

### Slow Performance

**Symptoms:** Response times > 3 seconds

**Diagnosis:**
```bash
# Check HTTP logs for slow endpoints
grep "duration.*[3-9][0-9][0-9][0-9]ms" server/logs/http-*.log

# Check server resources
top
df -h
```

**Solutions:**
```bash
# 1. Identify slow endpoints
# 2. Optimize database queries
# 3. Add caching if needed
# 4. Scale infrastructure
# 5. Enable CDN for static assets
```

### Payment Failures

**Symptoms:** Users reporting payment issues

**Diagnosis:**
```bash
# Check Stripe dashboard for failed payments
# Check webhook logs
grep "webhook" server/logs/combined-$(date +%Y-%m-%d).log

# Verify webhook signature
grep "Webhook signature" server/logs/error-*.log
```

**Solutions:**
```bash
# 1. Verify Stripe webhook endpoint is accessible
curl -X POST https://yourdomain.com/api/billing/webhook

# 2. Check Stripe webhook secret is correct
# 3. Review failed payment details in Stripe
# 4. Contact Stripe support if needed
```

### API Quota Exceeded

**Symptoms:** Google Custom Search API errors

**Diagnosis:**
```bash
# Check API usage in Google Cloud Console
# APIs → Custom Search API → Quotas

# Check logs for rate limit errors
grep "rate limit" server/logs/error-*.log
```

**Solutions:**
```bash
# 1. Upgrade API quota immediately
# 2. Implement caching for repeated searches
# 3. Notify users of temporary limitation
# 4. Monitor usage patterns
```

---

## Incident Response

### Severity Levels

**P0 - Critical (Immediate)**
- Complete service outage
- Data loss or corruption
- Security breach
- Payment processing down

**P1 - High (< 1 hour)**
- Partial service outage
- Major feature broken
- High error rate (> 10%)
- Performance severely degraded

**P2 - Medium (< 4 hours)**
- Minor feature broken
- Moderate error rate (2-10%)
- Performance degraded
- Non-critical bug

**P3 - Low (< 24 hours)**
- Cosmetic issues
- Low error rate (< 2%)
- Feature enhancement
- Documentation update

### Incident Response Process

**1. Detection (0-5 minutes)**
```
- Alert received (Sentry, UptimeRobot, user report)
- Acknowledge alert
- Assess severity
- Notify team if P0/P1
```

**2. Investigation (5-15 minutes)**
```
- Check Sentry for errors
- Review logs
- Check infrastructure status
- Identify root cause
```

**3. Mitigation (15-30 minutes)**
```
- Implement temporary fix if possible
- Rollback if recent deployment
- Scale resources if needed
- Communicate with users if needed
```

**4. Resolution (30+ minutes)**
```
- Deploy permanent fix
- Verify fix in production
- Monitor for recurrence
- Update documentation
```

**5. Post-Mortem (Within 24 hours)**
```
- Document incident timeline
- Identify root cause
- List action items
- Update runbook
- Share learnings with team
```

### Communication Templates

**Status Page Update (P0/P1):**
```
🔴 INVESTIGATING: We're currently experiencing issues with [feature].
Our team is investigating and will provide updates every 15 minutes.

Last updated: [timestamp]
```

**Resolution Update:**
```
✅ RESOLVED: The issue with [feature] has been resolved.
Service is now operating normally. We apologize for the inconvenience.

Root cause: [brief explanation]
Duration: [time]
```

---

## Maintenance Windows

### Scheduled Maintenance

**Best Practices:**
- Schedule during low-traffic hours (2-4 AM local time)
- Notify users 48 hours in advance
- Limit to 2 hours maximum
- Have rollback plan ready

**Maintenance Checklist:**
```
Pre-Maintenance (24 hours before):
- [ ] Notify users via email/banner
- [ ] Create backup
- [ ] Test changes in staging
- [ ] Prepare rollback plan
- [ ] Schedule team availability

During Maintenance:
- [ ] Put site in maintenance mode
- [ ] Execute changes
- [ ] Run smoke tests
- [ ] Verify all systems
- [ ] Remove maintenance mode

Post-Maintenance:
- [ ] Monitor for 1 hour
- [ ] Send completion notification
- [ ] Document changes
- [ ] Update runbook if needed
```

---

## Security Operations

### Daily Security Checks

```bash
# 1. Review failed authentication attempts
grep "AUTH_FAILED" server/logs/combined-*.log | tail -20

# 2. Check for suspicious activity
grep "SUSPICIOUS_ACTIVITY" server/logs/combined-*.log

# 3. Review rate limit violations
grep "rate limit" server/logs/combined-*.log | tail -20

# 4. Check Sentry for security events
# Sentry → Search: "security"
```

### Security Incident Response

**If Security Breach Suspected:**
1. **Immediately:** Isolate affected systems
2. **Within 15 min:** Notify team lead
3. **Within 30 min:** Assess scope of breach
4. **Within 1 hour:** Implement containment
5. **Within 24 hours:** Notify affected users (if required by law)
6. **Within 72 hours:** Full incident report

**Evidence Collection:**
```bash
# Preserve logs
cp -r server/logs/ /secure/incident-$(date +%Y%m%d)/

# Export Firestore data
gcloud firestore export gs://incident-backup-$(date +%Y%m%d)

# Document timeline
# Create incident report with all actions taken
```

---

## Performance Optimization

### Quick Wins

**Enable Caching:**
```javascript
// Add to server/index.js
const cache = new Map();

app.get('/api/cached-endpoint', (req, res) => {
  const cacheKey = req.query.key;
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }
  // ... fetch data
  cache.set(cacheKey, data);
  res.json(data);
});
```

**Database Query Optimization:**
```javascript
// Add indexes in Firestore Console
// Collection: analyses
// Index: userId (Ascending), createdAt (Descending)
```

**CDN for Static Assets:**
```
- Use Cloudflare for free CDN
- Cache static assets for 1 year
- Enable Brotli compression
```

---

## Cost Optimization

### Monthly Cost Review

**Infrastructure:**
- Hosting: $25-50/month
- Database: Included in Firebase
- CDN: Free (Cloudflare)
- Monitoring: Free tier

**APIs:**
- Google Custom Search: $5/month (10k queries)
- Hugging Face: Free tier
- Sentry: Free tier (5k events)

**Optimization Tips:**
1. Monitor API usage to avoid overages
2. Use caching to reduce API calls
3. Optimize images and assets
4. Review and remove unused services
5. Use free tiers where possible

---

## Contacts & Resources

### Emergency Contacts
- **Primary On-Call:** [Name] - [Phone]
- **Secondary On-Call:** [Name] - [Phone]
- **CTO/Tech Lead:** [Name] - [Phone]

### Service Providers
- **Hosting Support:** [Platform] - [Support URL]
- **Stripe Support:** https://support.stripe.com
- **Firebase Support:** https://firebase.google.com/support
- **Sentry Support:** https://sentry.io/support

### Internal Resources
- **Documentation:** `/docs` directory
- **Runbooks:** This file
- **Architecture Diagram:** [Link]
- **Team Wiki:** [Link]

---

**Last Updated:** [Date]  
**Next Review:** [Date + 3 months]  
**Owner:** [Name]
