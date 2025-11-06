# Setup Environment File

## Quick Steps

1. **Rename the file:**
   - Find `env.local.txt` in your project root
   - Rename it to `.env.local`

   **Windows Command:**
   ```cmd
   cd d:\vote
   ren env.local.txt .env.local
   ```

2. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

3. **Verify it works:**
   - Go to http://localhost:3000/auth
   - Try signing up with a test email
   - Check Firebase Console → Authentication for the new user

## Alternative: Create Manually

If renaming doesn't work, create `.env.local` manually:

1. Create new file named `.env.local` in `d:\vote\`
2. Copy contents from `env.local.txt`
3. Save the file
4. Restart dev server

## Your Firebase Credentials

Your credentials are already filled in `env.local.txt`:
- Project: ghig-1a4f1
- All environment variables are configured
- Ready to use!

## Next Steps

After renaming to `.env.local`:
1. ✅ Auth page is updated with Firebase
2. ⏳ Install Firebase: `npm install firebase`
3. ⏳ Update main page with Firebase voting
4. ⏳ Enable Email/Password in Firebase Console
5. ⏳ Create Firestore database

See `FIREBASE_CHECKLIST.md` for complete setup!
