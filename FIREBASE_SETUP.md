# Firebase Setup Guide - Vote Project

## Overview
This guide will help you set up Firebase Authentication and Firestore for the voting application.

## Prerequisites
- Node.js and npm/pnpm installed
- A Google account for Firebase Console access

## Step 1: Install Firebase Dependencies

Run one of the following commands in your terminal:

```bash
# Using npm
npm install firebase

# Using pnpm
pnpm add firebase

# Using yarn
yarn add firebase
```

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "vote-app")
4. (Optional) Enable Google Analytics
5. Click "Create project"

## Step 3: Register Your Web App

1. In Firebase Console, click the **Web icon** (</>) to add a web app
2. Enter app nickname (e.g., "Vote Web App")
3. **Check** "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the project root:

```bash
# Copy the example file
cp env.example .env.local
```

2. Fill in your Firebase credentials in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Where to find these values:**
- Firebase Console → Project Settings → General → Your apps → SDK setup and configuration

## Step 5: Enable Firebase Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## Step 6: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2025, 12, 31);
       }
     }
   }
   ```
4. Select a location (choose closest to your users)
5. Click "Enable"

## Step 7: Set Up Firestore Security Rules (Production)

For production, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Vote records - users can only read/write their own
    match /voteRecords/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null 
                   && request.auth.uid == userId 
                   && !exists(/databases/$(database)/documents/voteRecords/$(userId));
    }
    
    // Vote counts - anyone authenticated can read, only system can write
    match /voteCounts/{voteId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && !resource.data.hasVoted;
    }
    
    // Admin collection (if needed)
    match /admin/{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## Step 8: Update Your Application

The following files have been created for Firebase integration:

### Configuration Files
- `lib/firebase/config.ts` - Firebase initialization
- `lib/firebase/auth.ts` - Authentication functions
- `lib/firebase/firestore.ts` - Firestore operations
- `lib/firebase/voting-service.ts` - Voting-specific logic
- `lib/context/AuthContext.tsx` - React Auth context

### Environment Files
- `env.example` - Template for environment variables
- `.env.local` - Your actual credentials (create this, not tracked by git)

## Step 9: Wrap Your App with AuthProvider

Update `app/layout.tsx` to include the AuthProvider:

```tsx
import { AuthProvider } from '@/lib/context/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Firestore Collections Structure

### `voteRecords` Collection
Stores individual user voting records:
```typescript
{
  userId: string;           // Firebase Auth UID
  userEmail: string;        // User's email
  votes: [
    {
      position: string;     // e.g., "President"
      candidateId: string;  // Candidate ID
      candidateName: string;// Candidate name
    }
  ];
  timestamp: Timestamp;     // When vote was cast
  hasVoted: boolean;        // Vote status flag
}
```

### `voteCounts` Collection
Aggregates vote counts per candidate:
```typescript
{
  position: string;         // e.g., "President"
  candidateId: string;      // Candidate ID
  candidateName: string;    // Candidate name
  count: number;            // Total votes
  updatedAt: Timestamp;     // Last update
}
```

## Testing Your Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test Authentication:**
   - Go to `/auth` page
   - Try signing up with email/password
   - Check Firebase Console → Authentication → Users

3. **Test Voting:**
   - Log in with a test account
   - Cast votes for all positions
   - Check Firebase Console → Firestore Database → voteRecords
   - Verify vote counts in voteCounts collection

4. **Test Real-time Updates:**
   - Open the app in two browser windows
   - Vote in one window
   - See results update in the other window

## Common Issues & Solutions

### Issue: "Firebase not initialized"
**Solution:** Ensure `.env.local` exists and contains valid credentials

### Issue: "Permission denied" errors
**Solution:** Check Firestore security rules, ensure user is authenticated

### Issue: "Module not found: firebase"
**Solution:** Run `npm install firebase` or `pnpm add firebase`

### Issue: Environment variables not loading
**Solution:** 
- Restart dev server after creating `.env.local`
- Ensure variables start with `NEXT_PUBLIC_`
- Check for typos in variable names

### Issue: "Auth domain not configured"
**Solution:** 
- Verify `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` in `.env.local`
- Add your domain to Firebase Console → Authentication → Settings → Authorized domains

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Use environment-specific configs** - Different Firebase projects for dev/prod
3. **Implement proper security rules** - Don't leave in test mode for production
4. **Enable App Check** - Protect against abuse (Firebase Console → App Check)
5. **Monitor usage** - Set up billing alerts in Firebase Console

## Next Steps

1. ✅ Install Firebase package
2. ✅ Create Firebase project
3. ✅ Configure environment variables
4. ✅ Enable Authentication
5. ✅ Create Firestore database
6. ✅ Update security rules
7. ⏳ Update auth pages to use Firebase
8. ⏳ Update voting logic to use Firestore
9. ⏳ Test the complete flow
10. ⏳ Deploy to production

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

## Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Review browser console for client-side errors
3. Verify all environment variables are set correctly
4. Ensure Firebase services are enabled in console
