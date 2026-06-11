#!/bin/bash
# RageRadar Project Reorganization Script
# This script organizes files into a cleaner structure

echo "🚀 Starting RageRadar project reorganization..."
echo ""

# Create directories
echo "📁 Creating directory structure..."
mkdir -p scripts/admin
mkdir -p scripts/testing
mkdir -p scripts/database
mkdir -p scripts/users
mkdir -p archive

# Move admin scripts
echo "📦 Moving admin scripts..."
mv create-admin.js scripts/admin/ 2>/dev/null
mv create-new-admin.js scripts/admin/ 2>/dev/null
mv set-admin-role.js scripts/admin/ 2>/dev/null
mv setup-admin.js scripts/admin/ 2>/dev/null

# Move testing scripts
echo "🧪 Moving testing scripts..."
mv test-api.js scripts/testing/ 2>/dev/null
mv test-apple-search.js scripts/testing/ 2>/dev/null
mv test-apple-september-event.js scripts/testing/ 2>/dev/null
mv test-brands-api.js scripts/testing/ 2>/dev/null
mv test-config.js scripts/testing/ 2>/dev/null
mv test-data-connections.js scripts/testing/ 2>/dev/null
mv test-firebase-signup.js scripts/testing/ 2>/dev/null
mv test-google-search.js scripts/testing/ 2>/dev/null
mv test-optimized-sentiment.js scripts/testing/ 2>/dev/null
mv test-search.js scripts/testing/ 2>/dev/null
mv test-sentiment-directly.js scripts/testing/ 2>/dev/null
mv test-sentiment.js scripts/testing/ 2>/dev/null
mv debug-apple-search.js scripts/testing/ 2>/dev/null

# Move database scripts
echo "💾 Moving database scripts..."
mv clear-all-data.js scripts/database/ 2>/dev/null
mv complete-reset.js scripts/database/ 2>/dev/null
mv simple-reset.js scripts/database/ 2>/dev/null
mv reset-apple-analysis.js scripts/database/ 2>/dev/null
mv force-refresh-brands.js scripts/database/ 2>/dev/null

# Move user scripts
echo "👥 Moving user management scripts..."
mv check-firebase-users.js scripts/users/ 2>/dev/null
mv check-user-brands.js scripts/users/ 2>/dev/null
mv delete-test-user.js scripts/users/ 2>/dev/null
mv delete-user.js scripts/users/ 2>/dev/null

# Move shell scripts
echo "🔧 Moving shell scripts..."
mv restart-client.sh scripts/ 2>/dev/null

# Move documentation to docs folder
echo "📚 Moving documentation..."
mv SEO_IMPLEMENTATION.md docs/ 2>/dev/null
mv SEO_MAINTENANCE_GUIDE.md docs/ 2>/dev/null
mv SEO_FIXES_SUMMARY.md docs/ 2>/dev/null
mv SEO_QUICK_REFERENCE.md docs/ 2>/dev/null
mv DEVELOPMENT_HISTORY.md docs/ 2>/dev/null
mv IMPLEMENTATION_SUMMARY.md docs/ 2>/dev/null
mv COLORFUL_WIDGET_DESIGN_GUIDE.md docs/ 2>/dev/null
mv PROJECT_FILE_ORGANIZATION.md docs/ 2>/dev/null

# Optional: Archive unused reference projects
echo ""
echo "❓ Archive unused reference projects? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "📦 Archiving reference projects..."
    mv design-reference archive/ 2>/dev/null
    mv futuristic-dashboard archive/ 2>/dev/null
    mv globe-component archive/ 2>/dev/null
    echo "✅ Reference projects archived"
else
    echo "⏭️  Skipping archive of reference projects"
fi

# Create README for scripts directory
echo "📝 Creating scripts README..."
cat > scripts/README.md << 'EOF'
# RageRadar Utility Scripts

This directory contains utility scripts for managing the RageRadar application.

## Directory Structure

### `/admin` - Admin Management
- `create-admin.js` - Create new admin user
- `create-new-admin.js` - Alternative admin creation
- `set-admin-role.js` - Set admin role for existing user
- `setup-admin.js` - Complete admin setup

### `/testing` - Testing & Debugging
- `test-api.js` - Test API endpoints
- `test-brands-api.js` - Test brand API
- `test-config.js` - Test configuration
- `test-firebase-signup.js` - Test Firebase authentication
- `test-search.js` - Test search functionality
- `test-sentiment.js` - Test sentiment analysis
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

## Usage

Run scripts from the project root:

```bash
# Example: Create admin user
node scripts/admin/create-admin.js

# Example: Test API
node scripts/testing/test-api.js

# Example: Reset database
node scripts/database/simple-reset.js
```

## Security Note

⚠️ Many of these scripts have direct database access. Use with caution in production!
EOF

echo ""
echo "✅ Reorganization complete!"
echo ""
echo "📊 Summary:"
echo "  ✅ Scripts organized into /scripts directory"
echo "  ✅ Documentation moved to /docs directory"
echo "  ✅ Root directory cleaned up"
echo ""
echo "⚠️  IMPORTANT: Check for any broken import paths in your code!"
echo ""
echo "🔒 SECURITY REMINDER:"
echo "  - Move Firebase credentials to .env file"
echo "  - Remove rageradar-*-firebase-adminsdk-*.json from root"
echo "  - Verify .gitignore includes sensitive files"
echo ""
echo "🎉 Your project is now better organized!"
