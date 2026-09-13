// =========================================
// RUDRA BHAKTI
// FIREBASE SERVICE
// =========================================


import {

    initializeApp

} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";



import {

    getDatabase,
    ref,
    get,
    push,
    set

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

    initializeApp(

        firebaseConfig

    );




const database =

    getDatabase(

        app

    );








// =========================================
// GET REEL
// =========================================


export async function getReel(reelId){


    try{


        const reelReference =

            ref(

                database,

                `reels/${reelId}`

            );



        const snapshot =

            await get(

                reelReference

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

            "Unable to load reel information."

        );


    }


}

// =========================================
// SAVE FEEDBACK
// =========================================


export async function saveFeedback(payload){


    try{


        if(
            !payload ||
            !payload.reelId
        ){


            throw new Error(

                "Invalid feedback data."

            );


        }




        const feedbackReference =

            push(

                ref(

                    database,

                    "feedback_responses"

                )

            );





        const feedbackData = {


            ...payload,


            submittedAt:

                payload.submittedAt ||

                Date.now()


        };





        await set(

            feedbackReference,

            feedbackData

        );





        return {


            success:true,


            id:

                feedbackReference.key


        };


    }



    catch(error){


        console.error(

            "Save feedback error:",

            error

        );



        throw new Error(

            getFriendlyFirebaseError(error)

        );


    }


}








// =========================================
// FIREBASE ERROR MESSAGE
// =========================================


function getFriendlyFirebaseError(error){



    if(

        error?.code ===

        "PERMISSION_DENIED"

    ){


        return (

            "Permission denied. Please try again later."

        );


    }





    if(

        error?.message

    ){


        return error.message;


    }





    return (

        "Something went wrong while saving feedback."

    );


}

