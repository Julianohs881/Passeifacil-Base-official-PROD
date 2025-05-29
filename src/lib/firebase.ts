
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQT_QRaALbE5tx_9EiXzwBsPWQfftQdp4",
  authDomain: "passei-facil.firebaseapp.com",
  projectId: "passei-facil",
  storageBucket: "passei-facil.firebasestorage.app",
  messagingSenderId: "57051332693",
  appId: "1:57051332693:web:9afc175fd43c90e2cf94dc",
  measurementId: "G-044Q5EV78T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
