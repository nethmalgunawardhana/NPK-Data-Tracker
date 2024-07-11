import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCgyCXHMuQvI-ilCOVQIyjUuR464qNqE4s",
  authDomain: "npk-data-tracker-655de.firebaseapp.com",
  projectId: "npk-data-tracker-655de",
  storageBucket: "npk-data-tracker-655de.appspot.com",
  messagingSenderId: "838481789154",
  appId: "1:838481789154:web:ca4022ef49730c28bb1ebb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };