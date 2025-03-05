import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
const firebaseConfig = {
    apiKey: "AIzaSyA3e2i9xshF06SVzDPv3clvE1jBwFgqvkI",
    authDomain: "wibu-5281e.firebaseapp.com",
    databaseURL: "https://wibu-5281e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wibu-5281e",
    storageBucket: "wibu-5281e.firebasestorage.app",
    messagingSenderId: "756250490701",
    appId: "1:756250490701:web:b3d25786a683d98503e904",
    measurementId: "G-1363RGK1FE"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  onValue(ref(db, `/logs/`), (snapshot) => {
    const data = snapshot.val();
    console.log(data)
  });