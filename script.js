// =========================================
// RUDRA BHAKTI
// FEEDBACK FORM
// FIREBASE INTEGRATION
// =========================================

import { database } from "./firebase.js";

import {
    ref,
    push,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


// =========================================
// DYNAMIC REEL DATA
// Temporary until Admin Panel is connected
// =========================================

const reelData = {
    reelId: "RB-001",

    title: "Shiva — The Eternal Consciousness",

    description:
        "Share your thoughts about this Reel.",

    thumbnail:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80"
};


// =========================================
// DOM ELEMENTS
// =========================================

const userDetailsStep =
    document.getElementById("user-details-step");

const feedbackStep =
    document.getElementById("feedback-step");

const thankYouStep =
    document.getElementById("thank-you-step");

const progressSteps =
    document.querySelectorAll(".progress-step");

const userDetailsForm =
    document.getElementById("user-details-form");

const feedbackForm =
    document.getElementById("feedback-form");

const reelTitle =
    document.getElementById("reel-title");

const reelDescription =
    document.getElementById("reel-description");

const reelThumbnail =
    document.getElementById("reel-thumbnail");

const writtenFeedback =
    document.getElementById("written-feedback");

const characterCount =
    document.getElementById("character-count");


// =========================================
// INITIALIZE REEL
// =========================================

function initializeReel() {

    reelTitle.textContent =
        reelData.title;

    reelDescription.textContent =
        reelData.description;

    reelThumbnail.src =
        reelData.thumbnail;

    reelThumbnail.alt =
        `${reelData.title} preview`;
}


initializeReel();


// =========================================
// STEP NAVIGATION
// =========================================

function showStep(step) {

    userDetailsStep.hidden = true;
    feedbackStep.hidden = true;
    thankYouStep.hidden = true;


    if (step === 1) {
        userDetailsStep.hidden = false;
    }


    if (step === 2) {
        feedbackStep.hidden = false;
    }


    if (step === 3) {
        thankYouStep.hidden = false;
    }


    progressSteps.forEach((item, index) => {

        item.classList.toggle(
            "active",
            index === step - 1
        );

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================================
// USER DETAILS
// =========================================

userDetailsForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        showStep(2);
    }
);


// =========================================
// TEXT TO SPEECH
// =========================================

let activeSpeechButton = null;


document
    .querySelectorAll(".tts-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const hindiText =
                    this.dataset.hindi;


                if (
                    !("speechSynthesis" in window)
                ) {
                    return;
                }


                if (
                    speechSynthesis.speaking &&
                    activeSpeechButton === this
                ) {

                    speechSynthesis.cancel();

                    this.classList.remove(
                        "speaking"
                    );

                    activeSpeechButton = null;

                    return;
                }


                speechSynthesis.cancel();


                document
                    .querySelectorAll(".tts-button")
                    .forEach(item => {

                        item.classList.remove(
                            "speaking"
                        );

                    });


                const speech =
                    new SpeechSynthesisUtterance(
                        hindiText
                    );


                speech.lang = "hi-IN";
                speech.rate = 0.88;
                speech.pitch = 1;


                speech.onstart = () => {

                    this.classList.add(
                        "speaking"
                    );

                    activeSpeechButton =
                        this;
                };


                speech.onend = () => {

                    this.classList.remove(
                        "speaking"
                    );

                    activeSpeechButton = null;
                };


                speech.onerror = () => {

                    this.classList.remove(
                        "speaking"
                    );

                    activeSpeechButton = null;
                };


                speechSynthesis.speak(
                    speech
                );
            }
        );

    });


// =========================================
// CHARACTER COUNT
// =========================================

writtenFeedback.addEventListener(
    "input",
    function () {

        characterCount.textContent =
            `${this.value.length} / 500`;
    }
);


// =========================================
// GET SELECTED VALUE
// =========================================

function getSelectedValue(name) {

    const selected =
        document.querySelector(
            `input[name="${name}"]:checked`
        );

    return selected
        ? selected.value
        : null;
}


// =========================================
// FEEDBACK SUBMISSION
// =========================================

feedbackForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const reelLike =
            getSelectedValue("reel_like");

        const reelFeeling =
            getSelectedValue("reel_feeling");

        const moreContent =
            getSelectedValue("more_content");

        const rating =
            getSelectedValue("rating");


        // Required questions

        if (
            !reelLike ||
            !reelFeeling ||
            !moreContent ||
            !rating
        ) {

            alert(
                "Please answer all required questions before submitting."
            );

            return;
        }


        // =====================================
        // USER INFORMATION
        // =====================================

        const nameInput =
            document
                .getElementById("user-name")
                .value
                .trim();

        const emailInput =
            document
                .getElementById("user-email")
                .value
                .trim();


        const userName =
            nameInput || "Anonymous";

        const userEmail =
            emailInput || "anonymous@gmail.com";


        // =====================================
        // FEEDBACK OBJECT
        // =====================================

        const feedbackData = {

            reelId:
                reelData.reelId,

            reelTitle:
                reelData.title,


            user: {

                name:
                    userName,

                email:
                    userEmail
            },


            answers: {

                reelLike:
                    reelLike,

                reelFeeling:
                    reelFeeling,

                moreContent:
                    moreContent,

                rating:
                    rating,

                writtenFeedback:
                    writtenFeedback.value.trim()
            },


            metadata: {

                submittedAt:
                    serverTimestamp(),

                pageUrl:
                    window.location.href,

                userAgent:
                    navigator.userAgent
            }

        };


        // =====================================
        // SAVE TO FIREBASE
        // =====================================

        try {

            const feedbackRef =
                ref(
                    database,
                    `feedback/${reelData.reelId}`
                );


            await push(
                feedbackRef,
                feedbackData
            );


            // =================================
            // SUCCESS
            // =================================

            showStep(3);


        } catch (error) {

            console.error(
                "Feedback submission failed:",
                error
            );


            alert(
                "Something went wrong while submitting your feedback. Please try again."
            );
        }

    }
);


// =========================================
// FACEBOOK SHARE
// =========================================

document
    .getElementById(
        "facebook-share-button"
    )
    .addEventListener(
        "click",
        function () {

            const shareUrl =
                window.location.href;


            const facebookUrl =
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;


            window.open(
                facebookUrl,
                "_blank",
                "noopener,noreferrer,width=700,height=600"
            );

        }
    );
