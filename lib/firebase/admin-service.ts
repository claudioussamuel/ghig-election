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

// AUDIT LOG INTERFACE
export interface AuditLog {
  id: string;
  action: 'delete_vote' | 'reset_all_votes' | 'delete_vote_record';
  performedBy: string;        // User ID of admin
  performedByEmail: string;   // Email of admin
  targetUserId?: string;      // For individual vote deletions
  targetUserEmail?: string;   // For individual vote deletions
  timestamp: any;
  details: string;            // Additional context
  voteCountBefore?: number;   // Total votes before action
  voteCountAfter?: number;    // Total votes after action
}

// VOTE MANAGEMENT FUNCTIONS

// Get total vote count
export const getTotalVoteCount = async (): Promise<number> => {
  try {
    const voteRecordsRef = collection(db, 'voteRecords');
    const querySnapshot = await getDocs(voteRecordsRef);
    return querySnapshot.size;
  } catch (error: any) {
    console.error('Error getting total vote count:', error);
    return 0;
  }
};

// Create audit log entry
const createAuditLog = async (
  action: AuditLog['action'],
  performedBy: string,
  performedByEmail: string,
  details: string,
  targetUserId?: string,
  targetUserEmail?: string,
  voteCountBefore?: number,
  voteCountAfter?: number
): Promise<void> => {
  try {
    const auditLogsRef = collection(db, 'auditLogs');
    const newDocRef = doc(auditLogsRef);
    
    const auditLog: AuditLog = {
      id: newDocRef.id,
      action,
      performedBy,
      performedByEmail,
      targetUserId,
      targetUserEmail,
      timestamp: Timestamp.now(),
      details,
      voteCountBefore,
      voteCountAfter,
    };
    
    await setDoc(newDocRef, auditLog);
  } catch (error: any) {
    console.error('Error creating audit log:', error);
    // Don't throw error - audit log failure shouldn't block the main action
  }
};

// Delete a single user's vote
export const deleteUserVote = async (
  userId: string,
  adminId: string,
  adminEmail: string
): Promise<void> => {
  try {
    const voteCountBefore = await getTotalVoteCount();
    
    // Get the user's vote record to log details
    const voteRecordRef = doc(db, 'voteRecords', userId);
    const voteRecordSnap = await getDoc(voteRecordRef);
    
    if (!voteRecordSnap.exists()) {
      throw new Error('Vote record not found');
    }
    
    const voteRecord = voteRecordSnap.data();
    const userEmail = voteRecord.userEmail || 'Unknown';
    
    // Decrement vote counts for each position the user voted for
    if (voteRecord.votes && Array.isArray(voteRecord.votes)) {
      for (const vote of voteRecord.votes) {
        const voteCountId = `${vote.position}_${vote.candidateId}`;
        const voteCountRef = doc(db, 'voteCounts', voteCountId);
        const voteCountSnap = await getDoc(voteCountRef);
        
        if (voteCountSnap.exists()) {
          const currentCount = voteCountSnap.data().count || 0;
          if (currentCount > 0) {
            await updateDoc(voteCountRef, {
              count: currentCount - 1,
            });
          }
        }
      }
    }
    
    // Delete the vote record
    await deleteDoc(voteRecordRef);
    
    const voteCountAfter = await getTotalVoteCount();
    
    // Create audit log
    await createAuditLog(
      'delete_vote',
      adminId,
      adminEmail,
      `Deleted vote for user ${userEmail}. Positions: ${voteRecord.votes?.map((v: any) => v.position).join(', ')}`,
      userId,
      userEmail,
      voteCountBefore,
      voteCountAfter
    );
  } catch (error: any) {
    console.error('Error deleting user vote:', error);
    throw new Error(error.message || 'Failed to delete vote');
  }
};

// Reset all votes (delete all vote records and reset vote counts)
export const resetAllVotes = async (
  adminId: string,
  adminEmail: string
): Promise<void> => {
  try {
    const voteCountBefore = await getTotalVoteCount();
    
    // Delete all vote records
    const voteRecordsRef = collection(db, 'voteRecords');
    const voteRecordsSnapshot = await getDocs(voteRecordsRef);
    
    const deletePromises = voteRecordsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Reset all vote counts to 0
    const voteCountsRef = collection(db, 'voteCounts');
    const voteCountsSnapshot = await getDocs(voteCountsRef);
    
    const resetPromises = voteCountsSnapshot.docs.map(doc => 
      updateDoc(doc.ref, { count: 0 })
    );
    await Promise.all(resetPromises);
    
    const voteCountAfter = 0;
    
    // Create audit log
    await createAuditLog(
      'reset_all_votes',
      adminId,
      adminEmail,
      `Reset all votes. Total votes deleted: ${voteCountBefore}`,
      undefined,
      undefined,
      voteCountBefore,
      voteCountAfter
    );
  } catch (error: any) {
    console.error('Error resetting all votes:', error);
    throw new Error(error.message || 'Failed to reset all votes');
  }
};

// Get all audit logs (for viewing history)
export const getAllAuditLogs = async (): Promise<AuditLog[]> => {
  try {
    const auditLogsRef = collection(db, 'auditLogs');
    const q = query(auditLogsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AuditLog));
  } catch (error: any) {
    console.error('Error getting audit logs:', error);
    throw new Error(error.message || 'Failed to get audit logs');
  }
};

// Subscribe to audit logs (real-time)
export const subscribeToAuditLogs = (
  callback: (logs: AuditLog[]) => void
) => {
  const auditLogsRef = collection(db, 'auditLogs');
  const q = query(auditLogsRef, orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AuditLog));
    callback(logs);
  });
};

// Get all vote records (for admin viewing)
export const getAllVoteRecords = async () => {
  try {
    const voteRecordsRef = collection(db, 'voteRecords');
    const q = query(voteRecordsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    console.error('Error getting vote records:', error);
    throw new Error(error.message || 'Failed to get vote records');
  }
};

// Subscribe to vote records (real-time)
export const subscribeToVoteRecords = (
  callback: (records: any[]) => void
) => {
  const voteRecordsRef = collection(db, 'voteRecords');
  const q = query(voteRecordsRef, orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(records);
  });
};

export { Timestamp };
