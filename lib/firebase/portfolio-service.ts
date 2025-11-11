import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

// Portfolio Item Interface
export interface PortfolioItem {
  id?: string;
  user_id: string;
  title: string;
  description: string;
  category: string; 
  image_url?: string; 
  project_date: string;
  location?: string;
  skills_used: string[];
  client?: string;
  status: 'completed' | 'ongoing' | 'planned';
  featured: boolean;
  created_at: any;
  updated_at: any;
}

// User Profile Interface (from users collection)
export interface UserProfile {
  user_id: string;
  email: string;
  Firstname: string;
  Surname: string;
  title: string;
  image_url: string;
  Profession: string;
  job_title: string;
  Speciality: string;
  Interest: string;
  Qualification: string;
  Tertiary: string;
  Year_of_graduation: string;
  phoneNumber: string;
  Address: string;
  City: string;
  country: string;
  gender: string;
  date_of_birth: string;
  Membership: string;
  Membership_ID: string | null;
  Council_Approved: string;
  Zonal_sector: string;
  created_at: any;
  role?: string; // 'admin' or 'user'
}

// Portfolio with User Data (for display)
export interface PortfolioWithUser extends PortfolioItem {
  user_name: string;
  user_image: string;
  user_profession: string;
  user_email: string;
}

// Get user profile by user_id
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data() as UserProfile;
      return userData;
    }
    return null;
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    throw new Error(error.message || 'Failed to get user profile');
  }
};

// Get user profile by email
export const getUserProfileByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data() as UserProfile;
      return userData;
    }
    return null;
  } catch (error: any) {
    console.error('Error getting user profile by email:', error);
    throw new Error(error.message || 'Failed to get user profile');
  }
};

// Create a new portfolio item
export const createPortfolioItem = async (
  portfolioData: Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at'>
): Promise<string> => {
  try {
    const portfolioRef = collection(db, 'portfolio');
    const newDocRef = doc(portfolioRef);
    
    const portfolioItem: PortfolioItem = {
      ...portfolioData,
      id: newDocRef.id,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };
    
    await setDoc(newDocRef, portfolioItem);
    return newDocRef.id;
  } catch (error: any) {
    console.error('Error creating portfolio item:', error);
    throw new Error(error.message || 'Failed to create portfolio item');
  }
};

// Update a portfolio item
export const updatePortfolioItem = async (
  portfolioId: string,
  updates: Partial<PortfolioItem>
): Promise<void> => {
  try {
    const portfolioRef = doc(db, 'portfolio', portfolioId);
    await updateDoc(portfolioRef, {
      ...updates,
      updated_at: Timestamp.now(),
    });
  } catch (error: any) {
    console.error('Error updating portfolio item:', error);
    throw new Error(error.message || 'Failed to update portfolio item');
  }
};

// Delete a portfolio item
export const deletePortfolioItem = async (portfolioId: string): Promise<void> => {
  try {
    const portfolioRef = doc(db, 'portfolio', portfolioId);
    await deleteDoc(portfolioRef);
  } catch (error: any) {
    console.error('Error deleting portfolio item:', error);
    throw new Error(error.message || 'Failed to delete portfolio item');
  }
};

// Get all portfolio items for a specific user
export const getUserPortfolio = async (userId: string): Promise<PortfolioItem[]> => {
  try {
    const portfolioRef = collection(db, 'portfolio');
    const q = query(
      portfolioRef,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PortfolioItem));
  } catch (error: any) {
    console.error('Error getting user portfolio:', error);
    throw new Error(error.message || 'Failed to get user portfolio');
  }
};

// Get all portfolio items with user data
export const getAllPortfolioWithUsers = async (): Promise<PortfolioWithUser[]> => {
  try {
    const portfolioRef = collection(db, 'portfolio');
    const q = query(portfolioRef, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const portfolioItems: PortfolioWithUser[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const portfolioData = docSnap.data() as PortfolioItem;
      const userProfile = await getUserProfile(portfolioData.user_id);
      
      if (userProfile) {
        portfolioItems.push({
          ...portfolioData,
          id: docSnap.id,
          user_name: `${userProfile.title} ${userProfile.Firstname} ${userProfile.Surname}`,
          user_image: portfolioData.image_url || userProfile.image_url,
          user_profession: userProfile.Profession,
          user_email: userProfile.email,
        });
      }
    }
    
    return portfolioItems;
  } catch (error: any) {
    console.error('Error getting portfolio with users:', error);
    throw new Error(error.message || 'Failed to get portfolio items');
  }
};

// Get featured portfolio items
export const getFeaturedPortfolio = async (): Promise<PortfolioWithUser[]> => {
  try {
    const portfolioRef = collection(db, 'portfolio');
    const q = query(
      portfolioRef,
      where('featured', '==', true),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const portfolioItems: PortfolioWithUser[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const portfolioData = docSnap.data() as PortfolioItem;
      const userProfile = await getUserProfile(portfolioData.user_id);
      
      if (userProfile) {
        portfolioItems.push({
          ...portfolioData,
          id: docSnap.id,
          user_name: `${userProfile.title} ${userProfile.Firstname} ${userProfile.Surname}`,
          user_image: portfolioData.image_url || userProfile.image_url,
          user_profession: userProfile.Profession,
          user_email: userProfile.email,
        });
      }
    }
    
    return portfolioItems;
  } catch (error: any) {
    console.error('Error getting featured portfolio:', error);
    throw new Error(error.message || 'Failed to get featured portfolio');
  }
};

// Get portfolio items by category
export const getPortfolioByCategory = async (category: string): Promise<PortfolioWithUser[]> => {
  try {
    const portfolioRef = collection(db, 'portfolio');
    const q = query(
      portfolioRef,
      where('category', '==', category),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const portfolioItems: PortfolioWithUser[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const portfolioData = docSnap.data() as PortfolioItem;
      const userProfile = await getUserProfile(portfolioData.user_id);
      
      if (userProfile) {
        portfolioItems.push({
          ...portfolioData,
          id: docSnap.id,
          user_name: `${userProfile.title} ${userProfile.Firstname} ${userProfile.Surname}`,
          user_image: portfolioData.image_url || userProfile.image_url,
          user_profession: userProfile.Profession,
          user_email: userProfile.email,
        });
      }
    }
    
    return portfolioItems;
  } catch (error: any) {
    console.error('Error getting portfolio by category:', error);
    throw new Error(error.message || 'Failed to get portfolio by category');
  }
};

// Get single portfolio item with user data
export const getPortfolioItemWithUser = async (portfolioId: string): Promise<PortfolioWithUser | null> => {
  try {
    const portfolioRef = doc(db, 'portfolio', portfolioId);
    const docSnap = await getDoc(portfolioRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const portfolioData = docSnap.data() as PortfolioItem;
    const userProfile = await getUserProfile(portfolioData.user_id);
    
    if (!userProfile) {
      return null;
    }
    
    return {
      ...portfolioData,
      id: docSnap.id,
      user_name: `${userProfile.title} ${userProfile.Firstname} ${userProfile.Surname}`,
      user_image: portfolioData.image_url || userProfile.image_url,
      user_profession: userProfile.Profession,
      user_email: userProfile.email,
    };
  } catch (error: any) {
    console.error('Error getting portfolio item:', error);
    throw new Error(error.message || 'Failed to get portfolio item');
  }
};

export { Timestamp };
