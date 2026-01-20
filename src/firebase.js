import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDAlJstAE2ngs7d9Bx1SawvzX1UOH4vmKQ",
  authDomain: "realtime-code-editor-ae35c.firebaseapp.com",
  // ✅ Ye URL tere projectId se banti hai, ise dhyan se dekh le
  databaseURL: "https://realtime-code-editor-ae35c-default-rtdb.firebaseio.com/", 
  projectId: "realtime-code-editor-ae35c",
  storageBucket: "realtime-code-editor-ae35c.firebasestorage.app",
  messagingSenderId: "340847380410",
  appId: "1:340847380410:web:4e38170691c119329f3f83",
  measurementId: "G-DQ7J7YRC3L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app); // Auth initialize kiya
const googleProvider = new GoogleAuthProvider(); // Google Provider setup

// ✅ Database export karo taaki Editor mein use kar sakein
export { db, auth , googleProvider};