import {
    getReel,
    saveFeedback
} from "./firebase-service.js";


/* =========================================================
   FIXED QUESTIONS
========================================================= */

const QUESTIONS = [
    {
        id: "Q_FEELING",
        text: "How did this Reel make you feel?",
        type: "single",
        options: [
            {
                id: "FEELING_PEACEFUL",
                label: "Peaceful"
            },
            {
                id: "FEELING_DEVOTIONAL",
                label: "Devotional"
            },
            {
                id: "FEELING_EMOTIONAL",
                label: "Emotional"
            },
            {
                id: "FEELING_INSPIRED",
                label: "Inspired"
            }
        ]
    },

    {
        id: "Q_MORE_CONTENT",
        text: "Would you like to see more content like this?",
        type: "single",
        options: [
            {
                id: "MORE_YES",
                label: "Yes"
            },
            {
                id: "MORE_NO",
                label: "No"
            }
        ]
    },

    {
        id: "Q_CONNECTION",
        text: "Did you feel a personal connection with this Reel?",
        type: "single",
        options: [
            {
                id: "CONNECTION_YES",
                label: "Yes"
            },
            {
                id: "CONNECTION_SOMEWHAT",
                label: "Somewhat"
            },
            {
                id: "CONNECTION_NO",
                label: "No"
            }
        ]
    },

    {
        id: "Q_RATING",
        text: "How would you rate this Reel?",
        type: "rating",
        options: [
            {
                id: "RATING_1",
                label: "1"
            },
            {
                id: "RATING_2",
                label: "2"
            },
            {
                id: "RATING_3",
                label: "3"
            },
            {
                id: "RATING_4",
                label: "4"
            },
            {
                id: "RATING_5",
                label: "5"
            }
        ]
    },

    {
        id: "Q_FEEDBACK",
        text: "Would you like to share anything about this Reel?",
        type: "textarea"
    }
];


/* =========================================================
   STATE
========================================================= */

const state = {

    reelId: null,

    reel: null,

    currentQuestionIndex: 0,

    answers: {},

    user: {
        name: "",
        email: ""
    },

    timings: {
        formStartedAt: null,
        userFormSubmittedAt: null,
        questionStartedAt: null,
        questionTimes: {}
    },

    tts: {
        enabled: true,
        speaking: false
    },

    submitting: false
};


/* =========================================================
   DOM
========================================================= */

const userStep =
    document.getElementById("user-step");

const userForm =
    document.getElementById("user-form");

const userName =
    document.getElementById("user-name");

const userEmail =
    document.getElementById("user-email");

const userFormError =
    document.getElementById("user-form-error");

const userNextButton =
    document.getElementById("user-next-button");

const reelSection =
    document.getElementById("reel-section");

const reelThumbnail =
    document.getElementById("reel-thumbnail");

const thumbnailFallback =
    document.getElementById("thumbnail-fallback");

const reelTitle =
    document.getElementById("reel-title");

const questionsSection =
    document.getElementById("questions-section");

const questionContainer =
    document.getElementById("question-container");

const questionNumber =
    document.getElementById("question-number");

const questionProgress =
    document.getElementById("question-progress");

const previousButton =
    document.getElementById("previous-button");

const nextQuestionButton =
    document.getElementById("next-question-button");

const submitButton =
    document.getElementById("submit-button");

const thankYouSection =
    document.getElementById("thank-you-section");

const facebookShareButton =
    document.getElementById("facebook-share-button");

const invalidReelSection =
    document.getElementById("invalid-reel-section");

const generalErrorSection =
    document.getElementById("general-error-section");

const generalErrorMessage =
    document.getElementById("general-error-message");

const retryButton =
    document.getElementById("retry-button");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


async function initialize() {

    state.timings.formStartedAt =
        Date.now();

    setupEventListeners();

    state.reelId =
        getReelIdFromUrl();

    if (!state.reelId) {

        showInvalidReel();

        return;
    }

    await loadReel();
}


/* =========================================================
   URL
========================================================= */

function getReelIdFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return (
        params.get("reel") ||
        ""
    )
        .trim()
        .toUpperCase();
}


/* =========================================================
   LOAD REEL
========================================================= */

async function loadReel() {

    try {

        hideAllSections();

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
            "Unable to load this Reel right now. Please try again."
        );
    }
}


/* =========================================================
   RENDER REEL
========================================================= */

function renderReel(reel) {

    const title =
        reel.title ||
        "Rudra Bhakti Reel";

    const thumbnail =
        reel.thumbnail ||
        "";

    if (reelTitle) {

        reelTitle.textContent =
            title;
    }

    if (reelThumbnail) {

        if (thumbnail) {

            reelThumbnail.src =
                thumbnail;

            reelThumbnail.alt =
                title;

            reelThumbnail.style.display =
                "block";

            if (thumbnailFallback) {
                thumbnailFallback.style.display =
                    "none";
            }

        } else {

            reelThumbnail.removeAttribute(
                "src"
            );

            reelThumbnail.style.display =
                "none";

            if (thumbnailFallback) {
                thumbnailFallback.style.display =
                    "flex";
            }
        }

        reelThumbnail.onerror =
            handleThumbnailError;
    }

    /*
     * Update browser metadata dynamically.
     */
    updatePageMetadata(
        reel
    );

    showElement(
        userStep
    );
}


/* =========================================================
   DYNAMIC PAGE METADATA
========================================================= */

function updatePageMetadata(reel) {

    const title =
        reel?.title ||
        "Rudra Bhakti Reel Feedback";

    const description =
        `Share your feedback on the Rudra Bhakti Reel: ${title}`;

    /*
     * Browser tab title.
     */
    document.title =
        `${title} — Rudra Bhakti Feedback`;


    /*
     * Standard description.
     */
    setMetaContent(
        "name",
        "description",
        description
    );


    /*
     * Open Graph metadata.
     *
     * These are updated for the current browser
     * document. Social crawlers may still require
     * server-generated HTML to read them before JS
     * executes.
     */
    setMetaContent(
        "property",
        "og:title",
        title
    );

    setMetaContent(
        "property",
        "og:description",
        description
    );

    setMetaContent(
        "property",
        "og:type",
        "website"
    );

    setMetaContent(
        "property",
        "og:url",
        window.location.href
    );

    if (reel?.thumbnail) {

        setMetaContent(
            "property",
            "og:image",
            reel.thumbnail
        );
    }


    /*
     * Twitter metadata.
     */
    setMetaContent(
        "name",
        "twitter:card",
        "summary_large_image"
    );

    setMetaContent(
        "name",
        "twitter:title",
        title
    );

    setMetaContent(
        "name",
        "twitter:description",
        description
    );

    if (reel?.thumbnail) {

        setMetaContent(
            "name",
            "twitter:image",
            reel.thumbnail
        );
    }
}


function setMetaContent(
    attribute,
    attributeValue,
    content
) {

    let element =
        document.querySelector(
            `meta[${attribute}="${attributeValue}"]`
        );

    if (!element) {

        element =
            document.createElement("meta");

        element.setAttribute(
            attribute,
            attributeValue
        );

        document.head.appendChild(
            element
        );
    }

    element.setAttribute(
        "content",
        content
    );
}


/* =========================================================
   THUMBNAIL ERROR
========================================================= */

function handleThumbnailError() {

    if (reelThumbnail) {

        reelThumbnail.style.display =
            "none";
    }

    if (thumbnailFallback) {

        thumbnailFallback.style.display =
            "flex";
    }
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

    if (userForm) {

        userForm.addEventListener(
            "submit",
            handleUserSubmit
        );
    }

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            handlePreviousQuestion
        );
    }

    if (nextQuestionButton) {

        nextQuestionButton.addEventListener(
            "click",
            handleNextQuestion
        );
    }

    if (submitButton) {

        submitButton.addEventListener(
            "click",
            handleSubmit
        );
    }

    if (facebookShareButton) {

        facebookShareButton.addEventListener(
            "click",
            handleFacebookShare
        );
    }

    if (retryButton) {

        retryButton.addEventListener(
            "click",
            async () => {

                await loadReel();
            }
        );
    }
}


/* =========================================================
   USER FORM
========================================================= */

function handleUserSubmit(event) {

    event.preventDefault();

    clearMessage(
        userFormError
    );

    const name =
        userName?.value.trim();

    const email =
        userEmail?.value.trim();

    if (!name) {

        showMessage(
            userFormError,
            "Please enter your name."
        );

        userName?.focus();

        return;
    }

    if (!email) {

        showMessage(
            userFormError,
            "Please enter your email."
        );

        userEmail?.focus();

        return;
    }

    if (!isValidEmail(email)) {

        showMessage(
            userFormError,
            "Please enter a valid email address."
        );

        userEmail?.focus();

        return;
    }

    state.user.name =
        name;

    state.user.email =
        email;

    state.timings.userFormSubmittedAt =
        Date.now();

    startQuestionFlow();
}


function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


/* =========================================================
   QUESTION FLOW
========================================================= */

function startQuestionFlow() {

    hideElement(
        userStep
    );

    showElement(
        reelSection
    );

    showElement(
        questionsSection
    );

    state.currentQuestionIndex =
        0;

    state.timings.questionStartedAt =
        Date.now();

    renderQuestion();
}


function renderQuestion() {

    const question =
        QUESTIONS[
            state.currentQuestionIndex
        ];

    if (!question) return;

    const total =
        QUESTIONS.length;

    const current =
        state.currentQuestionIndex + 1;

    if (questionNumber) {

        questionNumber.textContent =
            `${current} / ${total}`;
    }

    if (questionProgress) {

        questionProgress.style.width =
            `${(current / total) * 100}%`;
    }

    if (questionContainer) {

        questionContainer.innerHTML =
            buildQuestionHtml(
                question
            );
    }

    if (previousButton) {

        previousButton.disabled =
            state.currentQuestionIndex === 0;
    }

    const isLast =
        state.currentQuestionIndex ===
        total - 1;

    if (nextQuestionButton) {

        nextQuestionButton.style.display =
            isLast
                ? "none"
                : "inline-flex";
    }

    if (submitButton) {

        submitButton.style.display =
            isLast
                ? "inline-flex"
                : "none";
    }

    restoreAnswer(
        question
    );

    attachQuestionListeners(
        question
    );
}


/* =========================================================
   QUESTION HTML
========================================================= */

function buildQuestionHtml(question) {

    let html = `

        <div class="question-card">

            <div class="question-heading-row">

                <h2 class="question-text">
                    ${escapeHtml(
                        question.text
                    )}
                </h2>

                <button
                    type="button"
                    class="voice-button"
                    data-tts="${escapeHtml(
                        question.text
                    )}"
                    aria-label="Listen to question"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <path
                            d="M4 9v6"
                        ></path>

                        <path
                            d="M8 6v12"
                        ></path>

                        <path
                            d="M12 4v16"
                        ></path>

                        <path
                            d="M16 8v8"
                        ></path>

                        <path
                            d="M20 10v4"
                        ></path>
                    </svg>
                </button>

            </div>
    `;

    if (
        question.type === "single" ||
        question.type === "rating"
    ) {

        html += `
            <div
                class="question-options ${
                    question.type === "rating"
                        ? "rating-options"
                        : ""
                }"
            >
        `;

        question.options.forEach(
            (option) => {

                html += `
                    <button
                        type="button"
                        class="answer-option"
                        data-option-id="${escapeHtml(
                            option.id
                        )}"
                    >
                        <span class="option-label">
                            ${escapeHtml(
                                option.label
                            )}
                        </span>
                    </button>
                `;
            }
        );

        html += `
            </div>
        `;

    } else if (
        question.type === "textarea"
    ) {

        html += `
            <textarea
                id="feedback-textarea"
                class="feedback-textarea"
                rows="5"
                placeholder="Your thoughts..."
            ></textarea>
        `;
    }

    html += `
        </div>
    `;

    return html;
}


/* =========================================================
   QUESTION LISTENERS
========================================================= */

function attachQuestionListeners(
    question
) {

    const optionButtons =
        document.querySelectorAll(
            ".answer-option"
        );

    optionButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const optionId =
                        button.dataset.optionId;

                    state.answers[
                        question.id
                    ] = optionId;

                    optionButtons.forEach(
                        (item) => {
                            item.classList.remove(
                                "selected"
                            );
                        }
                    );

                    button.classList.add(
                        "selected"
                    );
                }
            );
        }
    );


    const voiceButton =
        document.querySelector(
            ".voice-button"
        );

    if (voiceButton) {

        voiceButton.addEventListener(
            "click",
            () => {

                speakText(
                    voiceButton.dataset.tts
                );
            }
        );
    }


    const textarea =
        document.getElementById(
            "feedback-textarea"
        );

    if (textarea) {

        textarea.addEventListener(
            "input",
            () => {

                state.answers[
                    question.id
                ] =
                    textarea.value;
            }
        );
    }
}


/* =========================================================
   RESTORE ANSWER
========================================================= */

function restoreAnswer(question) {

    const answer =
        state.answers[
            question.id
        ];

    if (
        answer === undefined ||
        answer === null
    ) {
        return;
    }

    if (
        question.type === "single" ||
        question.type === "rating"
    ) {

        const button =
            document.querySelector(
                `[data-option-id="${CSS.escape(
                    answer
                )}"]`
            );

        if (button) {

            button.classList.add(
                "selected"
            );
        }
    }

    if (
        question.type === "textarea"
    ) {

        const textarea =
            document.getElementById(
                "feedback-textarea"
            );

        if (textarea) {

            textarea.value =
                answer;
        }
    }
}


/* =========================================================
   NEXT QUESTION
========================================================= */

function handleNextQuestion() {

    if (
        !validateCurrentQuestion()
    ) {
        return;
    }

    recordQuestionTiming();

    state.currentQuestionIndex++;

    state.timings.questionStartedAt =
        Date.now();

    renderQuestion();
}


/* =========================================================
   PREVIOUS QUESTION
========================================================= */

function handlePreviousQuestion() {

    recordQuestionTiming();

    if (
        state.currentQuestionIndex <= 0
    ) {
        return;
    }

    state.currentQuestionIndex--;

    state.timings.questionStartedAt =
        Date.now();

    renderQuestion();
}


/* =========================================================
   VALIDATE QUESTION
========================================================= */

function validateCurrentQuestion() {

    const question =
        QUESTIONS[
            state.currentQuestionIndex
        ];

    if (!question) {
        return true;
    }

    const answer =
        state.answers[
            question.id
        ];

    if (
        question.type === "textarea"
    ) {

        return true;
    }

    if (
        answer === undefined ||
        answer === null ||
        answer === ""
    ) {

        showQuestionError(
            "Please select an answer to continue."
        );

        return false;
    }

    return true;
}


function showQuestionError(
    message
) {

    let error =
        document.getElementById(
            "question-error"
        );

    if (!error) {

        error =
            document.createElement(
                "div"
            );

        error.id =
            "question-error";

        error.className =
            "question-error";

        questionContainer?.appendChild(
            error
        );
    }

    error.textContent =
        message;
}


/* =========================================================
   QUESTION TIMING
========================================================= */

function recordQuestionTiming() {

    const question =
        QUESTIONS[
            state.currentQuestionIndex
        ];

    if (!question) return;

    const started =
        state.timings.questionStartedAt;

    if (!started) return;

    const elapsed =
        Date.now() - started;

    state.timings.questionTimes[
        question.id
    ] = elapsed;
}


/* =========================================================
   SUBMIT
========================================================= */

async function handleSubmit() {

    if (
        !validateCurrentQuestion()
    ) {
        return;
    }

    recordQuestionTiming();

    if (state.submitting) {
        return;
    }

    state.submitting =
        true;

    if (submitButton) {
        submitButton.disabled =
            true;
    }

    const completedAt =
        Date.now();

    const totalTime =
        completedAt -
        (
            state.timings.formStartedAt ||
            completedAt
        );

    const feedback = {

        reelId:
            state.reelId,

        user: {
            name:
                state.user.name,

            email:
                state.user.email
        },

        answers:
            state.answers,

        timings: {
            formStartedAt:
                state.timings.formStartedAt,

            userFormSubmittedAt:
                state.timings.userFormSubmittedAt,

            questionTimes:
                state.timings.questionTimes,

            totalTime
        }
    };

    try {

        await saveFeedback(
            feedback
        );

        showThankYou();

    } catch (error) {

        console.error(
            "Feedback submission error:",
            error
        );

        showQuestionError(
            "Unable to submit your feedback. Please try again."
        );

        if (submitButton) {
            submitButton.disabled =
                false;
        }

        state.submitting =
            false;
    }
}


/* =========================================================
   THANK YOU
========================================================= */

function showThankYou() {

    hideElement(
        questionsSection
    );

    showElement(
        thankYouSection
    );

    if (facebookShareButton) {

        facebookShareButton.dataset.url =
            window.location.href;
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   FACEBOOK SHARE
========================================================= */

function handleFacebookShare() {

    const shareUrl =
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            window.location.href
        )}`;

    window.open(
        shareUrl,
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================================
   TEXT TO SPEECH
========================================================= */

function speakText(text) {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );

    utterance.lang =
        "hi-IN";

    utterance.rate =
        0.9;

    utterance.pitch =
        1;

    window.speechSynthesis.speak(
        utterance
    );
}


/* =========================================================
   SECTION HELPERS
========================================================= */

function hideAllSections() {

    hideElement(userStep);
    hideElement(reelSection);
    hideElement(questionsSection);
    hideElement(thankYouSection);
    hideElement(invalidReelSection);
    hideElement(generalErrorSection);
}

function showInvalidReel() {

    hideAllSections();

    showElement(
        invalidReelSection
    );
}

function showGeneralError(message) {

    hideAllSections();

    if (generalErrorMessage) {

        generalErrorMessage.textContent =
            message;
    }

    showElement(
        generalErrorSection
    );
}

function showElement(element) {

    if (element) {
        element.classList.remove(
            "hidden"
        );
    }
}

function hideElement(element) {

    if (element) {
        element.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   MESSAGE HELPERS
========================================================= */

function showMessage(
    element,
    message
) {

    if (!element) return;

    element.textContent =
        message;

    element.style.display =
        "block";
}

function clearMessage(element) {

    if (!element) return;

    element.textContent =
        "";

    element.style.display =
        "";
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}
