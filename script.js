// =========================================
// RUDRA BHAKTI
// PUBLIC FEEDBACK — SCRIPT.JS
// =========================================

// =========================================
// FIREBASE SERVICE IMPORT
// =========================================

import {
    getReel,
    saveFeedback
} from "./firebase-service.js";


// =========================================
// CONFIGURATION
// =========================================

const CONFIG = {
    fallbackName: "Anonymous",
    fallbackEmail: "anonymous@gmail.com",

    questions: [
        {
            id: "Q_FEELING",
            text: "How do you like this reel?",
            hindi: "आपको ये रील कैसी लगी?",
            helper: "Choose the option that best describes your reaction.",

            options: [
                {
                    id: "Q_FEELING_LIKED",
                    label: "I really liked it"
                },
                {
                    id: "Q_FEELING_GOOD",
                    label: "I liked it"
                },
                {
                    id: "Q_FEELING_NEUTRAL",
                    label: "It was okay"
                },
                {
                    id: "Q_FEELING_DISLIKED",
                    label: "I did not like it"
                }
            ]
        },

        {
            id: "Q_MORE_CONTENT",
            text: "Would you like to see more reels like this?",
            hindi: "क्या आप ऐसी और रील्स देखना चाहेंगे?",
            helper: "Choose one option.",

            options: [
                {
                    id: "Q_MORE_CONTENT_YES",
                    label: "Yes, definitely"
                },
                {
                    id: "Q_MORE_CONTENT_MAYBE",
                    label: "Maybe"
                },
                {
                    id: "Q_MORE_CONTENT_NO",
                    label: "Not really"
                }
            ]
        },

        {
            id: "Q_CONNECTION",
            text: "How strongly did this reel connect with you?",
            hindi: "इस रील ने आपको कितनी गहराई से जोड़ा?",
            helper: "Choose the level that feels closest to your experience.",

            options: [
                {
                    id: "Q_CONNECTION_STRONG",
                    label: "Very strongly"
                },
                {
                    id: "Q_CONNECTION_GOOD",
                    label: "Quite well"
                },
                {
                    id: "Q_CONNECTION_SOMEWHAT",
                    label: "Somewhat"
                },
                {
                    id: "Q_CONNECTION_LOW",
                    label: "Not much"
                }
            ]
        },

        {
            id: "Q_RATING",
            text: "What rating would you give this reel?",
            hindi: "आप इस रील को कितनी रेटिंग देना चाहेंगे?",
            helper: "Select one rating from 1 to 5.",

            options: [
                {
                    id: "Q_RATING_5",
                    label: "5 — Excellent"
                },
                {
                    id: "Q_RATING_4",
                    label: "4 — Very good"
                },
                {
                    id: "Q_RATING_3",
                    label: "3 — Good"
                },
                {
                    id: "Q_RATING_2",
                    label: "2 — Needs improvement"
                },
                {
                    id: "Q_RATING_1",
                    label: "1 — Poor"
                }
            ]
        },

        {
            id: "Q_FEEDBACK",
            text: "Would you like to share anything in your own words?",
            hindi: "क्या आप अपने शब्दों में कुछ बताना चाहेंगे?",
            helper: "Choose one option.",

            options: [
                {
                    id: "Q_FEEDBACK_YES",
                    label: "Yes, I would like to share"
                },
                {
                    id: "Q_FEEDBACK_NO",
                    label: "No, that's all"
                }
            ]
        }
    ]
};


// =========================================
// STATE
// =========================================

const state = {

    reelId: null,
    reel: null,

    currentQuestionIndex: 0,

    answers: {},

    user: {
        name: CONFIG.fallbackName,
        email: CONFIG.fallbackEmail
    },

    questionStartedAt: null,

    questionTimings: {},

    formStartedAt: null,

    formCompletedAt: null,

    ttsActive: false,

    submitting: false
};


// =========================================
// DOM
// =========================================

const elements = {

    app:
        document.getElementById("feedback-app"),

    userStep:
        document.getElementById("user-step"),

    userForm:
        document.getElementById("user-form"),

    userName:
        document.getElementById("user-name"),

    userEmail:
        document.getElementById("user-email"),

    userFormError:
        document.getElementById("user-form-error"),

    reelSection:
        document.getElementById("reel-section"),

    reelThumbnail:
        document.getElementById("reel-thumbnail"),

    thumbnailFallback:
        document.getElementById("thumbnail-fallback"),

    reelTitle:
        document.getElementById("reel-title"),

    questionsSection:
        document.getElementById("questions-section"),

    questionForm:
        document.getElementById("question-form"),

    questionNumber:
        document.getElementById("question-number"),

    questionText:
        document.getElementById("question-text"),

    questionHelper:
        document.getElementById("question-helper"),

    optionsList:
        document.getElementById("options-list"),

    questionError:
        document.getElementById("question-error"),

    previousButton:
        document.getElementById("previous-button"),

    nextButton:
        document.getElementById("next-button"),

    nextButtonText:
        document.getElementById("next-button-text"),

    ttsButton:
        document.getElementById("tts-button"),

    progressLabel:
        document.getElementById("progress-label"),

    progressPercent:
        document.getElementById("progress-percent"),

    progressFill:
        document.getElementById("progress-fill"),

    thankYouSection:
        document.getElementById("thank-you-section"),

    facebookShareButton:
        document.getElementById("facebook-share-button"),

    invalidReelSection:
        document.getElementById("invalid-reel-section"),

    generalErrorSection:
        document.getElementById("general-error-section"),

    generalErrorMessage:
        document.getElementById("general-error-message"),

    retryButton:
        document.getElementById("retry-button")
};


// =========================================
// INITIALIZATION
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


async function initialize() {

    try {

        state.reelId =
            getReelIdFromUrl();


        if (!state.reelId) {

            showInvalidReel();

            return;
        }


        state.formStartedAt =
            Date.now();


        setupEventListeners();


        await loadReel();

    } catch (error) {

        console.error(
            "Initialization error:",
            error
        );

        showGeneralError(
            getFriendlyError(error)
        );
    }
}


// =========================================
// URL / REEL ID
// =========================================

function getReelIdFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const reelId =
        params.get("reel");


    if (!reelId) {
        return null;
    }


    return reelId.trim();
}


// =========================================
// LOAD REEL
// =========================================

async function loadReel() {

    try {

        const reel =
            await getReel(
                state.reelId
            );


        if (!reel) {

            showInvalidReel();

            return;
        }


        state.reel =
            reel;


        renderReel(
            reel
        );

    } catch (error) {

        console.error(
            "Reel loading error:",
            error
        );

        showGeneralError(
            getFriendlyError(error)
        );
    }
}


// =========================================
// RENDER REEL
// =========================================

function renderReel(reel) {

    const title =
        reel.title ||
        "Rudra Bhakti Reel";


    elements.reelTitle.textContent =
        title;


    const thumbnail =
        reel.thumbnail ||
        reel.thumbnailUrl ||
        "";


    if (thumbnail) {

        elements.reelThumbnail.src =
            thumbnail;

        elements.reelThumbnail.alt =
            `${title} preview`;

        elements.reelThumbnail.hidden =
            false;

        elements.thumbnailFallback.hidden =
            true;

    } else {

        elements.reelThumbnail.hidden =
            true;

        elements.thumbnailFallback.hidden =
            false;
    }


    elements.reelThumbnail.onerror =
        handleThumbnailError;


    showUserStep();
}


function handleThumbnailError() {

    elements.reelThumbnail.hidden =
        true;

    elements.thumbnailFallback.hidden =
        false;
}


// =========================================
// EVENT LISTENERS
// =========================================

function setupEventListeners() {

    elements.userForm?.addEventListener(
        "submit",
        handleUserFormSubmit
    );


    elements.previousButton?.addEventListener(
        "click",
        handlePrevious
    );


    elements.nextButton?.addEventListener(
        "click",
        handleNext
    );


    elements.ttsButton?.addEventListener(
        "click",
        handleTextToSpeech
    );


    elements.facebookShareButton?.addEventListener(
        "click",
        handleFacebookShare
    );


    elements.retryButton?.addEventListener(
        "click",
        handleRetry
    );


    window.addEventListener(
        "beforeunload",
        stopSpeech
    );
}


// =========================================
// USER INFORMATION
// =========================================

function handleUserFormSubmit(event) {

    event.preventDefault();


    clearUserError();


    const name =
        elements.userName.value.trim();


    const email =
        elements.userEmail.value.trim();


    if (
        email &&
        !isValidEmail(email)
    ) {

        showUserError(
            "Please enter a valid email address or leave it blank."
        );

        elements.userEmail.focus();

        return;
    }


    state.user.name =
        name ||
        CONFIG.fallbackName;


    state.user.email =
        email ||
        CONFIG.fallbackEmail;


    startQuestionFlow();
}


// =========================================
// QUESTION FLOW
// =========================================

function startQuestionFlow() {

    state.currentQuestionIndex =
        0;


    state.questionStartedAt =
        Date.now();


    elements.userStep.hidden =
        true;


    elements.reelSection.hidden =
        false;


    elements.questionsSection.hidden =
        false;


    elements.thankYouSection.hidden =
        true;


    elements.invalidReelSection.hidden =
        true;


    elements.generalErrorSection.hidden =
        true;


    renderQuestion();
}


function renderQuestion() {

    stopSpeech();


    const question =
        CONFIG.questions[
            state.currentQuestionIndex
        ];


    if (!question) {

        completeFeedback();

        return;
    }


    const total =
        CONFIG.questions.length;


    const index =
        state.currentQuestionIndex;


    const questionNumber =
        String(index + 1).padStart(
            2,
            "0"
        );


    const percent =
        Math.round(
            ((index + 1) / total) * 100
        );


    elements.questionNumber.textContent =
        questionNumber;


    elements.questionText.textContent =
        question.text;


    elements.questionHelper.textContent =
        question.helper;


    elements.progressLabel.textContent =
        `Question ${index + 1} of ${total}`;


    elements.progressPercent.textContent =
        `${percent}%`;


    elements.progressFill.style.width =
        `${percent}%`;


    renderOptions(
        question
    );


    elements.previousButton.hidden =
        index === 0;


    const isLast =
        index === total - 1;


    elements.nextButtonText.textContent =
        isLast
            ? "Submit feedback"
            : "Next";


    clearQuestionError();


    state.questionStartedAt =
        Date.now();
}


// =========================================
// RENDER OPTIONS
// =========================================

function renderOptions(question) {

    elements.optionsList.innerHTML =
        "";


    const selectedId =
        state.answers[
            question.id
        ]?.optionId ||
        "";


    question.options.forEach(
        (option, optionIndex) => {

            const wrapper =
                document.createElement("div");


            wrapper.className =
                "option-item";


            const inputId =
                `${question.id}_${option.id}`;


            const input =
                document.createElement("input");


            input.type =
                "radio";

            input.name =
                question.id;

            input.id =
                inputId;

            input.value =
                option.id;

            input.className =
                "option-input";

            input.checked =
                selectedId === option.id;


            input.addEventListener(
                "change",
                () => {

                    recordAnswer(
                        question,
                        option
                    );

                }
            );


            const label =
                document.createElement("label");


            label.className =
                "option-label";


            label.htmlFor =
                inputId;


            const indicator =
                document.createElement("span");


            indicator.className =
                "option-indicator";


            indicator.setAttribute(
                "aria-hidden",
                "true"
            );


            const text =
                document.createElement("span");


            text.className =
                "option-text";


            text.textContent =
                option.label;


            label.appendChild(
                indicator
            );


            label.appendChild(
                text
            );


            wrapper.appendChild(
                input
            );


            wrapper.appendChild(
                label
            );


            elements.optionsList.appendChild(
                wrapper
            );
        }
    );
}


// =========================================
// RECORD ANSWER
// =========================================

function recordAnswer(
    question,
    option
) {

    const now =
        Date.now();


    const started =
        state.questionStartedAt ||
        now;


    const duration =
        Math.max(
            0,
            now - started
        );


    state.answers[
        question.id
    ] = {

        questionId:
            question.id,

        questionText:
            question.text,

        optionId:
            option.id,

        optionText:
            option.label,

        answeredAt:
            now

    };


    state.questionTimings[
        question.id
    ] = {

        questionId:
            question.id,

        responseTimeMs:
            duration,

        responseTimeSeconds:
            Number(
                (
                    duration / 1000
                ).toFixed(2)
            )

    };


    clearQuestionError();
}


// =========================================
// NEXT
// =========================================

function handleNext() {

    const question =
        CONFIG.questions[
            state.currentQuestionIndex
        ];


    if (!question) {
        return;
    }


    const answer =
        state.answers[
            question.id
        ];


    if (!answer) {

        showQuestionError(
            "Please select an option to continue."
        );

        return;
    }


    const isLast =
        state.currentQuestionIndex ===
        CONFIG.questions.length - 1;


    if (isLast) {

        completeFeedback();

        return;
    }


    state.currentQuestionIndex += 1;


    renderQuestion();
}


// =========================================
// PREVIOUS
// =========================================

function handlePrevious() {

    if (
        state.currentQuestionIndex <= 0
    ) {

        return;
    }


    stopSpeech();


    state.currentQuestionIndex -= 1;


    renderQuestion();
}


// =========================================
// COMPLETE FEEDBACK
// =========================================

async function completeFeedback() {

    if (state.submitting) {
        return;
    }


    state.submitting =
        true;


    stopSpeech();


    setSubmitState(
        true
    );


    state.formCompletedAt =
        Date.now();


    try {

        const payload =
            buildFeedbackPayload();


        await saveFeedback(
            payload
        );


        showThankYou();

    } catch (error) {

        console.error(
            "Feedback submission error:",
            error
        );


        state.submitting =
            false;


        setSubmitState(
            false
        );


        showQuestionError(
            getFriendlyError(error)
        );

    }
}


// =========================================
// BUILD FEEDBACK PAYLOAD
// =========================================

function buildFeedbackPayload() {

    const submittedAt =
        state.formCompletedAt ||
        Date.now();


    const formDuration =
        state.formStartedAt
            ? submittedAt -
              state.formStartedAt
            : 0;


    const answers =
        {};


    Object.entries(
        state.answers
    ).forEach(
        ([questionId, answer]) => {

            answers[questionId] = {
                questionId:
                    answer.questionId,

                questionText:
                    answer.questionText,

                optionId:
                    answer.optionId,

                optionText:
                    answer.optionText,

                answeredAt:
                    answer.answeredAt,

                responseTimeMs:
                    state.questionTimings[
                        questionId
                    ]?.responseTimeMs ||
                    0,

                responseTimeSeconds:
                    state.questionTimings[
                        questionId
                    ]?.responseTimeSeconds ||
                    0
            };
        }
    );


    const ratingAnswer =
        state.answers.Q_RATING;


    const rating =
        extractRating(
            ratingAnswer
        );


    return {

        reelId:
            state.reelId,

        reelTitle:
            state.reel?.title ||
            "Unknown Reel",

        reelUrl:
            state.reel?.facebookUrl ||
            state.reel?.url ||
            "",

        user: {

            name:
                state.user.name,

            email:
                state.user.email

        },

        answers,

        rating,

        questionCount:
            CONFIG.questions.length,

        answeredCount:
            Object.keys(
                state.answers
            ).length,

        questionTimings:
            state.questionTimings,

        formStartedAt:
            state.formStartedAt,

        formCompletedAt:
            submittedAt,

        totalResponseTimeMs:
            formDuration,

        totalResponseTimeSeconds:
            Number(
                (
                    formDuration / 1000
                ).toFixed(2)
            ),

        userAgent:
            navigator.userAgent,

        language:
            navigator.language ||
            "",

        screenWidth:
            window.innerWidth,

        screenHeight:
            window.innerHeight,

        submittedAt
    };
}


// =========================================
// RATING
// =========================================

function extractRating(answer) {

    if (!answer?.optionId) {
        return null;
    }


    const match =
        answer.optionId.match(
            /Q_RATING_(\d+)/
        );


    if (!match) {
        return null;
    }


    return Number(
        match[1]
    );
}


// =========================================
// TEXT TO SPEECH
// =========================================

function handleTextToSpeech() {

    if (
        !("speechSynthesis" in window)
    ) {

        showQuestionError(
            "Text to speech is not supported by this browser."
        );

        return;
    }


    const question =
        CONFIG.questions[
            state.currentQuestionIndex
        ];


    if (!question) {
        return;
    }


    if (
        window.speechSynthesis.speaking
    ) {

        stopSpeech();

        return;
    }


    const utterance =
        new SpeechSynthesisUtterance(
            question.hindi
        );


    utterance.lang =
        "hi-IN";


    utterance.rate =
        0.88;


    utterance.pitch =
        1;


    utterance.volume =
        1;


    utterance.onstart =
        () => {

            state.ttsActive =
                true;

            elements.ttsButton.classList.add(
                "speaking"
            );
        };


    utterance.onend =
        resetTTSButton;


    utterance.onerror =
        resetTTSButton;


    window.speechSynthesis.speak(
        utterance
    );
}


function stopSpeech() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();
    }


    resetTTSButton();
}


function resetTTSButton() {

    state.ttsActive =
        false;


    elements.ttsButton?.classList.remove(
        "speaking"
    );
}


// =========================================
// FACEBOOK SHARE
// =========================================

function handleFacebookShare() {

    const currentUrl =
        window.location.href;


    const shareUrl =
        "https://www.facebook.com/sharer/sharer.php?u=" +
        encodeURIComponent(
            currentUrl
        );


    const width =
        620;

    const height =
        650;


    const left =
        Math.max(
            0,
            (
                window.screen.width -
                width
            ) / 2
        );


    const top =
        Math.max(
            0,
            (
                window.screen.height -
                height
            ) / 2
        );


    window.open(
        shareUrl,
        "facebook-share",
        `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
    );
}


// =========================================
// UI STATES
// =========================================

function showUserStep() {

    elements.userStep.hidden =
        false;

    elements.reelSection.hidden =
        true;

    elements.questionsSection.hidden =
        true;

    elements.thankYouSection.hidden =
        true;

    elements.invalidReelSection.hidden =
        true;

    elements.generalErrorSection.hidden =
        true;
}


function showThankYou() {

    elements.userStep.hidden =
        true;

    elements.reelSection.hidden =
        true;

    elements.questionsSection.hidden =
        true;

    elements.invalidReelSection.hidden =
        true;

    elements.generalErrorSection.hidden =
        true;

    elements.thankYouSection.hidden =
        false;


    setSubmitState(
        false
    );
}


function showInvalidReel() {

    elements.userStep.hidden =
        true;

    elements.reelSection.hidden =
        true;

    elements.questionsSection.hidden =
        true;

    elements.thankYouSection.hidden =
        true;

    elements.generalErrorSection.hidden =
        true;

    elements.invalidReelSection.hidden =
        false;
}


function showGeneralError(
    message
) {

    elements.userStep.hidden =
        true;

    elements.reelSection.hidden =
        true;

    elements.questionsSection.hidden =
        true;

    elements.thankYouSection.hidden =
        true;

    elements.invalidReelSection.hidden =
        true;

    elements.generalErrorSection.hidden =
        false;


    elements.generalErrorMessage.textContent =
        message;
}


// =========================================
// RETRY
// =========================================

async function handleRetry() {

    elements.generalErrorSection.hidden =
        true;


    try {

        await loadReel();

    } catch (error) {

        console.error(
            "Retry error:",
            error
        );

        showGeneralError(
            getFriendlyError(error)
        );
    }
}


// =========================================
// SUBMIT STATE
// =========================================

function setSubmitState(
    submitting
) {

    if (!elements.nextButton) {
        return;
    }


    elements.nextButton.disabled =
        submitting;


    if (submitting) {

        elements.nextButtonText.textContent =
            "Submitting...";

    } else {

        const isLast =
            state.currentQuestionIndex ===
            CONFIG.questions.length - 1;


        elements.nextButtonText.textContent =
            isLast
                ? "Submit feedback"
                : "Next";
    }
}


// =========================================
// VALIDATION
// =========================================

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


// =========================================
// ERROR UI
// =========================================

function showUserError(
    message
) {

    elements.userFormError.textContent =
        message;

    elements.userFormError.hidden =
        false;
}


function clearUserError() {

    elements.userFormError.textContent =
        "";

    elements.userFormError.hidden =
        true;
}


function showQuestionError(
    message
) {

    elements.questionError.textContent =
        message;

    elements.questionError.hidden =
        false;
}


function clearQuestionError() {

    elements.questionError.textContent =
        "";

    elements.questionError.hidden =
        true;
}


// =========================================
// FRIENDLY ERROR HANDLING
// =========================================

function getFriendlyError(
    error
) {

    if (
        error instanceof Error &&
        error.message
    ) {

        return error.message;
    }


    return "Something went wrong. Please try again.";
}
