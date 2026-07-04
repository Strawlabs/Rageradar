import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const isMockMode = !supabaseUrl || 
                   supabaseUrl === 'your_supabase_url' || 
                   !supabaseAnonKey || 
                   supabaseAnonKey.startsWith('your_');

let supabaseClient;

if (isMockMode) {
  console.log('🔧 Supabase Client: Running in LOCAL MOCK MODE (No real Supabase credentials)');
  
  const authListeners = new Set();

  // Helper to get mock user from localStorage
  const getMockUser = () => {
    const saved = localStorage.getItem('rageradar_mock_user');
    return saved ? JSON.parse(saved) : null;
  };

  const triggerAuthChange = (event) => {
    const user = getMockUser();
    const session = user ? { user, access_token: 'mock-token-' + user.email } : null;
    authListeners.forEach(cb => {
      try {
        cb(event, session);
      } catch (err) {
        console.error('Error triggering mock auth change callback', err);
      }
    });
  };

  const getMockUserPlan = (email, uid) => {
    const saved = localStorage.getItem('rageradar_mock_user_plan');
    if (saved) return JSON.parse(saved);
    
    return {
      id: uid,
      email: email,
      plan: email === 'admin@rageradar.com' ? 'enterprise' : 'trial',
      role: email === 'admin@rageradar.com' ? 'admin' : 'user',
      firstName: 'Demo',
      lastName: 'User',
      companyName: 'MockCorp',
      brandsUsed: 0,
      maxBrands: email === 'admin@rageradar.com' ? 9999 : 1,
      createdAt: new Date().toISOString(),
      trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    };
  };

  // Create Mock Supabase Client
  supabaseClient = {
    auth: {
      signUp: async ({ email, password, options }) => {
        console.log('🔧 Mock Auth: Sign Up', email);
        const uid = 'mock-uid-' + email.replace(/[@.]/g, '-');
        const additionalData = options?.data || {};
        const mockUser = {
          id: uid,
          uid: uid,
          email,
          email_verified: true,
          user_metadata: additionalData
        };
        const mockPlan = {
          id: uid,
          email,
          plan: 'trial',
          role: 'user',
          firstName: additionalData.firstName || '',
          lastName: additionalData.lastName || '',
          companyName: additionalData.companyName || '',
          companyEmail: additionalData.companyEmail || '',
          contactNumber: additionalData.contactNumber || '',
          jobTitle: additionalData.jobTitle || '',
          companySize: additionalData.companySize || '',
          brandsUsed: 0,
          maxBrands: 1,
          createdAt: new Date().toISOString(),
          trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        };
        localStorage.setItem('rageradar_mock_user', JSON.stringify(mockUser));
        localStorage.setItem('rageradar_mock_user_plan', JSON.stringify(mockPlan));
        triggerAuthChange('SIGNED_IN');
        return { data: { user: mockUser }, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        console.log('🔧 Mock Auth: Sign In', email);
        const uid = 'mock-uid-' + email.replace(/[@.]/g, '-');
        const mockUser = {
          id: uid,
          uid: uid,
          email,
          email_verified: true,
          user_metadata: { firstName: 'Demo', lastName: 'User' }
        };
        const mockPlan = getMockUserPlan(email, uid);
        localStorage.setItem('rageradar_mock_user', JSON.stringify(mockUser));
        localStorage.setItem('rageradar_mock_user_plan', JSON.stringify(mockPlan));
        triggerAuthChange('SIGNED_IN');
        return { data: { user: mockUser, session: { access_token: 'mock-token-' + email, user: mockUser } }, error: null };
      },
      signOut: async () => {
        console.log('🔧 Mock Auth: Sign Out');
        localStorage.removeItem('rageradar_mock_user');
        localStorage.removeItem('rageradar_mock_user_plan');
        triggerAuthChange('SIGNED_OUT');
        return { error: null };
      },
      getSession: async () => {
        const user = getMockUser();
        if (user) {
          return { data: { session: { user, access_token: 'mock-token-' + user.email } }, error: null };
        }
        return { data: { session: null }, error: null };
      },
      getUser: async () => {
        const user = getMockUser();
        return { data: { user }, error: null };
      },
      onAuthStateChange: (callback) => {
        authListeners.add(callback);
        const user = getMockUser();
        const session = user ? { user, access_token: 'mock-token-' + user.email } : null;
        // Run once initially
        setTimeout(() => {
          if (authListeners.has(callback)) {
            callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', session);
          }
        }, 10);
        // Return dummy unsubscribe
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => {
                authListeners.delete(callback);
              } 
            } 
          } 
        };
      },
      updateUser: async (attributes) => {
        console.log('🔧 Mock Auth: Update User', attributes);
        const user = getMockUser();
        if (!user) return { data: { user: null }, error: new Error('User not logged in') };
        
        const updatedUser = { ...user, ...attributes };
        localStorage.setItem('rageradar_mock_user', JSON.stringify(updatedUser));
        return { data: { user: updatedUser }, error: null };
      }
    },
    
    // Database query builder mock
    from: (table) => {
      console.log(`🔧 Mock DB: from('${table}')`);
      
      return {
        select: (fields) => {
          return {
            eq: (col, val) => {
              return {
                single: async () => {
                  if (table === 'users' && col === 'id') {
                    const user = getMockUser();
                    if (user && user.id === val) {
                      const plan = getMockUserPlan(user.email, user.id);
                      return { data: plan, error: null };
                    }
                  }
                  return { data: null, error: { message: 'Document not found' } };
                }
              };
            },
            // general select all
            then: async (resolve) => {
              if (table === 'users') {
                const user = getMockUser();
                const users = [
                  getMockUserPlan('admin@rageradar.com', 'mock-uid-admin-rageradar-com'),
                ];
                if (user && user.email !== 'admin@rageradar.com') {
                  users.push(getMockUserPlan(user.email, user.id));
                }
                resolve({ data: users, error: null });
              } else {
                resolve({ data: [], error: null });
              }
            }
          };
        },
        insert: (data) => {
          return {
            then: async (resolve) => {
              if (table === 'users') {
                localStorage.setItem('rageradar_mock_user_plan', JSON.stringify(data));
              }
              resolve({ error: null });
            }
          };
        },
        update: (data) => {
          return {
            eq: (col, val) => {
              return {
                then: async (resolve) => {
                  if (table === 'users' && col === 'id') {
                    const currentPlan = getMockUserPlan('', val);
                    const updatedPlan = { ...currentPlan, ...data };
                    localStorage.setItem('rageradar_mock_user_plan', JSON.stringify(updatedPlan));
                  }
                  resolve({ error: null });
                }
              };
            }
          };
        },
        delete: () => {
          return {
            eq: (col, val) => {
              return {
                then: async (resolve) => {
                  resolve({ error: null });
                }
              };
            }
          };
        }
      };
    }
  };
} else {
  // Real Supabase Client initialization
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
export default supabaseClient;
