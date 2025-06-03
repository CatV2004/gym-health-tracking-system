import { initializeApp } from "firebase/app";
import { enableNetwork, getFirestore } from "firebase/firestore"; 


const firebaseConfig = {
  apiKey: "AIzaSyA17UXEmRy6gn-wSA2O8oaAhgvEhX7R6a4",
  authDomain: "gymcare-f65b0.firebaseapp.com",
  projectId: "gymcare-f65b0",
  storageBucket: "gymcare-f65b0.firebasestorage.app",
  messagingSenderId: "414114503967",
  appId: "1:414114503967:web:c9b188d56643de1904e42a",
  measurementId: "G-4LW4KMYT1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

enableNetwork(db)
  .then(() => console.log("Network enabled"))
  .catch((error) => console.error("Error enabling network:", error));

export { db };
