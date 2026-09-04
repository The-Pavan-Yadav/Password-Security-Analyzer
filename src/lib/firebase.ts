import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ============================================================================
// DEMO MODE CONFIGURATION
// REPLACE THIS OBJECT WITH YOUR ACTUAL FIREBASE CONFIG
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCcjPrpF2IfA9_qgqwSUtijj2IUmi0wQa4",
  authDomain: "chain-reaction-game-7af0a.firebaseapp.com",
  databaseURL: "https://chain-reaction-game-7af0a-default-rtdb.firebaseio.com",
  projectId: "chain-reaction-game-7af0a",
  storageBucket: "chain-reaction-game-7af0a.firebasestorage.app",
  messagingSenderId: "815184729736",
  appId: "1:815184729736:web:dce5a1b532c7f37075b13d",
  measurementId: "G-C1PKSCGZTF"
};

let app;
let db: any;

try {
  // Only attempt to initialize if a config property looks roughly modified,
  // or just initialize and let Firebase throw if invalid.
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error. Please check your config in src/lib/firebase.ts:", error);
}

export { db };
