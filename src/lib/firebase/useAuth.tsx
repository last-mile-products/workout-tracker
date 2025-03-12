'use client'

// Authentication hook to manage Firebase Authentication
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  UserCredential, 
  User
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Define types for our auth context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  isOnboarded: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Check if user has completed onboarding
  const checkOnboarding = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsOnboarded(userData.onboarded || false);
      } else {
        setIsOnboarded(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboarded(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkOnboarding(currentUser.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up function
  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore with onboarded flag set to false
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      onboarded: false,
      createdAt: new Date().toISOString()
    });
    
    return userCredential;
  };

  // Login function
  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Logout function
  const logout = () => {
    return signOut(auth);
  };

  // Context value
  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    isOnboarded
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 