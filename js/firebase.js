
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC5vL-TRvltzRU4MjNpFocsf3kIUwu3dUk",
    authDomain: "docefacil-fd6a2.firebaseapp.com",
    projectId: "docefacil-fd6a2",
    storageBucket: "docefacil-fd6a2.firebasestorage.app",
    messagingSenderId: "598421664263",
    appId: "1:598421664263:web:c9d467f5d560614bba70a2",
    measurementId: "G-TMZVNWZC2X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs };
