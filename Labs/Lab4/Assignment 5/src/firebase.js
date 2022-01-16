// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.3/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.3/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.3/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.3/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = { 
  apiKey: "AIzaSyBFwtdjC3wE6Yopcx1NVOx-tge6eIO1y1g",
  authDomain: "cloudsproject-2717e.firebaseapp.com",
  projectId: "cloudsproject-2717e",
  storageBucket: "cloudsproject-2717e.appspot.com",
  messagingSenderId: "1051480039822",
  appId: "1:1051480039822:web:fa2e96be40936bd61a84df",
  measurementId: "G-EENMBJMC3L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);  // -- APP Firebase object
const analytics = getAnalytics(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const auth = getAuth();

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const db = getDatabase(app);
export const dbFirestore = getFirestore(app);
