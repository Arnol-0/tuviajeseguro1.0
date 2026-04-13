import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAL8pj5Jd_NhBRQXKFNDNm8kUiVVu9sJmM",
  authDomain: "tuviajeseguro.firebaseapp.com",
  databaseURL: "https://tuviajeseguro-default-rtdb.firebaseio.com",
  projectId: "tuviajeseguro",
  storageBucket: "tuviajeseguro.firebasestorage.app",
  messagingSenderId: "469321453614",
  appId: "1:469321453614:web:6c7e2a5a46ee1bd82a0fbf",
  measurementId: "G-V0F3NX4Y7Z"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const database = getDatabase(app);
