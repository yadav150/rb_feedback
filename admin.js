// =========================================
// RUDRA BHAKTI
// ADMIN PANEL — ADMIN.JS
// =========================================

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    push,
    set,
    update,
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
// ADMIN SECURITY
// =========================================

const AUTHORIZED_ADMIN_UID =
    "CEozlrvQkuMUox2gKTlQOzdc3ZS2";


const INACTIVITY_LIMIT =
    60 * 1000;


// =========================================
// FIREBASE INITIALIZATION
// =========================================

const app =
    getApps().length
        ? getApp()
        : initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getDatabase(app);


// =========================================
// STATE
// =========================================

const state = {

    currentUser: null,

    currentSection: "analysis",

    reels: {},

    responses: [],

    selectedReel: "ALL",

    inactivityTimer: null,

    lastActivity: Date.now(),

    loadingAnalytics: false,

    savingReel: false
};


// =========================================
// DOM
// =========================================

const el = {

    loginSection:
        document.getElementById(
            "login-section"
        ),

    dashboardSection:
        document.getElementById(
            "dashboard-section"
        ),

    loginForm:
        document.getElementById(
            "login-form"
        ),

    adminEmail:
        document.getElementById(
            "admin-email"
        ),

    adminPassword:
        document.getElementById(
            "admin-password"
        ),

    loginButton:
        document.getElementById(
            "login-button"
        ),

    loginButtonText:
        document.getElementById(
            "login-button-text"
        ),

    loginError:
        document.getElementById(
            "login-error"
        ),

    logoutButton:
        document.getElementById(
            "logout-button"
        ),

    mobileMenuButton:
        document.getElementById(
            "mobile-menu-button"
        ),

    sidebar:
        document.getElementById(
            "admin-sidebar"
        ),

    overlay:
        document.getElementById(
            "admin-overlay"
        ),

    navItems:
        document.querySelectorAll(
            ".nav-item"
        ),

    analysisSection:
        document.getElementById(
            "analysis-section"
        ),

    addReelSection:
        document.getElementById(
            "add-reel-section"
        ),

    reelFilter:
        document.getElementById(
            "reel-filter"
        ),

    totalResponses:
        document.getElementById(
            "metric-total-responses"
        ),

    averageRating:
        document.getElementById(
            "metric-average-rating"
        ),

    moreContent:
        document.getElementById(
            "metric-more-content"
        ),

    totalReels:
        document.getElementById(
            "metric-total-reels"
        ),

    reelPerformance:
        document.getElementById(
            "reel-performance-list"
        ),

    feelingAnalysis:
        document.getElementById(
            "feeling-analysis"
        ),

    ratingAnalysis:
        document.getElementById(
            "rating-analysis"
        ),

    psychologyAnalysis:
        document.getElementById(
            "psychology-analysis"
        ),

    engagementAnalysis:
        document.getElementById(
            "engagement-analysis"
        ),

    responseTime:
        document.getElementById(
            "metric-response-time"
        ),

    fastestResponse:
        document.getElementById(
            "metric-fastest-response"
        ),

    slowestResponse:
        document.getElementById(
            "metric-slowest-response"
        ),

    answerCompletion:
        document.getElementById(
            "metric-answer-completion"
        ),

    recommendations:
        document.getElementById(
            "recommendations"
        ),

    addReelForm:
        document.getElementById(
            "add-reel-form"
        ),

    facebookUrl:
        document.getElementById(
            "facebook-url"
        ),

    reelTitleInput:
        document.getElementById(
            "reel-title-input"
        ),

    thumbnailUrl:
        document.getElementById(
            "thumbnail-url"
        ),

    reelFormError:
        document.getElementById(
            "reel-form-error"
        ),

    reelFormSuccess:
        document.getElementById(
            "reel-form-success"
        ),

    saveReelButton:
        document.getElementById(
            "save-reel-button"
        ),

    saveReelButtonText:
        document.getElementById(
            "save-reel-button-text"
        ),

    generatedLinkCard:
        document.getElementById(
            "generated-link-card"
        ),

    generatedReelId:
        document.getElementById(
            "generated-reel-id"
        ),

    generatedFeedbackUrl:
        document.getElementById(
            "generated-feedback-url"
        ),

    copyFeedbackUrl:
        document.getElementById(
            "copy-feedback-url"
        ),

    toast:
        document.getElementById(
            "admin-toast"
        )
};


// =========================================
// START
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


function initialize() {

    setupEvents();

    observeAuthentication();
}


// =========================================
// EVENTS
// =========================================

function setupEvents() {

    el.loginForm?.addEventListener(
        "submit",
        handleLogin
    );


    el.logoutButton?.addEventListener(
        "click",
        handleLogout
    );


    el.mobileMenuButton?.addEventListener(
        "click",
        toggleSidebar
    );


    el.overlay?.addEventListener(
        "click",
        closeSidebar
    );


    el.navItems.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    switchSection(
                        button.dataset.section
                    );
                }
            );
        }
    );


    el.reelFilter?.addEventListener(
        "change",
        () => {

            state.selectedReel =
                el.reelFilter.value;

            renderAnalytics();
        }
    );


    el.addReelForm?.addEventListener(
        "submit",
        handleAddReel
    );


    el.copyFeedbackUrl?.addEventListener(
        "click",
        copyFeedbackUrl
    );


    setupActivityTracking();
}


// =========================================
// AUTHENTICATION
// =========================================

function observeAuthentication() {

    onAuthStateChanged(
        auth,
        async user => {

            if (!user) {

                state.currentUser =
                    null;

                showLogin();

                return;
            }


            if (
                user.uid !==
                AUTHORIZED_ADMIN_UID
            ) {

                await signOut(auth);

                showLoginError(
                    "This account is not authorized to access the admin panel."
                );

                return;
            }


            state.currentUser =
                user;


            showDashboard();


            startInactivityTimer();


            await loadAdminData();
        }
    );
}


// =========================================
// LOGIN
// =========================================

async function handleLogin(
    event
) {

    event.preventDefault();


    clearLoginError();


    const email =
        el.adminEmail.value.trim();


    const password =
        el.adminPassword.value;


    if (!email || !password) {

        showLoginError(
            "Please enter your email and password."
        );

        return;
    }


    setLoginLoading(
        true
    );


    try {

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        if (
            credential.user.uid !==
            AUTHORIZED_ADMIN_UID
        ) {

            await signOut(auth);

            showLoginError(
                "This account is not authorized to access the admin panel."
            );

            return;
        }


        el.adminPassword.value =
            "";

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showLoginError(
            getLoginErrorMessage(
                error
            )
        );

    } finally {

        setLoginLoading(
            false
        );
    }
}


// =========================================
// LOGOUT
// =========================================

async function handleLogout() {

    stopInactivityTimer();


    try {

        await signOut(
            auth
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        showToast(
            "Unable to sign out. Please try again."
        );
    }
}


// =========================================
// LOGIN UI
// =========================================

function showLogin() {

    el.loginSection.hidden =
        false;

    el.dashboardSection.hidden =
        true;

    closeSidebar();

    stopInactivityTimer();
}


function showDashboard() {

    el.loginSection.hidden =
        true;

    el.dashboardSection.hidden =
        false;

    clearLoginError();
}


function setLoginLoading(
    loading
) {

    el.loginButton.disabled =
        loading;


    el.loginButtonText.textContent =
        loading
            ? "Signing in..."
            : "Sign in";
}


function showLoginError(
    message
) {

    el.loginError.textContent =
        message;

    el.loginError.hidden =
        false;
}


function clearLoginError() {

    el.loginError.textContent =
        "";

    el.loginError.hidden =
        true;
}


function getLoginErrorMessage(
    error
) {

    const code =
        error?.code || "";


    switch (code) {

        case "auth/invalid-credential":
        case "auth/invalid-login-credentials":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Invalid email or password.";

        case "auth/too-many-requests":
            return "Too many login attempts. Please wait and try again.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        default:
            return "Unable to sign in. Please check your credentials and try again.";
    }
}


// =========================================
// AUTO LOGOUT
// =========================================

function setupActivityTracking() {

    const activityEvents = [
        "mousemove",
        "mousedown",
        "keydown",
        "scroll",
        "touchstart",
        "click"
    ];


    activityEvents.forEach(
        eventName => {

            document.addEventListener(
                eventName,
                registerActivity,
                {
                    passive: true
                }
            );
        }
    );
}


function registerActivity() {

    if (!state.currentUser) {
        return;
    }


    state.lastActivity =
        Date.now();


    resetInactivityTimer();
}


function startInactivityTimer() {

    state.lastActivity =
        Date.now();


    resetInactivityTimer();
}


function resetInactivityTimer() {

    clearTimeout(
        state.inactivityTimer
    );


    state.inactivityTimer =
        setTimeout(
            checkInactivity,
            INACTIVITY_LIMIT
        );
}


async function checkInactivity() {

    if (!state.currentUser) {
        return;
    }


    const inactiveFor =
        Date.now() -
        state.lastActivity;


    if (
        inactiveFor >=
        INACTIVITY_LIMIT
    ) {

        showToast(
            "Your admin session expired due to inactivity."
        );


        try {

            await signOut(
                auth
            );

        } catch (error) {

            console.error(
                error
            );
        }


        return;
    }


    resetInactivityTimer();
}


function stopInactivityTimer() {

    clearTimeout(
        state.inactivityTimer
    );


    state.inactivityTimer =
        null;
}


// =========================================
// NAVIGATION
// =========================================

function switchSection(
    section
) {

    state.currentSection =
        section;


    el.navItems.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.section ===
                section
            );
        }
    );


    const showAnalysis =
        section ===
        "analysis";


    el.analysisSection.hidden =
        !showAnalysis;


    el.addReelSection.hidden =
        showAnalysis;


    closeSidebar();


    if (showAnalysis) {

        loadAnalytics();
    }
}


function toggleSidebar() {

    el.sidebar.classList.toggle(
        "sidebar-open"
    );


    el.overlay.hidden =
        !el.sidebar.classList.contains(
            "sidebar-open"
        );
}


function closeSidebar() {

    el.sidebar?.classList.remove(
        "sidebar-open"
    );


    if (el.overlay) {
        el.overlay.hidden =
            true;
    }
}


// =========================================
// LOAD ADMIN DATA
// =========================================

async function loadAdminData() {

    try {

        await Promise.all([
            loadReels(),
            loadResponses()
        ]);


        populateReelFilter();


        renderAnalytics();

    } catch (error) {

        console.error(
            "Admin data error:",
            error
        );


        showToast(
            "Unable to load admin data."
        );
    }
}


// =========================================
// LOAD REELS
// =========================================

async function loadReels() {

    const reelsRef =
        ref(
            db,
            "reels"
        );


    const snapshot =
        await get(
            reelsRef
        );


    state.reels =
        snapshot.exists()
            ? snapshot.val()
            : {};
}


// =========================================
// LOAD RESPONSES
// =========================================

async function loadResponses() {

    const responsesRef =
        ref(
            db,
            "feedback_responses"
        );


    const snapshot =
        await get(
            responsesRef
        );


    if (!snapshot.exists()) {

        state.responses =
            [];

        return;
    }


    const data =
        snapshot.val();


    state.responses =
        Object.entries(
            data
        ).map(
            ([id, value]) => ({
                responseId:
                    id,

                ...value
            })
        );
}


// =========================================
// REEL FILTER
// =========================================

function populateReelFilter() {

    const current =
        state.selectedReel;


    el.reelFilter.innerHTML =
        "";


    const allOption =
        document.createElement(
            "option"
        );


    allOption.value =
        "ALL";


    allOption.textContent =
        "All Reels";


    el.reelFilter.appendChild(
        allOption
    );


    Object.entries(
        state.reels
    ).forEach(
        ([reelId, reel]) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                reelId;


            option.textContent =
                reel?.title ||
                reelId;


            el.reelFilter.appendChild(
                option
            );
        }
    );


    const exists =
        [
            "ALL",
            ...Object.keys(
                state.reels
            )
        ].includes(
            current
        );


    state.selectedReel =
        exists
            ? current
            : "ALL";


    el.reelFilter.value =
        state.selectedReel;
}


// =========================================
// ANALYTICS
// =========================================

async function loadAnalytics() {

    if (
        state.loadingAnalytics
    ) {
        return;
    }


    state.loadingAnalytics =
        true;


    try {

        await Promise.all([
            loadReels(),
            loadResponses()
        ]);


        populateReelFilter();


        renderAnalytics();

    } catch (error) {

        console.error(
            "Analytics error:",
            error
        );

        showToast(
            "Unable to refresh analytics."
        );

    } finally {

        state.loadingAnalytics =
            false;
    }
}


function renderAnalytics() {

    const responses =
        getFilteredResponses();


    renderSummary(
        responses
    );


    renderReelPerformance(
        responses
    );


    renderFeelingAnalysis(
        responses
    );


    renderRatingAnalysis(
        responses
    );


    renderPsychology(
        responses
    );


    renderEngagement(
        responses
    );


    renderRecommendations(
        responses
    );
}


function getFilteredResponses() {

    if (
        state.selectedReel ===
        "ALL"
    ) {

        return [
            ...state.responses
        ];
    }


    return state.responses.filter(
        response =>
            response.reelId ===
            state.selectedReel
    );
}


// =========================================
// SUMMARY
// =========================================

function renderSummary(
    responses
) {

    const ratings =
        responses
            .map(
                response =>
                    Number(
                        response.rating
                    )
            )
            .filter(
                rating =>
                    rating >= 1 &&
                    rating <= 5
            );


    const average =
        ratings.length
            ? ratings.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) / ratings.length
            : null;


    const moreContent =
        responses.filter(
            response =>
                hasOption(
                    response,
                    "Q_MORE_CONTENT_YES"
                )
        ).length;


    const morePercentage =
        responses.length
            ? Math.round(
                (
                    moreContent /
                    responses.length
                ) * 100
            )
            : 0;


    el.totalResponses.textContent =
        responses.length.toLocaleString();


    el.averageRating.textContent =
        average === null
            ? "—"
            : average.toFixed(1);


    el.moreContent.textContent =
        responses.length
            ? `${morePercentage}%`
            : "—";


    el.totalReels.textContent =
        Object.keys(
            state.reels
        ).length.toLocaleString();
}


// =========================================
// REEL PERFORMANCE
// =========================================

function renderReelPerformance(
    responses
) {

    if (!responses.length) {

        showEmpty(
            el.reelPerformance,
            "No feedback yet",
            "Responses will appear here once viewers submit feedback."
        );

        return;
    }


    const grouped =
        {};


    responses.forEach(
        response => {

            const id =
                response.reelId ||
                "UNKNOWN";


            if (!grouped[id]) {

                grouped[id] = {
                    count: 0,
                    ratingTotal: 0,
                    ratingCount: 0
                };
            }


            grouped[id].count++;


            const rating =
                Number(
                    response.rating
                );


            if (
                rating >= 1 &&
                rating <= 5
            ) {

                grouped[id].ratingTotal +=
                    rating;

                grouped[id].ratingCount++;
            }
        }
    );


    const entries =
        Object.entries(
            grouped
        ).sort(
            (
                [, a],
                [, b]
            ) =>
                b.count -
                a.count
        );


    const maxCount =
        Math.max(
            ...entries.map(
                ([, value]) =>
                    value.count
            )
        );


    el.reelPerformance.innerHTML =
        "";


    entries.forEach(
        ([reelId, data]) => {

            const reel =
                state.reels[
                    reelId
                ] || {};


            const average =
                data.ratingCount
                    ? (
                        data.ratingTotal /
                        data.ratingCount
                    ).toFixed(1)
                    : "—";


            const percent =
                maxCount
                    ? Math.round(
                        (
                            data.count /
                            maxCount
                        ) * 100
                    )
                    : 0;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "performance-row";


            row.innerHTML = `
                <div class="performance-reel">
                    <strong></strong>
                    <span></span>
                </div>

                <div class="performance-bar-wrap">
                    <div
                        class="performance-bar"
                        style="width:${percent}%"
                    ></div>
                </div>

                <div class="performance-stat">
                    <strong>${data.count}</strong>
                    responses
                </div>

                <div class="performance-stat">
                    <strong>${average}</strong>
                    rating
                </div>
            `;


            row.querySelector(
                ".performance-reel strong"
            ).textContent =
                reel.title ||
                reelId;


            row.querySelector(
                ".performance-reel span"
            ).textContent =
                reelId;


            el.reelPerformance.appendChild(
                row
            );
        }
    );
}


// =========================================
// FEELING ANALYSIS
// =========================================

function renderFeelingAnalysis(
    responses
) {

    const counts =
        {};


    responses.forEach(
        response => {

            const option =
                getOptionId(
                    response,
                    "Q_FEELING"
                );


            if (!option) {
                return;
            }


            counts[option] =
                (
                    counts[option] ||
                    0
                ) + 1;
        }
    );


    renderOptionBars(
        el.feelingAnalysis,
        counts
    );
}


// =========================================
// RATING ANALYSIS
// =========================================

function renderRatingAnalysis(
    responses
) {

    const counts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    };


    responses.forEach(
        response => {

            const rating =
                Number(
                    response.rating ||
                    getRatingFromResponse(
                        response
                    )
                );


            if (
                rating >= 1 &&
                rating <= 5
            ) {

                counts[rating]++;
            }
        }
    );


    const total =
        responses.length;


    if (!total) {

        showEmpty(
            el.ratingAnalysis,
            "No ratings available yet.",
            ""
        );

        return;
    }


    el.ratingAnalysis.innerHTML =
        "";


    [5, 4, 3, 2, 1].forEach(
        rating => {

            const percent =
                Math.round(
                    (
                        counts[rating] /
                        total
                    ) * 100
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "rating-row";


            row.innerHTML = `
                <span class="rating-label">
                    ${rating} star
                </span>

                <div class="rating-bar-wrap">
                    <div
                        class="rating-bar"
                        style="width:${percent}%"
                    ></div>
                </div>

                <span class="rating-count">
                    ${counts[rating]}
                </span>
            `;


            el.ratingAnalysis.appendChild(
                row
            );
        }
    );
}


// =========================================
// PSYCHOLOGY
// =========================================

function renderPsychology(
    responses
) {

    if (!responses.length) {

        showEmpty(
            el.psychologyAnalysis,
            "Not enough data yet",
            "More responses are required to generate meaningful audience insights."
        );

        return;
    }


    const liked =
        responses.filter(
            response =>
                hasOption(
                    response,
                    "Q_FEELING_LIKED"
                ) ||
                hasOption(
                    response,
                    "Q_FEELING_GOOD"
                ) ||
                hasOption(
                    response,
                    "Q_FEELING_LOVED"
                )
        ).length;


    const strongConnection =
        responses.filter(
            response =>
                hasOption(
                    response,
                    "Q_CONNECTION_STRONG"
                )
        ).length;


    const wantsMore =
        responses.filter(
            response =>
                hasOption(
                    response,
                    "Q_MORE_CONTENT_YES"
                )
        ).length;


    const avgResponseTime =
        calculateAverageResponseTime(
            responses
        );


    const likedPercent =
        percentage(
            liked,
            responses.length
        );


    const connectionPercent =
        percentage(
            strongConnection,
            responses.length
        );


    const morePercent =
        percentage(
            wantsMore,
            responses.length
        );


    el.psychologyAnalysis.innerHTML = `
        <div class="insight-card">
            <span>Positive reaction</span>
            <strong>${likedPercent}%</strong>
            <p>
                Viewers showing a positive response
                to the reel experience.
            </p>
        </div>

        <div class="insight-card">
            <span>Emotional connection</span>
            <strong>${connectionPercent}%</strong>
            <p>
                Viewers reporting a strong connection
                with this content.
            </p>
        </div>

        <div class="insight-card">
            <span>Content demand</span>
            <strong>${morePercent}%</strong>
            <p>
                Viewers asking for more content
                similar to this reel.
            </p>
        </div>

        <div class="insight-card">
            <span>Decision speed</span>
            <strong>${formatDuration(avgResponseTime)}</strong>
            <p>
                Average time viewers take to respond
                after seeing a question.
            </p>
        </div>
    `;
}


// =========================================
// ENGAGEMENT
// =========================================

function renderEngagement(
    responses
) {

    if (!responses.length) {

        el.responseTime.textContent =
            "—";

        el.fastestResponse.textContent =
            "—";

        el.slowestResponse.textContent =
            "—";

        el.answerCompletion.textContent =
            "—";

        return;
    }


    const times =
        [];


    let answered =
        0;

    let possible =
        0;


    responses.forEach(
        response => {

            const timing =
                response.questionTimings ||
                {};


            Object.values(
                timing
            ).forEach(
                item => {

                    const time =
                        Number(
                            item.responseTimeMs
                        );


                    if (
                        Number.isFinite(time) &&
                        time >= 0
                    ) {

                        times.push(
                            time
                        );
                    }
                }
            );


            const answers =
                response.answers ||
                {};


            answered +=
                Object.keys(
                    answers
                ).length;


            possible +=
                Number(
                    response.questionCount
                ) ||
                Object.keys(
                    answers
                ).length;
        }
    );


    const average =
        times.length
            ? times.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) / times.length
            : null;


    const fastest =
        times.length
            ? Math.min(
                ...times
            )
            : null;


    const slowest =
        times.length
            ? Math.max(
                ...times
            )
            : null;


    const completion =
        possible
            ? Math.round(
                (
                    answered /
                    possible
                ) * 100
            )
            : 0;


    el.responseTime.textContent =
        formatDuration(
            average
        );


    el.fastestResponse.textContent =
        formatDuration(
            fastest
        );


    el.slowestResponse.textContent =
        formatDuration(
            slowest
        );


    el.answerCompletion.textContent =
        `${completion}%`;
}


// =========================================
// RECOMMENDATIONS
// =========================================

function renderRecommendations(
    responses
) {

    if (
        responses.length <
        3
    ) {

        showEmpty(
            el.recommendations,
            "Recommendations will appear after enough feedback is collected.",
            "At least 3 responses provide a more useful initial signal."
        );

        return;
    }


    const recommendations =
        [];


    const positive =
        responses.filter(
            response =>
                hasOption(
                    response,
                    "Q_FEELING_LIKED"
                ) ||
                hasOption(
                    response,
                    "Q_FEELING_GOOD"
                ) ||
                hasOption(
                    response,
                    "Q_FEELING_LOVED"
                )
        ).length;


    const more =
        responses.filter(
            response =>
                hasOption(
                    response,
                    "Q_MORE_CONTENT_YES"
                )
        ).length;


    const connection =
        responses.filter(
            response =>
                hasOption(
                    response,
                    "Q_CONNECTION_STRONG"
                )
        ).length;


    const positivePercent =
        percentage(
            positive,
            responses.length
        );


    const morePercent =
        percentage(
            more,
            responses.length
        );


    const connectionPercent =
        percentage(
            connection,
            responses.length
        );


    if (
        positivePercent >= 70
    ) {

        recommendations.push(
            "Your audience is responding positively. Continue developing reels with a similar emotional and devotional presentation."
        );

    } else if (
        positivePercent < 45
    ) {

        recommendations.push(
            "Positive reaction is relatively low. Experiment with stronger opening moments, clearer visuals, and a more emotionally engaging presentation."
        );

    } else {

        recommendations.push(
            "Audience reaction is mixed. Test different visual styles and opening moments to identify what creates a stronger response."
        );
    }


    if (
        morePercent >= 70
    ) {

        recommendations.push(
            "A strong majority wants similar content. This is a useful signal to continue this content direction."
        );
    }


    if (
        connectionPercent >= 60
    ) {

        recommendations.push(
            "The reel is creating a meaningful emotional connection. Similar themes may have strong potential for future reels."
        );
    }


    const averageRating =
        calculateAverageRating(
            responses
        );


    if (
        averageRating !== null &&
        averageRating >= 4
    ) {

        recommendations.push(
            `The average rating is ${averageRating.toFixed(1)}/5, indicating strong audience satisfaction.`
        );
    }


    const averageTime =
        calculateAverageResponseTime(
            responses
        );


    if (
        averageTime !== null &&
        averageTime < 4000
    ) {

        recommendations.push(
            "Viewers are making decisions quickly. Keep questions and interaction choices simple and easy to understand."
        );
    }


    el.recommendations.innerHTML =
        "";


    recommendations.forEach(
        recommendation => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "recommendation-item";


            item.textContent =
                recommendation;


            el.recommendations.appendChild(
                item
            );
        }
    );
}


// =========================================
// ADD REEL
// =========================================

async function handleAddReel(
    event
) {

    event.preventDefault();


    if (state.savingReel) {
        return;
    }


    clearReelMessages();


    const facebookUrl =
        el.facebookUrl.value.trim();


    let title =
        el.reelTitleInput.value.trim();


    const thumbnail =
        el.thumbnailUrl.value.trim();


    if (!facebookUrl) {

        showReelError(
            "Please enter the Facebook reel URL."
        );

        return;
    }


    if (
        !isValidUrl(
            facebookUrl
        )
    ) {

        showReelError(
            "Please enter a valid Facebook URL."
        );

        return;
    }


    state.savingReel =
        true;


    setSaveReelLoading(
        true
    );


    try {

        const reelId =
            await generateNextReelId();


        const detected =
            detectFacebookMetadata(
                facebookUrl
            );


        if (!title) {

            title =
                detected.title;
        }


        const reelData = {

            reelId,

            title:
                title ||
                `Rudra Bhakti Reel ${reelId}`,

            facebookUrl,

            thumbnail:
                thumbnail ||
                detected.thumbnail ||
                "",

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp(),

            createdBy:
                state.currentUser.uid,

            status:
                "active"
        };


        await set(
            ref(
                db,
                `reels/${reelId}`
            ),
            reelData
        );


        state.reels[
            reelId
        ] =
            reelData;


        populateReelFilter();


        showGeneratedLink(
            reelId
        );


        showReelSuccess(
            `Reel ${reelId} was added successfully.`
        );


        el.addReelForm.reset();


        await loadReels();


        populateReelFilter();

    } catch (error) {

        console.error(
            "Add reel error:",
            error
        );


        showReelError(
            getReelErrorMessage(
                error
            )
        );

    } finally {

        state.savingReel =
            false;


        setSaveReelLoading(
            false
        );
    }
}


// =========================================
// GENERATE REEL ID
// =========================================

async function generateNextReelId() {

    const reelsRef =
        ref(
            db,
            "reels"
        );


    const snapshot =
        await get(
            reelsRef
        );


    if (!snapshot.exists()) {

        return "RB001";
    }


    const reels =
        snapshot.val();


    let highest =
        0;


    Object.keys(
        reels
    ).forEach(
        id => {

            const match =
                id.match(
                    /^RB(\d+)$/i
                );


            if (!match) {
                return;
            }


            const number =
                Number(
                    match[1]
                );


            if (
                Number.isFinite(number)
            ) {

                highest =
                    Math.max(
                        highest,
                        number
                    );
            }
        }
    );


    return `RB${String(
        highest + 1
    ).padStart(
        3,
        "0"
    )}`;
}


// =========================================
// FACEBOOK METADATA
// =========================================

function detectFacebookMetadata(
    url
) {

    /*
     * A static browser page cannot reliably
     * scrape Facebook's Open Graph metadata
     * because of Facebook's CORS / access rules.
     *
     * Therefore we safely derive what we can
     * from the URL and leave manual fields
     * available as fallback.
     */

    return {

        title:
            "Rudra Bhakti Facebook Reel",

        thumbnail:
            ""
    };
}


// =========================================
// GENERATED LINK
// =========================================

function showGeneratedLink(
    reelId
) {

    const baseUrl =
        window.location.origin +
        window.location.pathname
            .replace(
                /admin\.html$/i,
                "index.html"
            );


    const feedbackUrl =
        `${baseUrl}?reel=${encodeURIComponent(
            reelId
        )}`;


    el.generatedReelId.textContent =
        reelId;


    el.generatedFeedbackUrl.value =
        feedbackUrl;


    el.generatedLinkCard.hidden =
        false;
}


// =========================================
// COPY LINK
// =========================================

async function copyFeedbackUrl() {

    const url =
        el.generatedFeedbackUrl.value;


    if (!url) {
        return;
    }


    try {

        await navigator.clipboard.writeText(
            url
        );


        showToast(
            "Feedback link copied."
        );

    } catch (error) {

        el.generatedFeedbackUrl.select();

        document.execCommand(
            "copy"
        );


        showToast(
            "Feedback link copied."
        );
    }
}


// =========================================
// HELPERS
// =========================================

function isValidUrl(
    value
) {

    try {

        const url =
            new URL(
                value
            );


        return (
            url.protocol ===
                "http:" ||
            url.protocol ===
                "https:"
        );

    } catch {

        return false;
    }
}


function hasOption(
    response,
    optionId
) {

    const answers =
        response?.answers ||
        {};


    return Object.values(
        answers
    ).some(
        answer =>
            answer?.optionId ===
            optionId
    );
}


function getOptionId(
    response,
    questionId
) {

    const answers =
        response?.answers ||
        {};


    const answer =
        answers[
            questionId
        ];


    return answer?.optionId ||
        null;
}


function getRatingFromResponse(
    response
) {

    const answer =
        getOptionId(
            response,
            "Q_RATING"
        );


    if (!answer) {
        return null;
    }


    const match =
        answer.match(
            /Q_RATING_(\d+)/
        );


    return match
        ? Number(match[1])
        : null;
}


function calculateAverageRating(
    responses
) {

    const ratings =
        responses
            .map(
                response =>
                    Number(
                        response.rating ||
                        getRatingFromResponse(
                            response
                        )
                    )
            )
            .filter(
                rating =>
                    rating >= 1 &&
                    rating <= 5
            );


    if (!ratings.length) {
        return null;
    }


    return (
        ratings.reduce(
            (sum, value) =>
                sum + value,
            0
        ) /
        ratings.length
    );
}


function calculateAverageResponseTime(
    responses
) {

    const times =
        [];


    responses.forEach(
        response => {

            const timings =
                response.questionTimings ||
                {};


            Object.values(
                timings
            ).forEach(
                timing => {

                    const value =
                        Number(
                            timing.responseTimeMs
                        );


                    if (
                        Number.isFinite(value) &&
                        value >= 0
                    ) {

                        times.push(
                            value
                        );
                    }
                }
            );
        }
    );


    if (!times.length) {
        return null;
    }


    return (
        times.reduce(
            (sum, value) =>
                sum + value,
            0
        ) /
        times.length
    );
}


function percentage(
    part,
    total
) {

    if (!total) {
        return 0;
    }


    return Math.round(
        (
            part /
            total
        ) * 100
    );
}


function formatDuration(
    milliseconds
) {

    if (
        milliseconds === null ||
        milliseconds === undefined ||
        !Number.isFinite(
            Number(milliseconds)
        )
    ) {

        return "—";
    }


    const seconds =
        Number(
            milliseconds
        ) / 1000;


    if (seconds < 60) {

        return `${seconds.toFixed(1)}s`;
    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        Math.round(
            seconds % 60
        );


    return `${minutes}m ${remaining}s`;
}


// =========================================
// EMPTY STATE
// =========================================

function showEmpty(
    container,
    title,
    description
) {

    container.innerHTML = `
        <div class="empty-state">
            <strong></strong>
            <span></span>
        </div>
    `;


    const strong =
        container.querySelector(
            ".empty-state strong"
        );


    const span =
        container.querySelector(
            ".empty-state span"
        );


    strong.textContent =
        title || "";


    span.textContent =
        description || "";
}


// =========================================
// ADD REEL UI
// =========================================

function setSaveReelLoading(
    loading
) {

    el.saveReelButton.disabled =
        loading;


    el.saveReelButtonText.textContent =
        loading
            ? "Saving..."
            : "Add Reel";
}


function showReelError(
    message
) {

    el.reelFormError.textContent =
        message;

    el.reelFormError.hidden =
        false;
}


function showReelSuccess(
    message
) {

    el.reelFormSuccess.textContent =
        message;

    el.reelFormSuccess.hidden =
        false;
}


function clearReelMessages() {

    el.reelFormError.textContent =
        "";

    el.reelFormError.hidden =
        true;


    el.reelFormSuccess.textContent =
        "";

    el.reelFormSuccess.hidden =
        true;
}


function getReelErrorMessage(
    error
) {

    if (
        error?.code ===
        "PERMISSION_DENIED"
    ) {

        return "Firebase denied this operation. Please check your Realtime Database rules.";
    }


    if (
        error?.message
    ) {

        return error.message;
    }


    return "Unable to add the reel. Please try again.";
}


// =========================================
// TOAST
// =========================================

let toastTimer =
    null;


function showToast(
    message
) {

    if (!el.toast) {
        return;
    }


    el.toast.textContent =
        message;


    el.toast.hidden =
        false;


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                el.toast.hidden =
                    true;

            },
            3000
        );
}
