// =========================================
// RUDRA BHAKTI
// ADMIN PANEL SCRIPT
// =========================================


import {

    initializeApp

} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {

    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


import {

    getDatabase,
    ref,
    set,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";




// =========================================
// FIREBASE CONFIG
// =========================================


const firebaseConfig = {


    apiKey:
        "AIzaSyAoPVLSklKARDfdDoSm6L2zkj1kabJVpsw",


    authDomain:
        "rudrabhakti-a1d3e.firebaseapp.com",


    databaseURL:
        "https://rudrabhakti-a1d3e-default-rtdb.firebaseio.com",


    projectId:
        "rudrabhakti-a1d3e",


    storageBucket:
        "rudrabhakti-a1d3e.firebasestorage.app",


    messagingSenderId:
        "96491326088",


    appId:
        "1:96491326088:web:16b33c95f6aa67b5936d3d",


    measurementId:
        "G-RYKGBGSLVB"

};




const app =
    initializeApp(firebaseConfig);



const auth =
    getAuth(app);



const database =
    getDatabase(app);






// =========================================
// CONFIG
// =========================================


const CONFIG = {


    adminUID:
        "CEozlrvQkuMUox2gKTlQOzdc3ZS2",


    inactivityLimit:
        60000

};







// =========================================
// DOM
// =========================================


const elements = {


    loginSection:
        document.getElementById("admin-login"),



    dashboard:
        document.getElementById("admin-dashboard"),



    loginForm:
        document.getElementById("login-form"),



    email:
        document.getElementById("admin-email"),



    password:
        document.getElementById("admin-password"),



    loginError:
        document.getElementById("login-error"),



    logoutButton:
        document.getElementById("logout-button"),



    addReelForm:
        document.getElementById("add-reel-form"),



    reelId:
        document.getElementById("reel-id"),



    reelTitle:
        document.getElementById("reel-title-input"),



    reelUrl:
        document.getElementById("reel-url"),



    reelThumbnail:
        document.getElementById("reel-thumbnail-input")

};



let inactivityTimer = null;






// =========================================
// INIT
// =========================================


document.addEventListener(

    "DOMContentLoaded",

    init

);



function init(){


    setupEvents();


    watchAuth();


}
