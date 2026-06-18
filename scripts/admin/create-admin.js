/**
 * Create Admin User Script (Supabase)
 * Creates a new admin user with full privileges
 * 
 * Usage: node scripts/admin/create-admin.js
 */
const { supabase, isMockMode } = require('../_supabase');

async function clearAllUsers() {
  try {
    console.log('🧹 Clearing all existing users...');

    const { data: users, error } = await supabase.from('users').select('id, email');

    if (error) throw error;
    if (!users || users.length === 0) {
      console.log('✅ No users found to delete');
      return;
    }

    for (const user of users) {
      // Delete from auth (if not mock mode)
      if (!isMockMode) {
        await supabase.auth.admin.deleteUser(user.id);
      }
    }

    // Delete all user rows (cascades to related tables)
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log(`✅ Deleted ${users.length} users from Supabase`);
  } catch (error) {
    console.error('❌ Error clearing users:', error.message || error);
  }
}

async function createAdminUser() {
  try {
    console.log('👑 Creating admin user...');
    
    const adminEmail = 'admin@rageradar.com';
    const adminPassword = 'RageRadar2025!';

    let adminUid;

    if (isMockMode) {
      adminUid = 'mock-uid-admin-rageradar-com';
      console.log(`✅ Created mock admin user with UID: ${adminUid}`);
    } else {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { firstName: 'Admin', lastName: 'User' }
      });

      if (error) throw error;
      adminUid = data.user.id;
      console.log(`✅ Created admin user with UID: ${adminUid}`);
    }

    // Create admin user document in database
    const adminData = {
      id: adminUid,
      email: adminEmail,
      first_name: 'Admin',
      last_name: 'User',
      company_name: 'RageRadar Inc.',
      company_email: adminEmail,
      contact_number: '+1-555-ADMIN',
      job_title: 'System Administrator',
      company_size: '1000+',
      role: 'admin',
      plan: 'enterprise',
      max_brands: -1,
      brands_used: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await supabase.from('users').insert(adminData);

    console.log('✅ Created admin user document in database');

    return {
      email: adminEmail,
      password: adminPassword,
      uid: adminUid
    };
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message || error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting admin setup process...\n');
    
    await clearAllUsers();
    console.log('');
    
    const adminCredentials = await createAdminUser();
    
    console.log('\n🎉 Admin setup completed successfully!');
    console.log('\n📋 ADMIN LOGIN CREDENTIALS:');
    console.log('================================');
    console.log(`Email: ${adminCredentials.email}`);
    console.log(`Password: ${adminCredentials.password}`);
    console.log(`UID: ${adminCredentials.uid}`);
    console.log('================================');
    console.log('\n🔑 Admin Features:');
    console.log('• Unlimited brands');
    console.log('• Unlimited analyses');
    console.log('• All premium features enabled');
    console.log('• Real-time alerts');
    console.log('• Visual analytics');
    console.log('• CSV export');
    console.log('• Slack integration');
    console.log('• API access');
    console.log('• Custom reports');
    console.log('• White label options');
    console.log('• Priority support');
    
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
  } catch (error) {
    console.error('❌ Setup failed:', error.message || error);
  } finally {
    process.exit(0);
  }
}

main();