import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfigJson from "./firebase-config.json";

// Your web app's Firebase configuration
// const firebaseConfig = { ...firebaseConfigJson };

// Initialize Firebase
if (getApps().length === 0) {
  initializeApp(firebaseConfigJson);
} 

const auth = getAuth(getApp());
const db = getFirestore( getApp());

export { auth, db };

