
const firebaseConfig = {
    apiKey: "AIzaSyCfTQ5WMHn3AwBLF0VJ-wsNen3PYYNANPc",
    authDomain: "swamphacksx.firebaseapp.com",
    projectId: "swamphacksx",
    storageBucket: "swamphacksx.firebasestorage.app",
    messagingSenderId: "764838007641",
    appId: "1:764838007641:web:94e09582556a582f3bb248",
    measurementId: "G-0D57KWX26F"
  };
  window.addEventListener("message", (event) => {
    if (event.data === "init") {
     const app = firebase.initializeApp(config);
     console.log("Initialized Firebase!", app);
    }
   });
  // Initialize Firebase
  //firebase.initializeApp(firebaseConfig);
  //const db = firebase.firestore();