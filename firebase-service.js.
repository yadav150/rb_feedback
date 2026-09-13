// =========================================
// RUDRA BHAKTI
// FIREBASE SERVICE
// Firebase Realtime Database
// =========================================

import {
    initializeApp,
    getApps,
    getApp
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
// FIREBASE CONFIGURATION
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

const app =
    getApps().length > 0
        ? getApp()
        : initializeApp(firebaseConfig);


const db =
    getDatabase(app);


// =========================================
// LOAD REEL
// Path:
// reels/{reelId}
// =========================================

export async function getReel(
    reelId
) {

    if (!reelId) {

        throw new Error(
            "Reel ID is missing."
        );
    }


    const cleanReelId =
        String(reelId).trim();


    if (!cleanReelId) {

        throw new Error(
            "Invalid Reel ID."
        );
    }


    try {

        const reelRef =
            ref(
                db,
                `reels/${cleanReelId}`
            );


        const snapshot =
            await get(
                reelRef
            );


        if (!snapshot.exists()) {

            return null;
        }


        const data =
            snapshot.val();


        return normalizeReel(
            data,
            cleanReelId
        );

    } catch (error) {

        console.error(
            "Firebase reel loading error:",
            error
        );


        throw new Error(
            "Unable to load this reel right now. Please try again."
        );
    }
}


// =========================================
// NORMALIZE REEL DATA
// Supports multiple possible field names
// =========================================

function normalizeReel(
    data,
    reelId
) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return null;
    }


    return {

        reelId:

            data.reelId ||
            data.id ||
            reelId,


        title:

            data.title ||
            data.reelTitle ||
            data.name ||
            "Rudra Bhakti Reel",


        facebookUrl:

            data.facebookUrl ||
            data.facebookURL ||
            data.postUrl ||
            data.url ||
            "",


        thumbnail:

            data.thumbnail ||
            data.thumbnailUrl ||
            data.image ||
            data.imageUrl ||
            "",


        questions:

            normalizeQuestions(
                data.questions
            ),


        createdAt:
            data.createdAt ||
            null,


        updatedAt:
            data.updatedAt ||
            null
    };
}


// =========================================
// NORMALIZE QUESTIONS
// =========================================

function normalizeQuestions(
    questions
) {

    if (!questions) {

        return null;
    }


    if (
        Array.isArray(
            questions
        )
    ) {

        return questions;
    }


    if (
        typeof questions === "object"
    ) {

        return Object.entries(
            questions
        ).map(
            ([key, value]) => {

                if (
                    typeof value === "string"
                ) {

                    return {

                        id:
                            key,

                        text:
                            value,

                        options:
                            []
                    };
                }


                return {

                    id:
                        value?.id ||
                        key,

                    text:
                        value?.text ||
                        value?.question ||
                        "",

                    hindi:
                        value?.hindi ||
                        "",

                    helper:
                        value?.helper ||
                        "",

                    options:
                        normalizeOptions(
                            value?.options
                        )
                };
            }
        );
    }


    return null;
}


// =========================================
// NORMALIZE OPTIONS
// =========================================

function normalizeOptions(
    options
) {

    if (!options) {
        return [];
    }


    if (
        Array.isArray(
            options
        )
    ) {

        return options.map(
            (option, index) => {

                if (
                    typeof option === "string"
                ) {

                    return {

                        id:
                            `OPTION_${index + 1}`,

                        label:
                            option
                    };
                }


                return {

                    id:
                        option?.id ||
                        `OPTION_${index + 1}`,

                    label:
                        option?.label ||
                        option?.text ||
                        ""
                };
            }
        );
    }


    if (
        typeof options === "object"
    ) {

        return Object.entries(
            options
        ).map(
            ([key, value]) => {

                if (
                    typeof value === "string"
                ) {

                    return {

                        id:
                            key,

                        label:
                            value
                    };
                }


                return {

                    id:
                        value?.id ||
                        key,

                    label:
                        value?.label ||
                        value?.text ||
                        ""
                };
            }
        );
    }


    return [];
}


// =========================================
// SAVE FEEDBACK
// Path:
// feedback_responses/{generatedId}
// =========================================

export async function saveFeedback(
    feedback
) {

    if (
        !feedback ||
        typeof feedback !== "object"
    ) {

        throw new Error(
            "Invalid feedback data."
        );
    }


    if (!feedback.reelId) {

        throw new Error(
            "Reel ID is missing."
        );
    }


    try {

        const responsesRef =
            ref(
                db,
                "feedback_responses"
            );


        const newResponseRef =
            push(
                responsesRef
            );


        const responseId =
            newResponseRef.key;


        if (!responseId) {

            throw new Error(
                "Unable to create feedback ID."
            );
        }


        const payload = {

            ...feedback,

            responseId,

            createdAt:
                serverTimestamp()
        };


        await set(
            newResponseRef,
            payload
        );


        return {

            success:
                true,

            responseId
        };

    } catch (error) {

        console.error(
            "Firebase feedback save error:",
            error
        );


        throw new Error(
            "Your feedback could not be submitted. Please try again."
        );
    }
}


// =========================================
// EXPORT DATABASE
// Useful for future admin files
// =========================================

export {
    db
};
