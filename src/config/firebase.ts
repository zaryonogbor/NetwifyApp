// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// Replace with your actual Firebase config from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyB6ujSHUX00Bc5grGzb2wPOrdkD832i-Dk",
  authDomain: "netwifyapp-247eb.firebaseapp.com",
  projectId: "netwifyapp-247eb",
  storageBucket: "netwifyapp-247eb.firebasestorage.app",
  messagingSenderId: "928471531387",
  appId: "1:928471531387:web:4d37b06b4fcda1631447de",
  measurementId: "G-58VS4F4R56"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
