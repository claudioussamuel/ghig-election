# Firebase Integration Checklist

## 📋 Setup Checklist

### Phase 1: Installation & Configuration
- [ ] **Install Firebase package**
  ```bash
  npm install firebase
  ```
  - See `INSTALL_FIREBASE.md` if you have PowerShell issues

- [ ] **Create Firebase project**
  - Go to https://console.firebase.google.com/
  - Click "Add project"
  - Name: "vote-app"
  - Enable/disable Google Analytics (optional)

- [ ] **Register web app**
  - Click Web icon (</>) in Firebase Console
  - Register app nickname: "Vote Web App"
  - Copy configuration object

- [ ] **Create `.env.local` file**
  - Copy `env.example` to `.env.local`
  - Paste your Firebase credentials
  - Verify all 7 variables are filled

### Phase 2: Firebase Console Setup
- [ ] **Enable Authentication**
  - Go to Authentication → Get started
  - Click "Sign-in method" tab
  - Enable "Email/Password"
  - Save changes

- [ ] **Create Firestore Database**
  - Go to Firestore Database → Create database
  - Select "Start in test mode"
  - Choose your region (closest to users)
  - Click "Enable"

- [ ] **Verify services are active**
  - Authentication shows "Email/Password" enabled
  - Firestore shows database created

### Phase 3: Code Integration
- [ ] **Update `app/layout.tsx`**
  ```tsx
  import { AuthProvider } from '@/lib/context/AuthContext'
  
  // Wrap children with <AuthProvider>
  ```

- [ ] **Update `app/auth/page.tsx`**
  - Import `useAuth` hook
  - Replace localStorage with Firebase auth
  - Use `signIn()` and `signUp()` functions

- [ ] **Update `app/page.tsx`**
  - Import `useAuth` hook
  - Import voting service functions
  - Replace localStorage with Firebase functions
  - Add real-time vote count subscription

- [ ] **Update `components/voting-stepper.tsx`**
  - Use `submitVotes()` from voting service
  - Remove localStorage vote submission

- [ ] **Update `components/dashboard.tsx`**
  - Subscribe to real-time vote counts
  - Remove hardcoded vote data

### Phase 4: Testing
- [ ] **Test Authentication**
  - Sign up with new email/password
  - Verify user appears in Firebase Console → Authentication
  - Sign out
  - Sign in with same credentials
  - Verify session persists on page refresh

- [ ] **Test Voting Flow**
  - Sign in as test user
  - Navigate through voting stepper
  - Select candidates for all positions
  - Submit votes
  - Verify "already voted" message appears
  - Check Firestore Console → voteRecords collection
  - Verify your vote record exists

- [ ] **Test Vote Counts**
  - Check Firestore Console → voteCounts collection
  - Verify counts incremented
  - Open app in second browser/incognito
  - Vote with different account
  - Verify results update in first browser (real-time)

- [ ] **Test Duplicate Prevention**
  - Try to vote again with same account
  - Verify prevented from voting
  - Check error message displays

- [ ] **Test Multiple Users**
  - Create 3-5 test accounts
  - Vote with each account
  - Verify all votes counted correctly
  - Check results dashboard updates

### Phase 5: Security (Before Production)
- [ ] **Update Firestore Security Rules**
  - Go to Firestore → Rules tab
  - Replace test rules with production rules
  - See `FIREBASE_SETUP.md` for secure rules
  - Publish changes

- [ ] **Test Security Rules**
  - Try to vote without authentication (should fail)
  - Try to vote twice (should fail)
  - Try to read others' vote records (should fail)
  - Verify only own vote record is accessible

- [ ] **Environment Variables**
  - Verify `.env.local` is in `.gitignore`
  - Never commit Firebase credentials
  - Use different projects for dev/prod

### Phase 6: Production Deployment
- [ ] **Create production Firebase project**
  - Separate project from development
  - Configure production environment variables

- [ ] **Set up Firebase Hosting** (optional)
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase init hosting
  firebase deploy
  ```

- [ ] **Configure custom domain** (optional)
  - Firebase Console → Hosting → Add custom domain

- [ ] **Enable monitoring**
  - Set up Firebase Performance Monitoring
  - Configure error reporting
  - Set up usage alerts

## 🎯 Quick Verification

After each phase, verify:

**Phase 1:** ✅ No TypeScript errors, dev server starts
**Phase 2:** ✅ Firebase Console shows enabled services
**Phase 3:** ✅ App compiles without errors
**Phase 4:** ✅ Can sign up, vote, and see results
**Phase 5:** ✅ Security rules prevent unauthorized access
**Phase 6:** ✅ App deployed and accessible

## 🐛 Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| "Module not found: firebase" | Run `npm install firebase` |
| "Firebase not initialized" | Check `.env.local` exists and has values |
| "Permission denied" | Update Firestore security rules |
| Env vars not loading | Restart dev server |
| Can't run npm commands | Use Command Prompt, not PowerShell |
| Auth domain error | Add domain to Firebase Console → Auth → Settings |

## 📖 Documentation Reference

- **Quick Start:** `FIREBASE_QUICKSTART.md`
- **Full Setup:** `FIREBASE_SETUP.md`
- **Installation Help:** `INSTALL_FIREBASE.md`
- **Summary:** `FIREBASE_INTEGRATION_SUMMARY.md`
- **This Checklist:** `FIREBASE_CHECKLIST.md`

## ✨ Completion Criteria

You're done when:
- ✅ All checkboxes above are checked
- ✅ Users can sign up and sign in
- ✅ Users can vote once and only once
- ✅ Results update in real-time
- ✅ Security rules are in place
- ✅ No console errors

**Estimated Time:** 30-45 minutes for complete setup and testing

Good luck! 🚀
