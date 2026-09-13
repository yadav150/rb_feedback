// =========================================
// RUDRA BHAKTI
// FIREBASE CONFIGURATION
// =========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


// =========================================
// FIREBASE CONFIG
// =========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyAoPVLSklKARDfdDoSm6Lzkj1kabJVpsw",

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


// =========================================
// INITIALIZE FIREBASE
// =========================================

const app =
    initializeApp(firebaseConfig);


// =========================================
// EXPORT
// =========================================

export {
    app
};
