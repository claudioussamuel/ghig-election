# Admin Access Control Setup

## Overview
The admin page is now protected and only accessible to users with `role: "admin"` in their Firestore user document.

## Implementation Details

### 1. User Role Field
- Added `role?: string` field to `UserProfile` interface in:
  - `lib/firebase/admin-service.ts`
  - `lib/firebase/portfolio-service.ts`
- Role can be either `"admin"` or `"user"` (defaults to `"user"`)

### 2. Role Checking Function
Created `getUserRole()` function in `lib/firebase/admin-service.ts`:
- Fetches user role from Firestore `users` collection
- Returns `"admin"` or `"user"` (defaults to `"user"` if not set)

### 3. AuthContext Updates
Enhanced `lib/context/AuthContext.tsx` with:
- `userRole`: Current user's role
- `isAdmin`: Boolean flag (true if role === "admin")
- Automatic role fetching on authentication

### 4. Admin Page Protection
Updated `app/admin/page.tsx` with:
- Role verification on page load
- Redirect non-admin users to home page
- Loading state while verifying access
- Only loads admin data if user is admin

## How to Grant Admin Access

### Method 1: Using Firestore Console (Recommended)
1. Go to Firebase Console → Firestore Database
2. Navigate to the `users` collection
3. Find the user document (by `user_id` or `email`)
4. Add or edit the `role` field:
   - Field name: `role`
   - Field value: `admin`
5. Save the document

### Method 2: Using Firebase Admin SDK (Backend)
```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function makeUserAdmin(userId) {
  await db.collection('users')
    .where('user_id', '==', userId)
    .get()
    .then(snapshot => {
      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;
        return db.collection('users').doc(docId).update({
          role: 'admin'
        });
      }
    });
}
```

### Method 3: Manual Firestore Update
If you have direct database access, update the user document:
```json
{
  "user_id": "user123",
  "email": "admin@example.com",
  "role": "admin",
  // ... other fields
}
```

## User Flow

### For Admin Users:
1. Login → AuthContext fetches role → `isAdmin = true`
2. Navigate to `/admin` → Access granted
3. Can manage positions, candidates, etc.

### For Regular Users:
1. Login → AuthContext fetches role → `isAdmin = false`
2. Navigate to `/admin` → Redirected to home page (`/`)
3. Cannot access admin functionality

### For Unauthenticated Users:
1. Navigate to `/admin` → Redirected to `/auth` (login page)

## Security Notes

1. **Client-side Protection**: The current implementation provides client-side protection by:
   - Checking role in AuthContext
   - Redirecting unauthorized users
   - Preventing data loading for non-admins

2. **Backend Protection Recommended**: For production, also add server-side protection:
   - Firebase Security Rules for Firestore
   - Verify admin role before allowing writes to `positions` and `candidates` collections

3. **Example Firestore Security Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Positions collection - admin only
    match /positions/{positionId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Candidates collection - admin only
    match /candidates/{candidateId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || isAdmin();
    }
  }
}
```

## Testing

1. **Test as Admin**:
   - Set a user's role to `"admin"` in Firestore
   - Login with that user
   - Navigate to `/admin`
   - Should see admin dashboard

2. **Test as Regular User**:
   - Login with a user without admin role (or role = "user")
   - Try to navigate to `/admin`
   - Should be redirected to home page

3. **Test as Guest**:
   - Logout
   - Try to navigate to `/admin`
   - Should be redirected to `/auth` (login page)

## Files Modified

1. `lib/firebase/admin-service.ts` - Added role field and getUserRole function
2. `lib/firebase/portfolio-service.ts` - Added role field to UserProfile
3. `lib/context/AuthContext.tsx` - Added role checking and isAdmin flag
4. `app/admin/page.tsx` - Added role-based access control

## Next Steps

1. Grant admin access to initial admin user(s) via Firestore Console
2. Implement Firestore Security Rules for backend protection
3. Consider adding an admin management page to grant/revoke admin access
4. Add audit logging for admin actions
