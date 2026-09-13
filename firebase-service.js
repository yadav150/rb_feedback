// =========================================
// RUDRA BHAKTI
// FIREBASE SERVICE
// REALTIME DATABASE
// =========================================


// Firebase SDK imports

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
    getDatabase,
    ref,
    get,
    push,
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





// =========================================
// INITIALIZE FIREBASE
// =========================================


let app;

let database;


try {


    app =
        initializeApp(
            firebaseConfig
        );


    database =
        getDatabase(
            app
        );


}
catch(error){


    console.error(
        "Firebase initialization failed:",
        error
    );


}





// =========================================
// GET REEL DATA
// =========================================
//
// Database expected:
//
// reels
//   └── RB001
//        ├── title
//        ├── thumbnail
//        └── facebookUrl
//
// =========================================


export async function getReel(
    reelId
){


    if(!database){

        throw new Error(
            "Firebase is not initialized."
        );

    }



    if(!reelId){

        throw new Error(
            "Reel ID is missing."
        );

    }



    try {


        const reelRef =
            ref(
                database,
                `reels/${reelId}`
            );



        const snapshot =
            await get(
                reelRef
            );



        if(
            !snapshot.exists()
        ){

            return null;

        }



        return {

            id:
                reelId,


            ...snapshot.val()

        };


    }
    catch(error){


        console.error(
            "Get reel error:",
            error
        );


        throw new Error(
            "Unable to load reel details. Please try again."
        );


    }


}





// =========================================
// SAVE FEEDBACK
// =========================================
//
// Saves:
//
// feedback_responses
//      └── unique id
//
// =========================================


export async function saveFeedback(
    payload
){


    if(!database){

        throw new Error(
            "Firebase is not initialized."
        );

    }



    try {


        const feedbackRef =
            ref(
                database,
                "feedback_responses"
            );



        const newFeedback =
            push(
                feedbackRef
            );



        await set(
            newFeedback,
            {

                ...payload,


                serverCreatedAt:
                    serverTimestamp()

            }
        );



        return {

            success:true,

            id:
                newFeedback.key

        };


    }
    catch(error){


        console.error(
            "Save feedback error:",
            error
        );


        throw new Error(
            "Feedback could not be submitted. Please try again."
        );


    }


}
