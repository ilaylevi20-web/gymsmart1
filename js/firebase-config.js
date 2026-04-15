// ============================================
// קובץ הגדרות Firebase
// קובץ זה מכיל את כל ההגדרות הנדרשות לחיבור לשירותי Firebase
// ============================================

// קובץ הגדרות Firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBAdr41K-AffBijN4w0d9lzVHlD2jN3GBM",
  authDomain: "gym-smart-4d844.firebaseapp.com",
  projectId: "gym-smart-4d844",
  storageBucket: "gym-smart-4d844.firebasestorage.app",
  messagingSenderId: "275303358826",
  appId: "1:275303358826:web:4e06223029c303ee784513",
  measurementId: "G-L58BVVQMB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);