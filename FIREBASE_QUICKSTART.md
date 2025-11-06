# Firebase Quick Start - Vote Project

## 🚀 Quick Setup (5 Minutes)

### 1. Install Firebase
```bash
npm install firebase
# or
pnpm add firebase
```

### 2. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "vote-app" → Create

### 3. Add Web App
1. Click Web icon (</>) in Firebase Console
2. Register app as "Vote Web App"
3. Copy the config object

### 4. Set Environment Variables
Create `.env.local` in project root:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vote-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vote-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vote-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123
```

### 5. Enable Services in Firebase Console

**Authentication:**
- Go to Authentication → Get started
- Enable Email/Password sign-in method

**Firestore:**
- Go to Firestore Database → Create database
- Start in **test mode**
- Choose your region

### 6. Start Development
```bash
npm run dev
```

## ✅ What's Already Set Up

### Files Created:
- ✅ `lib/firebase/config.ts` - Firebase initialization
- ✅ `lib/firebase/auth.ts` - Auth functions
- ✅ `lib/firebase/firestore.ts` - Database operations
- ✅ `lib/firebase/voting-service.ts` - Voting logic
- ✅ `lib/context/AuthContext.tsx` - React context
- ✅ `env.example` - Environment template

### Features Ready:
- ✅ Email/Password authentication
- ✅ Vote submission to Firestore
- ✅ Real-time vote count updates
- ✅ Duplicate vote prevention
- ✅ User vote tracking

## 📝 Next Steps

1. **Update `app/layout.tsx`** - Wrap with AuthProvider
2. **Update `app/auth/page.tsx`** - Use Firebase auth
3. **Update `app/page.tsx`** - Use Firebase voting
4. **Test the flow** - Sign up → Vote → View results

## 🔒 Production Security Rules

Before deploying, update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /voteRecords/{userId} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId 
                    && !exists(/databases/$(database)/documents/voteRecords/$(userId));
    }
    
    match /voteCounts/{voteId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 🧪 Test Checklist

- [ ] Sign up with new email
- [ ] Sign in with existing account
- [ ] Cast votes (all positions)
- [ ] Verify "already voted" message
- [ ] Check results update in real-time
- [ ] Sign out and sign back in
- [ ] Open in two browsers - see real-time sync

## 📚 Full Documentation

See `FIREBASE_SETUP.md` for detailed instructions and troubleshooting.

## 🆘 Quick Troubleshooting

**Firebase not found?**
→ Run `npm install firebase` and restart dev server

**Environment variables not working?**
→ Restart dev server after creating `.env.local`

**Permission denied?**
→ Check Firestore rules in Firebase Console

**Can't sign in?**
→ Verify Email/Password is enabled in Authentication

## 🎯 Database Structure

### Collections:

**voteRecords** (one per user)
```
{
  userId: "abc123",
  userEmail: "user@example.com",
  votes: [{position, candidateId, candidateName}],
  timestamp: Timestamp,
  hasVoted: true
}
```

**voteCounts** (one per candidate per position)
```
{
  position: "President",
  candidateId: "cand-1",
  candidateName: "John Doe",
  count: 42
}
```

That's it! You're ready to integrate Firebase! 🎉
