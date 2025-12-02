// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChtios867UY-BnI2y0msZtOJV25pedC9E",
  authDomain: "squareup-32d41.firebaseapp.com",
  projectId: "squareup-32d41",
  storageBucket: "squareup-32d41.firebasestorage.app",
  messagingSenderId: "583310661278",
  appId: "1:583310661278:web:d0621e1e11393758978d8f",
  measurementId: "G-N0C6MEMN7G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);