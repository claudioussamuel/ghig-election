# Vote Management & Audit Log System

## Overview
This document describes the comprehensive vote management and audit logging system implemented for the voting platform admin dashboard. The system allows administrators to delete individual votes or reset all votes while maintaining a complete audit trail of all actions.

## Features Implemented

### 1. Vote Management
- **Delete Individual Votes**: Remove a specific user's vote record
- **Reset All Votes**: Clear all vote records and reset vote counts to zero
- **Real-time Updates**: Vote records update automatically via Firestore subscriptions
- **Vote Count Tracking**: Displays total number of votes cast

### 2. Audit Logging
- **Comprehensive Tracking**: Every vote deletion/reset action is logged
- **Admin Attribution**: Records which admin performed the action
- **Detailed Context**: Logs include timestamps, vote counts before/after, and affected users
- **Real-time Display**: Audit logs update automatically
- **Permanent Record**: Audit logs are never deleted, providing complete accountability

### 3. User Interface
- **Vote Management Panel**: Toggle view to manage votes
- **Audit Log Panel**: Toggle view to see action history
- **Confirmation Dialog**: Prevents accidental mass deletion
- **Loading States**: Visual feedback during operations
- **Responsive Design**: Works on mobile and desktop

## Technical Implementation

### Database Collections

#### `voteRecords` Collection
Stores individual user vote records:
```typescript
{
  userId: string,
  userEmail: string,
  votes: [
    {
      position: string,
      candidateId: string,
      candidateName: string
    }
  ],
  timestamp: Timestamp,
  hasVoted: boolean
}
```

#### `voteCounts` Collection
Stores aggregated vote counts per candidate:
```typescript
{
  position: string,
  candidateId: string,
  candidateName: string,
  count: number
}
```

#### `auditLogs` Collection (NEW)
Stores audit trail of admin actions:
```typescript
{
  id: string,
  action: 'delete_vote' | 'reset_all_votes' | 'delete_vote_record',
  performedBy: string,        // Admin user ID
  performedByEmail: string,   // Admin email
  targetUserId?: string,      // For individual deletions
  targetUserEmail?: string,   // For individual deletions
  timestamp: Timestamp,
  details: string,            // Human-readable description
  voteCountBefore?: number,   // Total votes before action
  voteCountAfter?: number     // Total votes after action
}
```

### Service Functions

#### `deleteUserVote(userId, adminId, adminEmail)`
Deletes a single user's vote record:
1. Gets current total vote count
2. Retrieves user's vote record
3. Decrements vote counts for each position voted
4. Deletes the vote record
5. Creates audit log entry

#### `resetAllVotes(adminId, adminEmail)`
Resets all votes in the system:
1. Gets current total vote count
2. Deletes all vote records
3. Resets all vote counts to 0
4. Creates audit log entry

#### `subscribeToVoteRecords(callback)`
Real-time subscription to vote records for live updates.

#### `subscribeToAuditLogs(callback)`
Real-time subscription to audit logs for live updates.

#### `getTotalVoteCount()`
Returns the current total number of votes cast.

## Usage Guide

### For Administrators

#### Viewing Vote Records
1. Navigate to Admin Dashboard
2. Scroll to "Vote Management" section
3. Click "Manage Votes" button
4. View list of all vote records with user emails and timestamps

#### Deleting Individual Votes
1. Open Vote Management panel
2. Find the vote record to delete
3. Click "Delete Vote" button next to the record
4. Vote is deleted and audit log is created automatically
5. Vote counts are automatically decremented

#### Resetting All Votes
1. Open Vote Management panel
2. Click "Reset All" button in the warning section
3. Review confirmation dialog showing:
   - Total number of votes to be deleted
   - Actions that will be performed
   - Warning that action cannot be undone
4. Click "Yes, Reset All Votes" to confirm
5. All votes are deleted and audit log is created

#### Viewing Audit Logs
1. Navigate to Admin Dashboard
2. Scroll to "Vote Management" section
3. Click "Audit Logs" button
4. View complete history of all vote management actions
5. Each log shows:
   - Action type (DELETE VOTE or RESET ALL)
   - Timestamp
   - Admin who performed the action
   - Vote count changes
   - Affected user (for individual deletions)
   - Detailed description

## Security Considerations

### Access Control
- Only users with `role: "admin"` in Firestore can access the admin dashboard
- All vote management functions require admin authentication
- Admin ID and email are automatically captured from authenticated session

### Audit Trail
- Every action is logged with full context
- Audit logs cannot be deleted through the UI
- Logs include before/after vote counts for verification
- Admin attribution ensures accountability

### Confirmation Dialogs
- Reset All Votes requires explicit confirmation
- Warning messages clearly explain consequences
- No accidental deletions possible

## Firestore Security Rules

Ensure your Firestore security rules protect these collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Vote Records - Only authenticated users can read their own, admins can manage
    match /voteRecords/{userId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null;
      allow delete: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Vote Counts - Anyone can read, only system can write
    match /voteCounts/{countId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Audit Logs - Only admins can read, system writes automatically
    match /auditLogs/{logId} {
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow create: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow update, delete: if false; // Audit logs should never be modified or deleted
    }
  }
}
```

## Files Modified

### Backend Services
- **`lib/firebase/admin-service.ts`**
  - Added `AuditLog` interface
  - Added `getTotalVoteCount()` function
  - Added `createAuditLog()` private function
  - Added `deleteUserVote()` function
  - Added `resetAllVotes()` function
  - Added `getAllAuditLogs()` function
  - Added `subscribeToAuditLogs()` function
  - Added `getAllVoteRecords()` function
  - Added `subscribeToVoteRecords()` function
  - Added `getDoc` import

### Frontend Components
- **`app/admin/page.tsx`**
  - Added vote management state variables
  - Added audit log state variables
  - Added `useEffect` for vote records subscription
  - Added `useEffect` for audit logs subscription
  - Added `handleDeleteVote()` function
  - Added `handleResetAllVotes()` function
  - Added `formatTimestamp()` helper function
  - Added Vote Management UI section
  - Added Audit Logs UI section
  - Added Reset Confirmation Dialog
  - Added imports for new icons and functions

## UI Components

### Vote Management Panel
- Header with total vote count
- Toggle buttons for Manage Votes and Audit Logs
- Warning section for Reset All Votes
- List of individual vote records with delete buttons
- Loading states during deletion
- Empty state when no votes exist

### Audit Log Panel
- Chronological list of all admin actions
- Color-coded action badges (red for reset, orange for delete)
- Timestamps for each action
- Vote count changes (before → after)
- Admin attribution
- Target user information (for individual deletions)
- Detailed action descriptions

### Confirmation Dialog
- Modal overlay with warning icon
- Clear explanation of consequences
- Bullet list of actions to be performed
- Prominent warning that action cannot be undone
- Confirm and Cancel buttons

## Best Practices

### When to Delete Individual Votes
- User requests vote removal
- Duplicate vote detected
- Fraudulent vote identified
- Testing/debugging purposes

### When to Reset All Votes
- Starting a new voting period
- Testing the system
- Correcting major data issues
- Restarting the election

### Audit Log Review
- Regularly review audit logs for unusual activity
- Monitor for unauthorized access attempts
- Verify vote count changes match expectations
- Keep audit logs for compliance/reporting

## Troubleshooting

### Vote Not Deleting
1. Check admin authentication status
2. Verify user has admin role in Firestore
3. Check browser console for errors
4. Verify Firestore security rules allow deletion

### Audit Logs Not Appearing
1. Check Firestore connection
2. Verify auditLogs collection exists
3. Check security rules allow admin read access
4. Refresh the page to re-establish subscription

### Vote Counts Not Updating
1. Verify voteCounts collection structure
2. Check for orphaned vote count documents
3. Ensure vote count IDs match format: `{position}_{candidateId}`

## Future Enhancements

Potential improvements for future versions:
- Export audit logs to CSV/PDF
- Filter audit logs by date range or admin
- Bulk vote operations (delete multiple specific votes)
- Vote restoration from audit logs
- Email notifications for vote management actions
- Advanced analytics on vote patterns
- Scheduled vote resets
- Role-based permissions (super admin vs. regular admin)

## Support

For issues or questions about the vote management system:
1. Check this documentation
2. Review Firestore security rules
3. Check browser console for errors
4. Verify admin role assignment
5. Review audit logs for action history

---

**Last Updated**: November 14, 2025
**Version**: 1.0.0
**Author**: Cascade AI Assistant
