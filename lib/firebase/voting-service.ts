import { getDocument, setDocument, updateDocument, getDocuments, subscribeToCollection, Timestamp, where } from './firestore';
import { getCurrentUser } from './auth';

// Types
export interface Vote {
  userId: string;
  userEmail: string;
  position: string;
  candidateId: string;
  candidateName: string;
  timestamp: any;
}

export interface VoteRecord {
  userId: string;
  userEmail: string;
  votes: {
    position: string;
    candidateId: string;
    candidateName: string;
  }[];
  timestamp: any;
  hasVoted: boolean;
}

export interface VoteCount {
  position: string;
  candidateId: string;
  candidateName: string;
  count: number;
}

// Check if user has already voted
export const hasUserVoted = async (userId: string): Promise<boolean> => {
  try {
    const voteRecord = await getDocument('voteRecords', userId);
    return voteRecord?.hasVoted || false;
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
};

// Submit votes for all positions
export const submitVotes = async (
  votes: Record<string, { candidateId: string; candidateName: string }>
): Promise<void> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to vote');
  }

  try {
    // Check if user has already voted
    const alreadyVoted = await hasUserVoted(user.uid);
    if (alreadyVoted) {
      throw new Error('You have already voted');
    }

    // Create vote record
    const voteRecord: VoteRecord = {
      userId: user.uid,
      userEmail: user.email || '',
      votes: Object.entries(votes).map(([position, data]) => ({
        position,
        candidateId: data.candidateId,
        candidateName: data.candidateName,
      })),
      timestamp: Timestamp.now(),
      hasVoted: true,
    };

    // Save vote record
    await setDocument('voteRecords', user.uid, voteRecord);

    // Update vote counts for each position
    for (const [position, data] of Object.entries(votes)) {
      await incrementVoteCount(position, data.candidateId, data.candidateName);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to submit votes');
  }
};

// Increment vote count for a candidate
const incrementVoteCount = async (
  position: string,
  candidateId: string,
  candidateName: string
): Promise<void> => {
  try {
    const voteCountId = `${position}_${candidateId}`;
    const existingCount = await getDocument('voteCounts', voteCountId);

    if (existingCount) {
      await updateDocument('voteCounts', voteCountId, {
        count: existingCount.count + 1,
      });
    } else {
      await setDocument('voteCounts', voteCountId, {
        position,
        candidateId,
        candidateName,
        count: 1,
      });
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update vote count');
  }
};

// Get all vote counts
export const getAllVoteCounts = async (): Promise<Record<string, Record<string, number>>> => {
  try {
    const voteCounts = await getDocuments('voteCounts');
    
    const result: Record<string, Record<string, number>> = {};
    
    voteCounts.forEach((voteCount: any) => {
      if (!result[voteCount.position]) {
        result[voteCount.position] = {};
      }
      result[voteCount.position][voteCount.candidateId] = voteCount.count || 0;
    });
    
    return result;
  } catch (error) {
    console.error('Error getting vote counts:', error);
    return {};
  }
};

// Subscribe to real-time vote count updates
export const subscribeToVoteCounts = (
  callback: (votes: Record<string, Record<string, number>>) => void
) => {
  return subscribeToCollection('voteCounts', (data) => {
    const result: Record<string, Record<string, number>> = {};
    
    data.forEach((voteCount: any) => {
      if (!result[voteCount.position]) {
        result[voteCount.position] = {};
      }
      result[voteCount.position][voteCount.candidateId] = voteCount.count || 0;
    });
    
    callback(result);
  });
};

// Get user's vote record
export const getUserVoteRecord = async (userId: string): Promise<VoteRecord | null> => {
  try {
    const voteRecord = await getDocument('voteRecords', userId);
    return voteRecord as VoteRecord | null;
  } catch (error) {
    console.error('Error getting user vote record:', error);
    return null;
  }
};
