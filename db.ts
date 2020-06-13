import * as firebaseSource from "firebase/app";
import "firebase/database";
// <script src="https://www.gstatic.com/firebasejs/7.15.1/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/7.15.1/firebase-database.js"></script>

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAgykVzXvyAok_a0b3y1X5j6tpVHw5w_80",
    authDomain: "view-bugs.firebaseapp.com",
    databaseURL: "https://view-bugs.firebaseio.com",
    projectId: "view-bugs",
    storageBucket: "view-bugs.appspot.com",
    messagingSenderId: "1030786158083",
    appId: "1:1030786158083:web:49c0d9408ef3e27e364836"
};
// Initialize Firebase
export const db = firebaseSource.initializeApp(firebaseConfig);