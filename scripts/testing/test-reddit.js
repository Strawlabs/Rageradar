// Script to test Reddit integration configuration and behavior
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../server/.env') });

const RedditIntegration = require('../../server/integrations/redditIntegration');
const logger = require('../../server/utils/logger');

async function testReddit() {
    console.log('🧪 Testing Reddit Integration...\n');

    const reddit = new RedditIntegration();

    // 1. Check Configuration Status
    console.log('1. Checking configuration status:');
    const isConfigured = reddit.isConfigured();
    console.log(`   Configured: ${isConfigured ? '✅ YES' : '❌ NO'}`);
    console.log(`   Client ID: ${process.env.REDDIT_CLIENT_ID ? 'Set' : 'Not set'}`);
    console.log(`   Client Secret: ${process.env.REDDIT_CLIENT_SECRET ? 'Set' : 'Not set'}`);
    console.log(`   Refresh Token: ${process.env.REDDIT_REFRESH_TOKEN ? 'Set' : 'Not set'}`);
    console.log(`   Username: ${process.env.REDDIT_USERNAME || 'Not set'}`);
    console.log(`   Password: ${process.env.REDDIT_PASSWORD ? 'Set' : 'Not set'}`);

    // 2. Check Integration Status
    console.log('\n2. Integration Status Info:');
    const status = reddit.getStatus();
    console.log(JSON.stringify(status, null, 2));

    // 3. Test Search
    console.log('\n3. Triggering search for brand "Apple":');
    if (!isConfigured) {
        console.log('   ⚠️  Reddit is NOT configured. The integration should gracefully bypass and return an empty array without throwing any errors.');
    }

    try {
        const mentions = await reddit.searchBrand('Apple', { limit: 5 });
        console.log(`   ✅ Search completed successfully!`);
        console.log(`   📊 Mentions found: ${mentions.length}`);
        if (mentions.length > 0) {
            console.log('   Sample Mention:');
            console.log(JSON.stringify(mentions[0], null, 2));
        }
    } catch (error) {
        console.log(`   ❌ Search failed: ${error.message}`);
    }
}

testReddit().catch(console.error);
