import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAMi85qRQSDrqhlxc-l4UYkegcRxa_FD7g",
  authDomain: "ghig-1a4f1.firebaseapp.com",
  projectId: "ghig-1a4f1",
  storageBucket: "ghig-1a4f1.firebasestorage.app",
  messagingSenderId: "412743227043",
  appId: "1:412743227043:web:661cca9a1c186db0655116",
  measurementId: "G-2L69YMBTW7"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
