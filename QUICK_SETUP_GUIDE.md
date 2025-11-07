# Quick Setup Guide - Firebase Voting App

## Current Issue: Submit Button Not Working

### Possible Causes:
1. **No positions in Firestore** - The admin needs to add positions first
2. **No candidates in Firestore** - The admin needs to add candidates
3. **Not all positions voted for** - User must vote for ALL positions before submitting

### Step-by-Step Fix:

## 1. Add Positions (Admin Page)

1. Go to `/admin` page
2. Click "Add Position"
3. Add these positions:
   - President
   - Vice President
   - Secretary
   - Treasurer

## 2. Add Candidates (Admin Page)

For each position, add at least 2 candidates:

**President:**
- Click "Add Candidate"
- Type a name (e.g., "John Doe")
- If user exists in `users` collection, select from dropdown
- Select position: "President"
- Add bio (or it will auto-fill from user profile)
- Add image URL (or it will use user's profile image)
- Click "Add Candidate"

**Repeat for other positions**

## 3. Test Voting

1. Sign out from admin
2. Sign in as a regular user
3. Go to main page (`/`)
4. You should see the voting stepper
5. Vote for each position (one by one)
6. After voting for ALL positions, click "Submit Votes"
7. You should see "Thank You for Voting!" message

## 4. Check Results

1. Click "Results" tab
2. You should see vote counts for each candidate
3. Leading candidate will have a trophy icon

## Debugging Steps

### Check Browser Console

Open browser console (F12) and look for:
- "Submit clicked. Votes: ..." - Shows what votes were collected
- "Positions length: ..." - Shows how many positions exist
- "Votes count: ..." - Shows how many positions you voted for
- Any error messages

### Common Issues:

**Issue: "Please vote for all X positions. You have voted for Y."**
- **Solution:** You must vote for ALL positions before submitting
- Go through all positions and select a candidate for each

**Issue: "No Voting Positions Available"**
- **Solution:** Admin needs to add positions in admin page

**Issue: "No Candidates Available"**
- **Solution:** Admin needs to add candidates for that position

**Issue: "You have already voted"**
- **Solution:** This is correct behavior - you can only vote once
- Check Firestore `voteRecords` collection to verify

**Issue: Submit button is disabled**
- **Solution:** You haven't selected a candidate for the current position
- Select a candidate before clicking Next or Submit

## Firestore Collections Structure

### `positions`
```json
{
  "id": "pos-abc123",
  "name": "President",
  "order": 0,
  "created_at": "...",
  "updated_at": "..."
}
```

### `candidates`
```json
{
  "id": "cand-xyz789",
  "name": "John Doe",
  "position": "President",
  "image": "https://...",
  "bio": "...",
  "user_id": "1739",
  "email": "user@example.com",
  "profession": "Engineer",
  "created_at": "...",
  "updated_at": "..."
}
```

### `voteRecords`
```json
{
  "userId": "firebase-auth-uid",
  "userEmail": "voter@example.com",
  "votes": [
    {
      "position": "President",
      "candidateId": "cand-xyz789",
      "candidateName": "John Doe"
    }
  ],
  "timestamp": "...",
  "hasVoted": true
}
```

### `voteCounts`
```json
{
  "position": "President",
  "candidateId": "cand-xyz789",
  "candidateName": "John Doe",
  "count": 5
}
```

## Firebase Security Rules

Make sure these rules are set in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Positions - anyone can read, only auth users can write
    match /positions/{positionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Candidates - anyone can read, only auth users can write
    match /candidates/{candidateId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Vote records - users can only read/write their own
    match /voteRecords/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update, delete: if false; // Votes are immutable
    }
    
    // Vote counts - anyone can read, only system can write
    match /voteCounts/{voteCountId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Testing Workflow

### As Admin:
1. Sign in to `/admin`
2. Add 4 positions (President, VP, Secretary, Treasurer)
3. Add 2-3 candidates for each position
4. Sign out

### As Voter:
1. Sign in to `/auth`
2. Go to main page
3. Vote for each position
4. Submit votes
5. See "Thank You" message
6. Click "View Results" to see dashboard

### As Second Voter:
1. Sign in with different account
2. Vote for candidates
3. Submit votes
4. Check results - vote counts should update in real-time

## Environment Variables

Make sure `.env.local` exists with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Quick Test Commands

### Check if Firebase is connected:
Open browser console and type:
```javascript
console.log('Firebase config:', process.env)
```

### Check current user:
```javascript
console.log('Current user:', firebase.auth().currentUser)
```

### Check positions:
```javascript
firebase.firestore().collection('positions').get().then(snap => {
  console.log('Positions:', snap.docs.map(d => d.data()))
})
```

## Summary

✅ **Admin must add positions and candidates first**
✅ **Users must vote for ALL positions before submitting**
✅ **Each user can only vote once**
✅ **Results update in real-time**
✅ **Check browser console for debugging**

If you're still having issues, check the browser console for error messages and verify that:
1. Firebase is properly configured
2. Positions exist in Firestore
3. Candidates exist for each position
4. You're signed in
5. You haven't already voted
