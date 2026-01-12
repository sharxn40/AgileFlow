import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyB5ydRfvYKnyZMzyXb6sl8y_lMDLuMnSYw",
    authDomain: "agileflow-56.firebaseapp.com",
    projectId: "agileflow-56",
    storageBucket: "agileflow-56.firebasestorage.app",
    messagingSenderId: "768310526834",
    appId: "1:768310526834:web:3051e6ffbb682541c1d3eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
