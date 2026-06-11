import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

const isMockMode = !process.env.REACT_APP_FIREBASE_API_KEY || 
                   process.env.REACT_APP_FIREBASE_API_KEY === 'your_firebase_api_key' ||
                   process.env.REACT_APP_FIREBASE_PROJECT_ID === 'your_project_id';

function createMockUser(email, uid) {
  return {
    uid: uid || 'mock-uid-' + email.replace(/[@.]/g, '-'),
    email: email,
    emailVerified: true,
    getIdToken: async () => 'mock-token-' + email,
    getIdTokenResult: async () => ({ claims: { admin: email === 'admin@rageradar.com' } })
  };
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, additionalData = {}) {
    if (isMockMode) {
      console.log('🔧 AuthContext: Starting mock signup...');
      const uid = 'mock-uid-' + email.replace(/[@.]/g, '-');
      const mockUser = { uid, email, ...additionalData };
      localStorage.setItem('rageradar_mock_user', JSON.stringify(mockUser));
      const mockUserObj = createMockUser(email, uid);
      setCurrentUser(mockUserObj);
      setUserPlan({
        email,
        plan: email === 'admin@rageradar.com' ? 'enterprise' : 'trial',
        createdAt: new Date(),
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        brandsUsed: 0,
        maxBrands: email === 'admin@rageradar.com' ? 9999 : 1,
        role: email === 'admin@rageradar.com' ? 'admin' : 'user',
        ...additionalData
      });
      return { user: mockUserObj };
    }

    try {
      console.log('🔧 AuthContext: Starting Firebase signup...');
      console.log('Email:', email);
      console.log('Firebase auth object:', auth);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ AuthContext: Firebase user created successfully:', result.user.uid);
      
      // Create user document with trial plan and company details
      const userDoc = {
        email: email,
        plan: 'trial',
        createdAt: new Date(),
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        brandsUsed: 0,
        maxBrands: 1,
        // Personal Information
        firstName: additionalData.firstName || '',
        lastName: additionalData.lastName || '',
        // Company Information
        companyName: additionalData.companyName || '',
        companyEmail: additionalData.companyEmail || '',
        contactNumber: additionalData.contactNumber || '',
        jobTitle: additionalData.jobTitle || '',
        companySize: additionalData.companySize || '',
        // Metadata
        signupDate: new Date(),
        lastLogin: new Date()
      };
      
      console.log('🔧 AuthContext: Creating user document in Firestore...');
      console.log('User document:', userDoc);
      
      try {
        await setDoc(doc(db, 'users', result.user.uid), userDoc);
        console.log('✅ AuthContext: User document created in Firestore successfully');
      } catch (firestoreError) {
        console.warn('⚠️ AuthContext: Failed to create user document in Firestore:', firestoreError.message);
        console.warn('Firestore error details:', firestoreError);
        // Continue with signup even if Firestore fails
        // User can still use the app with limited functionality
      }
      
      console.log('✅ AuthContext: Signup process completed successfully');
      return result;
    } catch (error) {
      console.error('❌ AuthContext: Signup failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  function login(email, password) {
    if (isMockMode) {
      console.log('🔧 AuthContext: Starting mock login...');
      const uid = 'mock-uid-' + email.replace(/[@.]/g, '-');
      const mockUser = { uid, email, firstName: 'Demo', lastName: 'User', companyName: 'MockCorp' };
      localStorage.setItem('rageradar_mock_user', JSON.stringify(mockUser));
      const mockUserObj = createMockUser(email, uid);
      setCurrentUser(mockUserObj);
      setUserPlan({
        email,
        plan: email === 'admin@rageradar.com' ? 'enterprise' : 'trial',
        createdAt: new Date(),
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        brandsUsed: 0,
        maxBrands: email === 'admin@rageradar.com' ? 9999 : 1,
        role: email === 'admin@rageradar.com' ? 'admin' : 'user'
      });
      return Promise.resolve({ user: mockUserObj });
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    if (isMockMode) {
      console.log('🔧 AuthContext: Starting mock logout...');
      localStorage.removeItem('rageradar_mock_user');
      setCurrentUser(null);
      setUserPlan(null);
      return Promise.resolve();
    }
    return signOut(auth);
  }

  async function getUserPlan(uid) {
    try {
      console.log('AuthContext: Getting user plan for UID:', uid);
      console.log('AuthContext: Firestore db object:', db);
      
      const userDoc = await getDoc(doc(db, 'users', uid));
      console.log('AuthContext: userDoc.exists():', userDoc.exists());
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('AuthContext: User data loaded from Firestore:', userData);
        console.log('AuthContext: User role:', userData.role);
        setUserPlan(userData);
        return userData;
      } else {
        console.log('AuthContext: User document does not exist, creating default plan');
        console.log('AuthContext: This should NOT happen for admin@rageradar.com!');
        
        // TEMPORARY FIX: If this is the admin user, create admin plan
        if (auth.currentUser?.email === 'admin@rageradar.com') {
          console.log('AuthContext: Creating temporary admin plan for admin@rageradar.com');
          const adminPlan = {
            email: 'admin@rageradar.com',
            role: 'admin',
            plan: 'enterprise',
            status: 'active',
            firstName: 'Admin',
            lastName: 'User',
            maxBrands: 'unlimited',
            brandsUsed: 0,
            createdAt: new Date(),
            temporary: true // Flag to indicate this is a temporary fix
          };
          setUserPlan(adminPlan);
          return adminPlan;
        }
        
        // User document doesn't exist, create a default trial plan
        const defaultPlan = {
          email: auth.currentUser?.email || '',
          plan: 'trial',
          createdAt: new Date(),
          trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          brandsUsed: 0,
          maxBrands: 1
        };
        setUserPlan(defaultPlan);
        return defaultPlan;
      }
    } catch (firestoreError) {
      console.warn('Failed to get user plan from Firestore:', firestoreError.message);
      console.warn('Firestore error details:', firestoreError);
      
      // TEMPORARY FIX: If this is the admin user, create admin plan even on error
      if (auth.currentUser?.email === 'admin@rageradar.com') {
        console.log('AuthContext: Creating temporary admin plan due to Firestore error');
        const adminPlan = {
          email: 'admin@rageradar.com',
          role: 'admin',
          plan: 'enterprise',
          status: 'active',
          firstName: 'Admin',
          lastName: 'User',
          maxBrands: 'unlimited',
          brandsUsed: 0,
          createdAt: new Date(),
          offline: true,
          temporary: true
        };
        setUserPlan(adminPlan);
        return adminPlan;
      }
      
      // Provide a default trial plan when Firestore is not accessible
      const fallbackPlan = {
        email: auth.currentUser?.email || '',
        plan: 'trial',
        createdAt: new Date(),
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        brandsUsed: 0,
        maxBrands: 1,
        offline: true // Flag to indicate this is a fallback plan
      };
      setUserPlan(fallbackPlan);
      return fallbackPlan;
    }
  }

  function isTrialExpired(user) {
    if (!user || user.plan !== 'trial') return false;
    // Admin users never have expired trials
    if (user.role === 'admin') return false;
    
    try {
      // Handle both Firestore timestamp and regular Date objects
      const trialEndDate = user.trialEndsAt?.toDate ? user.trialEndsAt.toDate() : new Date(user.trialEndsAt);
      return new Date() > trialEndDate;
    } catch (error) {
      console.warn('Error checking trial expiration:', error.message);
      // If we can't determine expiration, assume trial is still valid
      return false;
    }
  }

  function canCreateBrand(user) {
    if (!user) return false;
    // Admin users can always create brands
    if (user.role === 'admin') return true;
    if (isTrialExpired(user)) return false;
    return user.brandsUsed < user.maxBrands;
  }

  function isAdmin(user) {
    return user && user.role === 'admin';
  }

  async function refreshUserPlan() {
    if (currentUser) {
      console.log('AuthContext: Refreshing user plan for:', currentUser.uid);
      await getUserPlan(currentUser.uid);
    }
  }

  useEffect(() => {
    if (isMockMode) {
      const savedUser = localStorage.getItem('rageradar_mock_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          const mockUserObj = createMockUser(parsed.email, parsed.uid);
          setCurrentUser(mockUserObj);
          setUserPlan({
            email: parsed.email,
            role: parsed.email === 'admin@rageradar.com' ? 'admin' : 'user',
            plan: parsed.email === 'admin@rageradar.com' ? 'enterprise' : 'trial',
            status: 'active',
            firstName: parsed.firstName || 'Demo',
            lastName: parsed.lastName || 'User',
            maxBrands: parsed.email === 'admin@rageradar.com' ? 9999 : 1,
            brandsUsed: 0,
            createdAt: new Date(),
            ...parsed
          });
        } catch (e) {
          setCurrentUser(null);
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // Ensure loading is true at start
      
      try {
        setCurrentUser(user); // Set user immediately
        
        if (user) {
          // Get user plan after setting user
          await getUserPlan(user.uid);
        } else {
          setUserPlan(null);
        }
      } catch (error) {
        console.warn('Auth state change error:', error.message);
        // Still set the user even if getUserPlan fails
        setCurrentUser(user);
        if (user) {
          // Provide fallback plan
          setUserPlan({
            email: user.email || '',
            plan: 'trial',
            createdAt: new Date(),
            trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            brandsUsed: 0,
            maxBrands: 1,
            offline: true
          });
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userPlan,
    signup,
    login,
    logout,
    getUserPlan,
    refreshUserPlan,
    isTrialExpired,
    canCreateBrand,
    isAdmin,
    isMockMode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}