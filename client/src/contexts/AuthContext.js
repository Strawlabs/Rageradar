import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if we are running in mock mode based on Supabase config
  const isMockMode = !process.env.REACT_APP_SUPABASE_URL || 
                     process.env.REACT_APP_SUPABASE_URL === 'your_supabase_url' ||
                     !process.env.REACT_APP_SUPABASE_ANON_KEY ||
                     process.env.REACT_APP_SUPABASE_ANON_KEY.startsWith('your_');

  // signUp function
  async function signup(email, password, additionalData = {}) {
    console.log('🔧 AuthContext: Starting signUp...');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: additionalData.firstName || '',
            lastName: additionalData.lastName || '',
            companyName: additionalData.companyName || '',
            companyEmail: additionalData.companyEmail || '',
            contactNumber: additionalData.contactNumber || '',
            jobTitle: additionalData.jobTitle || '',
            companySize: additionalData.companySize || '',
          }
        }
      });

      if (error) throw error;

      console.log('✅ AuthContext: User created successfully:', data.user.id);

      // Create user document in the custom public.users database table
      const userProfile = {
        id: data.user.id,
        email: email,
        plan: 'trial',
        firstName: additionalData.firstName || '',
        lastName: additionalData.lastName || '',
        companyName: additionalData.companyName || '',
        companyEmail: additionalData.companyEmail || '',
        contactNumber: additionalData.contactNumber || '',
        jobTitle: additionalData.jobTitle || '',
        companySize: additionalData.companySize || '',
        brandsUsed: 0,
        maxBrands: 1,
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      };

      console.log('🔧 AuthContext: Creating user profile in Supabase DB...');
      const { error: dbError } = await supabase
        .from('users')
        .insert(userProfile);

      if (dbError) {
        console.warn('⚠️ AuthContext: Failed to create user profile in DB:', dbError.message);
      } else {
        console.log('✅ AuthContext: User profile created successfully in DB');
      }

      return data;
    } catch (error) {
      console.error('❌ AuthContext: Signup failed:', error);
      throw error;
    }
  }

  // login function
  async function login(email, password) {
    console.log('🔧 AuthContext: Logging in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  // logout function
  async function logout() {
    console.log('🔧 AuthContext: Logging out...');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setCurrentUser(null);
    setUserPlan(null);
  }

  // getUserPlan function
  async function getUserPlan(uid) {
    try {
      console.log('AuthContext: Getting user plan for UID:', uid);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        console.log('AuthContext: User data loaded from Supabase:', data);
        setUserPlan(data);
        return data;
      } else {
        throw new Error('No user data returned');
      }
    } catch (dbError) {
      console.warn('Failed to get user plan from Supabase:', dbError.message);

      // Fallback: If this is the admin user, set admin plan
      const user = currentUser || (await supabase.auth.getUser()).data.user;
      if (user?.email === 'admin@rageradar.com') {
        const adminPlan = {
          email: 'admin@rageradar.com',
          role: 'admin',
          plan: 'enterprise',
          status: 'active',
          firstName: 'Admin',
          lastName: 'User',
          maxBrands: 9999,
          brandsUsed: 0,
          createdAt: new Date().toISOString(),
          temporary: true
        };
        setUserPlan(adminPlan);
        return adminPlan;
      }

      // Provide a default trial plan when Supabase is not accessible
      const fallbackPlan = {
        email: user?.email || '',
        plan: 'trial',
        createdAt: new Date().toISOString(),
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        brandsUsed: 0,
        maxBrands: 1,
        offline: true
      };
      setUserPlan(fallbackPlan);
      return fallbackPlan;
    }
  }

  // resetPassword function
  async function resetPassword(email) {
    console.log('🔧 AuthContext: Resetting password for...', email);
    const redirectTo = typeof window !== 'undefined' 
      ? `${window.location.origin}/reset-password`
      : 'http://localhost:3000/reset-password';
      
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });
    if (error) throw error;
    return data;
  }

  // updatePassword function
  async function updatePassword(newPassword) {
    console.log('🔧 AuthContext: Updating password...');
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  }

  // refreshSession function
  async function refreshSession() {
    console.log('🔧 AuthContext: Refreshing session...');
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    if (data?.user) {
      await getUserPlan(data.user.id);
    }
    return data;
  }

  function isTrialExpired(user) {
    if (!user || user.plan !== 'trial') return false;
    if (user.role === 'admin' || user.role === 'super_admin') return false;

    try {
      const trialEndDate = new Date(user.trialEndsAt);
      return new Date() > trialEndDate;
    } catch (error) {
      console.warn('Error checking trial expiration:', error.message);
      return false;
    }
  }

  function canCreateBrand(user) {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'super_admin') return true;
    if (isTrialExpired(user)) return false;
    return user.brandsUsed < user.maxBrands;
  }

  function isAdmin(user) {
    const checkUser = user || userPlan;
    return checkUser && (checkUser.role === 'admin' || checkUser.role === 'super_admin');
  }

  function hasRole(...roles) {
    const currentRole = userPlan?.role || 'user';
    return roles.includes(currentRole);
  }

  function isPremiumUser() {
    if (isAdmin()) return true;
    const plan = userPlan?.plan;
    return plan === 'pro' || plan === 'enterprise';
  }

  async function refreshUserPlan() {
    const user = currentUser || (await supabase.auth.getUser()).data?.user;
    if (user) {
      console.log('AuthContext: Refreshing user plan for:', user.id);
      await getUserPlan(user.id);
    }
  }

  useEffect(() => {
    // Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      const user = session?.user ?? null;
      
      // Adapt user object to include getIdToken() for API authorization
      let adaptedUser = null;
      if (user) {
        adaptedUser = {
          ...user,
          uid: user.id, // For backward compatibility with any other code referencing uid
          getIdToken: async () => {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            return currentSession?.access_token || null;
          }
        };
      }

      setCurrentUser(adaptedUser);

      if (user) {
        await getUserPlan(user.id);
      } else {
        setUserPlan(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userPlan,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updatePassword,
    refreshSession,
    getUserPlan,
    refreshUserPlan,
    isTrialExpired,
    canCreateBrand,
    isAdmin,
    hasRole,
    isPremiumUser,
    isMockMode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}