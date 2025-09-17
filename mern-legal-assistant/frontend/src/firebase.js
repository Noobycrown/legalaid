// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export auth instance
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 
