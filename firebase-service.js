// =========================================
// RUDRA BHAKTI
// FIREBASE SERVICE
// =========================================


// Firebase imports
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
    getDatabase,
    ref,
    get,
    set,
    push,
    update,
    remove,
    query,
    orderByChild
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";


// Auth imports
import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


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
// INITIALIZE
// =========================================

const app =
    initializeApp(firebaseConfig);


const database =
    getDatabase(app);


const auth =
    getAuth(app);



export {
    database,
    auth
};



// =========================================
// CONSTANT
// =========================================

const ADMIN_UID =
    "CEozlrvQkuMUox2gKTlQOzdc3ZS2";



// =========================================
// GET REEL
// =========================================

export async function getReel(
    reelId
){

    if(!reelId){
        throw new Error(
            "Reel ID missing"
        );
    }


    try{

        const reelRef =
            ref(
                database,
                `reels/${reelId}`
            );


        const snapshot =
            await get(
                reelRef
            );


        if(!snapshot.exists()){

            return null;

        }


        return {

            id:
                reelId,

            ...snapshot.val()

        };


    }catch(error){

        console.error(
            "Get reel error:",
            error
        );


        throw new Error(
            "Unable to load reel"
        );
    }

}




// =========================================
// SAVE FEEDBACK
// =========================================

export async function saveFeedback(
    feedback
){

    try{


        const feedbackRef =
            push(
                ref(
                    database,
                    "feedback_responses"
                )
            );


        await set(
            feedbackRef,
            {

                ...feedback,

                responseId:
                    feedbackRef.key

            }
        );


        return feedbackRef.key;


    }catch(error){


        console.error(
            "Save feedback error:",
            error
        );


        throw new Error(
            "Unable to submit feedback"
        );

    }

}





// =========================================
// GENERATE REEL ID
// =========================================

export async function generateReelId(){


    const reelsRef =
        ref(
            database,
            "reels"
        );


    const snapshot =
        await get(
            reelsRef
        );


    let count =
        1;


    if(snapshot.exists()){


        count =
            Object.keys(
                snapshot.val()
            ).length + 1;

    }


    return (
        "RB" +
        String(count)
        .padStart(
            3,
            "0"
        )
    );

}





// =========================================
// ADD REEL
// =========================================

export async function addReel(
    reelData
){

    try{


        const reelId =
            await generateReelId();


        const reelRef =
            ref(
                database,
                `reels/${reelId}`
            );



        const data = {


            reelId,


            title:
                reelData.title ||
                "Rudra Bhakti Reel",


            facebookUrl:
                reelData.facebookUrl ||
                "",


            thumbnail:
                reelData.thumbnail ||
                "",


            status:
                "active",


            createdAt:
                Date.now(),


            updatedAt:
                Date.now(),


            createdBy:
                ADMIN_UID

        };



        await set(
            reelRef,
            data
        );


        return {

            id:
                reelId,

            ...data

        };


    }catch(error){


        console.error(
            "Add reel error:",
            error
        );


        throw new Error(
            "Unable to add reel"
        );

    }

}





// =========================================
// GET ALL REELS
// =========================================

export async function getAllReels(){


    try{


        const snapshot =
            await get(
                ref(
                    database,
                    "reels"
                )
            );



        if(!snapshot.exists()){

            return [];

        }



        return Object.entries(
            snapshot.val()
        )
        .map(
            ([id,data])=>({

                id,

                ...data

            })
        );



    }catch(error){


        console.error(
            "Get reels error:",
            error
        );


        throw new Error(
            "Unable to load reels"
        );

    }

}





// =========================================
// GET FEEDBACKS
// =========================================

export async function getAllFeedback(){


    try{


        const snapshot =
            await get(
                ref(
                    database,
                    "feedback_responses"
                )
            );


        if(!snapshot.exists()){

            return [];

        }


        return Object.entries(
            snapshot.val()
        )
        .map(
            ([id,data])=>({

                id,

                ...data

            })
        );


    }catch(error){


        console.error(
            "Feedback load error:",
            error
        );


        throw new Error(
            "Unable to load feedback"
        );

    }

}





// =========================================
// UPDATE REEL
// =========================================

export async function updateReel(
    reelId,
    updates
){

    await update(
        ref(
            database,
            `reels/${reelId}`
        ),
        {

            ...updates,

            updatedAt:
                Date.now()

        }
    );

}





// =========================================
// DELETE REEL
// =========================================

export async function deleteReel(
    reelId
){

    await remove(
        ref(
            database,
            `reels/${reelId}`
        )
    );

}
