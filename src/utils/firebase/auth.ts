import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { env } from "../env";

// Your web app's Firebase configuration
// const firebaseConfig = { ...firebaseConfigJson };

// Initialize Firebase
if (getApps().length === 0) {
  initializeApp({
    apiKey: env.PUBLIC_FIREBASE_APIKEY,
    authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:env.PUBLIC_FIREBASE_PROEJCT_ID,
    storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.PUBLIC_FIREBASE_APP_ID,
    measurementId: env.PUBLIC_FIREBASE_MEASUREMENT_ID,
  });
  // initializeApp(firebaseConfigJson);
}


const auth = getAuth(getApp());
const db = getFirestore(getApp());

export { auth, db };
