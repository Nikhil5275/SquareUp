import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyChtios867UY-BnI2y0msZtOJV25pedC9E",
    authDomain: "squareup-32d41.firebaseapp.com",
    projectId: "squareup-32d41",
    appId: "1:583310661278:web:d0621e1e11393758978d8f",
    // ...other config values...
};

// Initialize Firebase only if no app has been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db, app };