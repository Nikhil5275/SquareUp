import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, query, where, orderBy, addDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if no app has been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Configure Google Auth Provider
provider.setCustomParameters({
    prompt: 'select_account'
});

const db = getFirestore(app);

// Firestore helper functions for server operations
export const serversCollection = collection(db, 'servers');
export const serverMembersCollection = (serverId: string) => collection(db, 'servers', serverId, 'members');

export {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp
};

export { auth, provider, db, app };