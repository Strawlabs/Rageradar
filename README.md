# RageRadar 🎯

**Know how your audience really feels — from Reddit to Product Hunt**

RageRadar is a microSaaS application that analyzes public emotional sentiment about your company across multiple platforms using AI-powered emotion detection.

## Features

- **Multi-Platform Crawling**: Scans 27+ platforms including Reddit, Twitter, YouTube, TikTok, Amazon, Glassdoor, and more
- **AI Emotion Detection**: Uses Hugging Face models to detect emotions in mentions
- **Visual Dashboard**: Pie charts and emotion insights with real-time analysis
- **Slack Alerts**: Get notified when negative sentiment spikes (Pro plan)
- **CSV Export**: Download detailed reports (Pro plan)
- **Flexible Pricing**: Free trial, Starter, Pro, and Enterprise plans

## Tech Stack

- **Frontend**: React 18 + TailwindCSS + Chart.js
- **Backend**: Node.js + Express
- **Auth**: Firebase Authentication + Firestore
- **Crawling**: Google Custom Search API
- **AI**: Hugging Face Transformers (emotion-english-distilroberta-base)
- **Database**: Firebase Firestore

## Quick Start

1. **Install dependencies:**
```bash
npm run install-all
```

2. **Set up environment variables:**
   - Copy `client/.env.example` to `client/.env`
   - Copy `server/.env.example` to `server/.env`
   - Fill in your API keys and configuration

3. **Start development servers:**
```bash
npm run dev
```

This will start both the React client (port 3000) and Node.js server (port 5000) concurrently.

## Environment Setup

### Required API Keys

1. **Firebase Project**:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Generate service account key for server
   - Get web app config for client

2. **Google Custom Search API**:
   - Create a Custom Search Engine at https://cse.google.com
   - Configure to search specific domains (Reddit, Twitter, etc.)
   - Get API key from Google Cloud Console

3. **Hugging Face API**:
   - Sign up at https://huggingface.co
   - Generate API token from settings

### Client Environment (.env)
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Server Environment (.env)
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
GOOGLE_CSE_API_KEY=your_google_cse_api_key
GOOGLE_CSE_ID=your_custom_search_engine_id
HUGGING_FACE_API_KEY=your_hugging_face_api_key
PORT=5000
```

## Project Structure

```
rageradar/
├── client/                 # React frontend
│   ├── public/
│   │   ├── index.html     # SEO-optimized HTML
│   │   ├── sitemap.xml    # SEO sitemap
│   │   ├── robots.txt     # Crawler directives
│   │   └── manifest.json  # PWA manifest
│   ├── src/
│   │   ├── components/    # React components (100+)
│   │   │   ├── SEOHead.js
│   │   │   ├── FAQSection.js
│   │   │   ├── KimolaStyleLandingPage.js
│   │   │   └── [other components]
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utilities (including seoTest.js)
│   │   ├── lib/           # Libraries
│   │   ├── config/        # Configuration
│   │   ├── App.js
│   │   ├── index.js
│   │   └── firebase.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                # Node.js backend
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Server utilities
│   ├── index.js           # Express server
│   ├── searchEngine.js    # Search functionality
│   ├── sentimentAnalyzer.js # Sentiment analysis
│   └── package.json
├── scripts/               # Utility scripts
│   ├── admin/             # Admin management
│   ├── testing/           # Testing & debugging
│   ├── database/          # Database management
│   └── users/             # User management
├── docs/                  # Documentation
│   ├── SEO_IMPLEMENTATION.md
│   ├── SEO_MAINTENANCE_GUIDE.md
│   ├── EMAIL_SETUP.md
│   └── STRIPE_SETUP.md
├── package.json           # Root package with dev scripts
└── README.md
```

## API Endpoints

- `POST /api/analyze` - Analyze brand sentiment
- `GET /api/brands` - Get user's analyzed brands
- `GET /api/export/:brandId` - Export brand data to CSV (Pro+)
- `GET /api/health` - Health check

## Features by Plan

| Feature | Trial | Starter | Pro | Enterprise |
|---------|-------|---------|-----|------------|
| Brand Analyses | 1 | 3 | 10 | Unlimited |
| Duration | 3 days | Monthly | Monthly | Custom |
| Emotion Dashboard | ✅ | ✅ | ✅ | ✅ |
| Slack Alerts | ❌ | ❌ | ✅ | ✅ |
| CSV Export | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |

## Development Commands

```bash
# Install all dependencies
npm run install-all

# Start both client and server
npm run dev

# Start only server
npm run server

# Start only client  
npm run client

# Build client for production
npm run build

# Test configuration
npm run test-config
```

## Utility Scripts

The `/scripts` directory contains utility scripts for various tasks:

```bash
# Admin management
node scripts/admin/create-admin.js

# Testing
node scripts/testing/test-api.js

# Database management
node scripts/database/simple-reset.js

# User management
node scripts/users/check-firebase-users.js
```

See `scripts/README.md` for complete documentation.

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- **SEO_IMPLEMENTATION.md** - Complete SEO implementation guide
- **SEO_MAINTENANCE_GUIDE.md** - Ongoing SEO maintenance tasks
- **SEO_FIXES_SUMMARY.md** - Summary of SEO optimizations
- **SEO_QUICK_REFERENCE.md** - Quick SEO reference card
- **EMAIL_SETUP.md** - Email configuration guide
- **STRIPE_SETUP.md** - Payment setup guide
- **DEVELOPMENT_HISTORY.md** - Development history
- **PROJECT_FILE_ORGANIZATION.md** - Project structure guide

## How It Works

1. **Brand Input**: User enters company name or website URL
2. **Multi-Platform Search**: Google Custom Search API crawls mentions across 27+ platforms:
   - **Social Media**: Reddit, Twitter, YouTube, Facebook, Instagram, TikTok
   - **Review Platforms**: Trustpilot, Glassdoor, Amazon, Yelp, Sitejabber, G2, Capterra, Gartner
   - **Professional**: Medium, Quora, Stack Overflow, TechCrunch, The Verge, Hacker News
   - **Job Platforms**: Indeed, AmbitionBox
   - **App Stores**: Google Play Store, Apple App Store
   - **Local**: Google Maps, Yelp
   - **Product Discovery**: Product Hunt
   - **Support**: Google Support
3. **AI Emotion Analysis**: Hugging Face model analyzes each mention for emotions
4. **Dashboard Visualization**: Results displayed with charts and insights
5. **Alerts & Export**: Pro users get Slack notifications and CSV exports

## Pricing Plans

- **Free Trial**: 3 days, 1 brand analysis
- **Starter**: $19/mo, 3 brands
- **Pro**: $49/mo, 10 brands + Slack alerts + CSV export
- **Enterprise**: Custom pricing, unlimited brands + API access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details