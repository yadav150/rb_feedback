/* =========================================
   RUDRA BHAKTI — FEEDBACK FRONTEND
   PHASE 1
========================================= */


/* =========================================
   DYNAMIC REEL DATA

   Temporary prototype data.
   Firebase will replace this later.
========================================= */

const reelData = {
    reelId: "RB-001",

    title: "Shiva — The Eternal Consciousness",

    description:
        "Share your thoughts about this Reel.",

    thumbnail:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80"
};


/* =========================================
   DOM ELEMENTS
========================================= */

const userDetailsStep =
    document.getElementById("user-details-step");

const feedbackStep =
    document.getElementById("feedback-step");

const thankYouStep =
    document.getElementById("thank-you-step");

const progressSteps =
    document.querySelectorAll(".progress-step");

const reelTitle =
    document.getElementById("reel-title");

const reelDescription =
    document.getElementById("reel-description");

const reelThumbnail =
    document.getElementById("reel-thumbnail");


/* =========================================
   INITIALIZE REEL
========================================= */

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


/* =========================================
   STEP NAVIGATION
========================================= */

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


    progressSteps.forEach(
        (item, index) => {

            item.classList.toggle(
                "active",
                index === step - 1
            );

        }
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   USER DETAILS
========================================= */

document
    .getElementById("user-details-form")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            showStep(2);

        }
    );


/* =========================================
   TEXT TO SPEECH
========================================= */

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

                    activeSpeechButton =
                        null;

                };


                speech.onerror = () => {

                    this.classList.remove(
                        "speaking"
                    );

                    activeSpeechButton =
                        null;

                };


                speechSynthesis.speak(
                    speech
                );

            }
        );

    });


/* =========================================
   CHARACTER COUNT
========================================= */

const writtenFeedback =
    document.getElementById(
        "written-feedback"
    );

const characterCount =
    document.getElementById(
        "character-count"
    );


writtenFeedback.addEventListener(
    "input",
    function () {

        characterCount.textContent =
            `${this.value.length} / 500`;

    }
);


/* =========================================
   FEEDBACK SUBMISSION
========================================= */

document
    .getElementById("feedback-form")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const requiredGroups = [
                "reel_like",
                "reel_feeling",
                "more_content",
                "rating"
            ];


            let complete = true;


            requiredGroups.forEach(
                group => {

                    const selected =
                        document.querySelector(
                            `input[name="${group}"]:checked`
                        );


                    if (!selected) {
                        complete = false;
                    }

                }
            );


            if (!complete) {

                alert(
                    "Please answer all required questions before submitting."
                );

                return;
            }


            /*
                Later this object will be sent
                to Firebase Realtime Database.
            */

            const feedbackData = {

                reelId: reelData.reelId,

                name:
                    document.getElementById(
                        "user-name"
                    ).value.trim(),

                email:
                    document.getElementById(
                        "user-email"
                    ).value.trim(),

                reelLike:
                    document.querySelector(
                        'input[name="reel_like"]:checked'
                    ).value,

                reelFeeling:
                    document.querySelector(
                        'input[name="reel_feeling"]:checked'
                    ).value,

                moreContent:
                    document.querySelector(
                        'input[name="more_content"]:checked'
                    ).value,

                rating:
                    document.querySelector(
                        'input[name="rating"]:checked'
                    ).value,

                writtenFeedback:
                    writtenFeedback.value.trim(),

                submittedAt:
                    new Date().toISOString()

            };


            console.log(
                "Feedback payload:",
                feedbackData
            );


            showStep(3);

        }
    );


/* =========================================
   FACEBOOK SHARE
========================================= */

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
