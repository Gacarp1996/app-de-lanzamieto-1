// firebase/firebase-config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {

  apiKey: "AIzaSyDqk6S7AB6x3ZzEoVJ5oXzVA4vdCh0EqZ4",

  authDomain: "tennis-academy-34074.firebaseapp.com",

  projectId: "tennis-academy-34074",

  storageBucket: "tennis-academy-34074.firebasestorage.app",

  messagingSenderId: "631257953689",

  appId: "1:631257953689:web:03e2027139d1d421cd0f08",

  measurementId: "G-QJG08J4WT9"

};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
