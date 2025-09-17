// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBzw5Im9rUcsAIcUYfnl25lThCBHJlPISo",
  authDomain: "first-88606.firebaseapp.com",
  projectId: "first-88606",
  storageBucket: "first-88606.appspot.com", // fix: .app → .app**spot**
  messagingSenderId: "714317673189",
  appId: "1:714317673189:web:4133d6cbc84d91e9b79a0c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export auth instance
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 