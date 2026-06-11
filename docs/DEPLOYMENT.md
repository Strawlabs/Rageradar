# RageRadar Deployment Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Production environment variables configured
- Domain name with SSL certificate (for production)

### Local Development with Docker
```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5001
```

## Production Deployment Options

### Option 1: Railway (Recommended for Beginners)

**Cost:** ~$5-20/month

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize**
   ```bash
   railway login
   railway init
   ```

3. **Deploy server**
   ```bash
   cd server
   railway up
   ```

4. **Deploy client**
   ```bash
   cd client
   railway up
   ```

5. **Configure environment variables** in Railway dashboard

6. **Set up custom domain** in Railway settings

### Option 2: Vercel (Frontend) + Railway (Backend)

**Cost:** ~$25-40/month

**Frontend (Vercel):**
```bash
npm install -g vercel
cd client
vercel --prod
```

**Backend (Railway):**
```bash
cd server
railway up
```

### Option 3: Docker on VPS (Advanced)

**Cost:** ~$5-10/month (DigitalOcean, Linode, etc.)

1. **SSH into your VPS**
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/rageradar.git
   cd rageradar
   ```

3. **Create production .env**
   ```bash
   cp .env.production.example .env.production
   nano .env.production  # Fill in your values
   ```

4. **Start services**
   ```bash
   docker-compose up -d
   ```

5. **Set up reverse proxy (nginx)**
   - Configure SSL with Let's Encrypt
   - Proxy requests to containers

### Option 4: Google Cloud Run (Serverless)

**Cost:** Pay per use, ~$10-30/month

1. **Install gcloud CLI**
2. **Build and push images to Google Container Registry**
3. **Deploy to Cloud Run**
4. **Configure environment variables**

## Environment Variables Setup

### Required for Production

Create `.env.production` file with:

```bash
# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_client_email

# APIs (PAID TIERS for production)
GOOGLE_CSE_API_KEY=your_paid_tier_key
GOOGLE_CSE_ID=your_search_engine_id
HUGGING_FACE_API_KEY=your_api_key

# Stripe (LIVE KEYS)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# App Config
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
```

## Health Checks

Both services include health check endpoints:

- **Server:** `http://your-domain:5001/api/health`
- **Client:** `http://your-domain:3000/health`

## Monitoring

### Set up monitoring services:

1. **Uptime Monitoring:** UptimeRobot (free)
2. **Error Tracking:** Sentry (see MONITORING.md)
3. **Logs:** Logtail or Papertrail

## SSL/HTTPS Setup

### With Let's Encrypt (Free)

```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Configure nginx to use certificate
```

### With Cloudflare (Recommended)

1. Point domain to Cloudflare
2. Enable SSL/TLS (Full mode)
3. Enable automatic HTTPS rewrites
4. Configure firewall rules

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, Cloudflare)
- Run multiple server instances
- Use Redis for session management

### Database Scaling
- Firestore auto-scales
- Monitor quotas and upgrade as needed
- Consider caching layer (Redis)

## Backup Strategy

### Firestore Backups
```bash
# Enable automated backups in Firebase Console
# Settings → Backups → Schedule daily backups
```

### Code Backups
- GitHub repository (primary)
- Automated daily backups to S3/Cloud Storage

## Rollback Procedure

### Quick Rollback
```bash
# Revert to previous commit
git revert HEAD
git push

# Redeploy
railway up  # or your deployment command
```

### Docker Rollback
```bash
# Use previous image tag
docker-compose down
docker-compose up -d --force-recreate
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs server
docker-compose logs client

# Rebuild without cache
docker-compose build --no-cache
```

### Environment variables not loading
```bash
# Verify .env file exists
ls -la .env.production

# Check docker-compose picks it up
docker-compose config
```

### Port conflicts
```bash
# Change ports in docker-compose.yml
# Default: 3000 (client), 5001 (server)
```

## Security Checklist

- [ ] All environment variables secured
- [ ] HTTPS/SSL enabled
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Firebase security rules reviewed
- [ ] Stripe webhook signatures verified
- [ ] CORS configured for production domain only

## Performance Optimization

- [ ] Enable gzip compression (nginx)
- [ ] Configure CDN (Cloudflare)
- [ ] Optimize images and assets
- [ ] Enable browser caching
- [ ] Monitor and optimize API calls

## Post-Deployment

1. **Test all critical flows:**
   - User registration/login
   - Brand analysis
   - Payment processing
   - Data export

2. **Monitor for 24-48 hours:**
   - Error rates
   - Response times
   - API quota usage
   - User feedback

3. **Set up alerts:**
   - Server down
   - High error rate
   - API quota warnings
   - Payment failures

## Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Review this guide
3. Check platform-specific documentation
4. Contact hosting provider support

---

**Next Steps:**
1. Choose your deployment platform
2. Configure production environment variables
3. Test deployment in staging environment
4. Deploy to production
5. Monitor and optimize
