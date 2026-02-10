// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// Replace with your actual Firebase config from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyA9wjmIVZWwLqpgAlxxoTBOFuGRSfucFCU",
  authDomain: "netwifyapp-70edf.firebaseapp.com",
  projectId: "netwifyapp-70edf",
  storageBucket: "netwifyapp-70edf.firebasestorage.app",
  messagingSenderId: "621811738974",
  appId: "1:621811738974:web:6aa46da86443f9725607cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
