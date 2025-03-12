// Firestore utility functions to handle data operations
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

// User types
export interface UserProfile {
  username?: string;
  profilePicture?: string;
  initialWeight?: number;
  goals?: {
    targetWeight?: number;
    targetMiles?: number;
    targetStreak?: number;
  };
  onboarded: boolean;
  email?: string;
  createdAt?: string;
}

// Weight entry type
export interface WeightEntry {
  date: Timestamp | Date;
  weight: number;
}

// Run entry type
export interface RunEntry {
  date: Timestamp | Date;
  distance: number;
}

// Eating well entry type
export interface EatingWellEntry {
  date: Timestamp | Date;
  ateWell: boolean;
}

// Chat message type
export interface ChatMessage {
  userId: string;
  username?: string;
  profilePicture?: string;
  message: string;
  timestamp: Timestamp | Date;
}

// User Functions

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), data);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Set onboarding completed
export const completeOnboarding = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      onboarded: true
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};

// Weight Functions

// Add weight entry
export const addWeightEntry = async (userId: string, weight: number, date: Date = new Date()): Promise<void> => {
  try {
    await addDoc(collection(db, 'users', userId, 'weightHistory'), {
      weight,
      date
    });
  } catch (error) {
    console.error('Error adding weight entry:', error);
    throw error;
  }
};

// Get latest weight entry
export const getLatestWeight = async (userId: string): Promise<WeightEntry | null> => {
  try {
    const q = query(
      collection(db, 'users', userId, 'weightHistory'),
      orderBy('date', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { ...doc.data(), date: doc.data().date } as WeightEntry;
    }
    return null;
  } catch (error) {
    console.error('Error getting latest weight:', error);
    throw error;
  }
};

// Get weight history
export const getWeightHistory = async (userId: string): Promise<WeightEntry[]> => {
  try {
    const q = query(
      collection(db, 'users', userId, 'weightHistory'),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), date: doc.data().date }) as WeightEntry);
  } catch (error) {
    console.error('Error getting weight history:', error);
    throw error;
  }
};

// Run Functions

// Add run entry
export const addRunEntry = async (userId: string, distance: number, date: Date = new Date()): Promise<void> => {
  try {
    await addDoc(collection(db, 'users', userId, 'runHistory'), {
      distance,
      date
    });
  } catch (error) {
    console.error('Error adding run entry:', error);
    throw error;
  }
};

// Get max run distance
export const getMaxRunDistance = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'users', userId, 'runHistory'),
      orderBy('distance', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().distance;
    }
    return 0;
  } catch (error) {
    console.error('Error getting max run distance:', error);
    throw error;
  }
};

// Get run history
export const getRunHistory = async (userId: string): Promise<RunEntry[]> => {
  try {
    const q = query(
      collection(db, 'users', userId, 'runHistory'),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), date: doc.data().date }) as RunEntry);
  } catch (error) {
    console.error('Error getting run history:', error);
    throw error;
  }
};

// Eating Well Functions

// Add eating well entry
export const addEatingWellEntry = async (userId: string, date: Date = new Date()): Promise<void> => {
  try {
    await addDoc(collection(db, 'users', userId, 'eatingWellHistory'), {
      date,
      ateWell: true
    });
  } catch (error) {
    console.error('Error adding eating well entry:', error);
    throw error;
  }
};

// Get eating well streak
export const getEatingWellStreak = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'users', userId, 'eatingWellHistory'),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return 0;
    
    const entries = querySnapshot.docs.map(doc => ({
      date: doc.data().date.toDate(),
      ateWell: doc.data().ateWell
    }));
    
    // Sort by date descending
    entries.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      
      // Check if this entry is for yesterday (relative to currentDate)
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (entryDate.getTime() === yesterday.getTime() && entry.ateWell) {
        streak++;
        currentDate = yesterday;
      } else {
        break;
      }
    }
    
    return streak;
  } catch (error) {
    console.error('Error getting eating well streak:', error);
    throw error;
  }
};

// Chat Functions

// Add chat message
export const addChatMessage = async (userId: string, message: string): Promise<void> => {
  try {
    const userProfile = await getUserProfile(userId);
    
    await addDoc(collection(db, 'chat'), {
      userId,
      username: userProfile?.username || 'Anonymous',
      profilePicture: userProfile?.profilePicture || '',
      message,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw error;
  }
};

// Get chat messages
export const getChatMessages = async (limitCount: number = 50): Promise<ChatMessage[]> => {
  try {
    const q = query(
      collection(db, 'chat'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      timestamp: doc.data().timestamp
    })) as ChatMessage[];
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

// Leaderboard Functions

// Get all users for leaderboard
export const getAllUsers = async (): Promise<DocumentData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Calculate weight progress percentage
export const calculateWeightProgress = async (userId: string): Promise<number> => {
  try {
    const userProfile = await getUserProfile(userId);
    const latestWeight = await getLatestWeight(userId);
    
    if (!userProfile || !latestWeight || !userProfile.initialWeight || !userProfile.goals?.targetWeight) {
      return 0;
    }
    
    const { initialWeight } = userProfile;
    const { targetWeight } = userProfile.goals;
    const currentWeight = latestWeight.weight;
    
    let progress = 0;
    
    if (targetWeight < initialWeight) {
      // Goal is to lose weight
      progress = Math.max(0, (initialWeight - currentWeight) / (initialWeight - targetWeight)) * 100;
    } else {
      // Goal is to gain weight
      progress = Math.max(0, (currentWeight - initialWeight) / (targetWeight - initialWeight)) * 100;
    }
    
    // Cap at 100%
    return Math.min(progress, 100);
  } catch (error) {
    console.error('Error calculating weight progress:', error);
    throw error;
  }
};

// Calculate miles run progress percentage
export const calculateMilesProgress = async (userId: string): Promise<number> => {
  try {
    const userProfile = await getUserProfile(userId);
    const maxDistance = await getMaxRunDistance(userId);
    
    if (!userProfile || !userProfile.goals?.targetMiles) {
      return 0;
    }
    
    const { targetMiles } = userProfile.goals;
    const progress = Math.min(1, maxDistance / targetMiles) * 100;
    
    return progress;
  } catch (error) {
    console.error('Error calculating miles progress:', error);
    throw error;
  }
};

// Calculate eating well streak progress percentage
export const calculateStreakProgress = async (userId: string): Promise<number> => {
  try {
    const userProfile = await getUserProfile(userId);
    const longestStreak = await getEatingWellStreak(userId);
    
    if (!userProfile || !userProfile.goals?.targetStreak) {
      return 0;
    }
    
    const { targetStreak } = userProfile.goals;
    const progress = Math.min(1, longestStreak / targetStreak) * 100;
    
    return progress;
  } catch (error) {
    console.error('Error calculating streak progress:', error);
    throw error;
  }
}; 