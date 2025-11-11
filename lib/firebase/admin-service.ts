import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';

// Position Interface
export interface Position {
  id: string;
  name: string;
  order: number;
  created_at: any;
  updated_at: any;
}

// Candidate Interface
export interface Candidate {
  id: string;
  name: string;
  position: string;
  image: string;
  bio: string;
  user_id?: string;        // Link to users collection
  email?: string;          // User's email
  profession?: string;     // From users collection
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
  role?: string; // 'admin' or 'user'
}

// POSITIONS CRUD

// Get all positions
export const getAllPositions = async (): Promise<Position[]> => {
  try {
    const positionsRef = collection(db, 'positions');
    const q = query(positionsRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Position));
  } catch (error: any) {
    console.error('Error getting positions:', error);
    throw new Error(error.message || 'Failed to get positions');
  }
};

// Subscribe to positions (real-time)
export const subscribeToPositions = (
  callback: (positions: Position[]) => void
) => {
  const positionsRef = collection(db, 'positions');
  const q = query(positionsRef, orderBy('order', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const positions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Position));
    callback(positions);
  });
};

// Create a position
export const createPosition = async (name: string, order: number): Promise<string> => {
  try {
    const positionsRef = collection(db, 'positions');
    const newDocRef = doc(positionsRef);
    
    const position: Position = {
      id: newDocRef.id,
      name,
      order,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };
    
    await setDoc(newDocRef, position);
    return newDocRef.id;
  } catch (error: any) {
    console.error('Error creating position:', error);
    throw new Error(error.message || 'Failed to create position');
  }
};

// Update a position
export const updatePosition = async (
  positionId: string,
  name: string
): Promise<void> => {
  try {
    const positionRef = doc(db, 'positions', positionId);
    await updateDoc(positionRef, {
      name,
      updated_at: Timestamp.now(),
    });
  } catch (error: any) {
    console.error('Error updating position:', error);
    throw new Error(error.message || 'Failed to update position');
  }
};

// Delete a position
export const deletePosition = async (positionId: string): Promise<void> => {
  try {
    const positionRef = doc(db, 'positions', positionId);
    await deleteDoc(positionRef);
  } catch (error: any) {
    console.error('Error deleting position:', error);
    throw new Error(error.message || 'Failed to delete position');
  }
};

// CANDIDATES CRUD

// Get all candidates
export const getAllCandidates = async (): Promise<Candidate[]> => {
  try {
    const candidatesRef = collection(db, 'candidates');
    const q = query(candidatesRef, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Candidate));
  } catch (error: any) {
    console.error('Error getting candidates:', error);
    throw new Error(error.message || 'Failed to get candidates');
  }
};

// Subscribe to candidates (real-time)
export const subscribeToCandidates = (
  callback: (candidates: Candidate[]) => void
) => {
  const candidatesRef = collection(db, 'candidates');
  const q = query(candidatesRef, orderBy('created_at', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const candidates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Candidate));
    callback(candidates);
  });
};

// Create a candidate
export const createCandidate = async (
  candidateData: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>
): Promise<string> => {
  try {
    const candidatesRef = collection(db, 'candidates');
    const newDocRef = doc(candidatesRef);
    
    const candidate: Candidate = {
      ...candidateData,
      id: newDocRef.id,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };
    
    await setDoc(newDocRef, candidate);
    return newDocRef.id;
  } catch (error: any) {
    console.error('Error creating candidate:', error);
    throw new Error(error.message || 'Failed to create candidate');
  }
};

// Update a candidate
export const updateCandidate = async (
  candidateId: string,
  updates: Partial<Omit<Candidate, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  try {
    const candidateRef = doc(db, 'candidates', candidateId);
    await updateDoc(candidateRef, {
      ...updates,
      updated_at: Timestamp.now(),
    });
  } catch (error: any) {
    console.error('Error updating candidate:', error);
    throw new Error(error.message || 'Failed to update candidate');
  }
};

// Delete a candidate
export const deleteCandidate = async (candidateId: string): Promise<void> => {
  try {
    const candidateRef = doc(db, 'candidates', candidateId);
    await deleteDoc(candidateRef);
  } catch (error: any) {
    console.error('Error deleting candidate:', error);
    throw new Error(error.message || 'Failed to delete candidate');
  }
};

// Get candidates by position
export const getCandidatesByPosition = async (positionName: string): Promise<Candidate[]> => {
  try {
    const candidates = await getAllCandidates();
    return candidates.filter(c => c.position === positionName);
  } catch (error: any) {
    console.error('Error getting candidates by position:', error);
    throw new Error(error.message || 'Failed to get candidates');
  }
};

// USER SEARCH FUNCTIONS

// Search users by name (Firstname or Surname)
export const searchUsersByName = async (searchTerm: string): Promise<UserProfile[]> => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const usersRef = collection(db, 'users');
    const searchLower = searchTerm.toLowerCase();
    
    // Get all users and filter client-side (Firestore doesn't support case-insensitive search)
    const querySnapshot = await getDocs(usersRef);
    
    const users = querySnapshot.docs
      .map(doc => doc.data() as UserProfile)
      .filter(user => {
        const fullName = `${user.Firstname} ${user.Surname}`.toLowerCase();
        const reverseName = `${user.Surname} ${user.Firstname}`.toLowerCase();
        return fullName.includes(searchLower) || 
               reverseName.includes(searchLower) ||
               user.Firstname.toLowerCase().includes(searchLower) ||
               user.Surname.toLowerCase().includes(searchLower);
      });
    
    return users.slice(0, 10); // Limit to 10 results
  } catch (error: any) {
    console.error('Error searching users:', error);
    throw new Error(error.message || 'Failed to search users');
  }
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    console.error('Error getting user by email:', error);
    throw new Error(error.message || 'Failed to get user');
  }
};

// Get user by user_id
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    console.error('Error getting user by ID:', error);
    throw new Error(error.message || 'Failed to get user');
  }
};

// Get user role by user_id
export const getUserRole = async (userId: string): Promise<string> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data() as UserProfile;
      return userData.role || 'user'; // Default to 'user' if role is not set
    }
    return 'user'; // Default role
  } catch (error: any) {
    console.error('Error getting user role:', error);
    return 'user'; // Default to user on error
  }
};

export { Timestamp };
