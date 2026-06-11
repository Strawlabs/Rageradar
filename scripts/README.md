# RageRadar Utility Scripts

This directory contains utility scripts for managing the RageRadar application.

## Directory Structure

### `/admin` - Admin Management
- `create-admin.js` - Create new admin user
- `create-new-admin.js` - Alternative admin creation
- `set-admin-role.js` - Set admin role for existing user (if exists)
- `setup-admin.js` - Complete admin setup

### `/testing` - Testing & Debugging
- `test-api.js` - Test API endpoints
- `test-brands-api.js` - Test brand API
- `test-config.js` - Test configuration
- `test-firebase-signup.js` - Test Firebase authentication
- `test-search.js` - Test search functionality
- `test-sentiment.js` - Test sentiment analysis
- `test-sentiment-directly.js` - Direct sentiment testing
- `test-optimized-sentiment.js` - Test optimized sentiment
- `test-google-search.js` - Test Google search integration
- `test-apple-search.js` - Test Apple search
- `test-apple-september-event.js` - Test Apple event analysis
- `test-data-connections.js` - Test data connections
- `debug-apple-search.js` - Debug Apple search issues

### `/database` - Database Management
- `clear-all-data.js` - Clear all database data
- `complete-reset.js` - Complete database reset
- `simple-reset.js` - Simple database reset
- `reset-apple-analysis.js` - Reset Apple analysis data
- `force-refresh-brands.js` - Force refresh brand data

### `/users` - User Management
- `check-firebase-users.js` - List Firebase users
- `check-user-brands.js` - Check user's brands
- `delete-test-user.js` - Delete test user
- `delete-user.js` - Delete specific user

### Root Scripts
- `restart-client.sh` - Restart client development server

## Usage

Run scripts from the project root:

```bash
# Example: Create admin user
node scripts/admin/create-admin.js

# Example: Test API
node scripts/testing/test-api.js

# Example: Reset database
node scripts/database/simple-reset.js

# Example: Check users
node scripts/users/check-firebase-users.js

# Example: Test configuration (via npm)
npm run test-config
```

## Security Note

⚠️ Many of these scripts have direct database access. Use with caution in production!

## Environment Variables

Most scripts require environment variables to be set. Ensure you have:
- `.env` file in the root directory
- `server/.env` file for server-specific variables
- `client/.env` file for client-specific variables

## Troubleshooting

If a script fails:
1. Check that all dependencies are installed (`npm run install-all`)
2. Verify environment variables are set correctly
3. Ensure Firebase credentials are properly configured
4. Check the script's console output for specific error messages
