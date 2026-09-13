import {
    getApps,
    getApp,
    initializeApp
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
    set,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyAoPVLSklKARDfdDoSm6L2zk1kabJVpsw",
    authDomain: "rudrabhakti-a1d3e.firebaseapp.com",
    databaseURL: "https://rudrabhakti-a1d3e-default-rtdb.firebaseio.com",
    projectId: "rudrabhakti-a1d3e",
    storageBucket: "rudrabhakti-a1d3e.firebasestorage.app",
    messagingSenderId: "96491326088",
    appId: "1:96491326088:web:16b33c95f6aa67b5936d3d",
    measurementId: "G-RYKGBGSLVB"
};

const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getDatabase(app);


/* =========================================================
   ADMIN SECURITY
========================================================= */

const AUTHORIZED_ADMIN_UID =
    "CEozlrvQkuMUox2gKTlQOzdc3ZS2";


/* =========================================================
   CLOUD FUNCTION
========================================================= */

const METADATA_FUNCTION_URL =
    "https://us-central1-rudrabhakti-a1d3e.cloudfunctions.net/fetchFacebookMetadata";


/* =========================================================
   STATE
========================================================= */

let reelsData = {};
let feedbackData = {};

let inactivityTimer = null;
let toastTimer = null;

const INACTIVITY_LIMIT = 60 * 1000;


/* =========================================================
   DOM
========================================================= */

const loginSection =
    document.getElementById("login-section");

const dashboardSection =
    document.getElementById("dashboard-section");

const loginForm =
    document.getElementById("login-form");

const adminEmail =
    document.getElementById("admin-email");

const adminPassword =
    document.getElementById("admin-password");

const loginError =
    document.getElementById("login-error");

const loginButton =
    document.getElementById("login-button");

const loginButtonText =
    document.getElementById("login-button-text");

const loginSpinner =
    document.getElementById("login-spinner");

const logoutButton =
    document.getElementById("logout-button");

const mobileMenuButton =
    document.getElementById("mobile-menu-button");

const adminSidebar =
    document.getElementById("admin-sidebar");

const adminOverlay =
    document.getElementById("admin-overlay");

const navItems =
    document.querySelectorAll(".nav-item");

const analysisSection =
    document.getElementById("analysis-section");

const addReelSection =
    document.getElementById("add-reel-section");

const reelFilter =
    document.getElementById("reel-filter");

const addReelForm =
    document.getElementById("add-reel-form");

const facebookUrlInput =
    document.getElementById("facebook-url");

const reelTitleInput =
    document.getElementById("reel-title-input");

const thumbnailInput =
    document.getElementById("thumbnail-url");

const fetchMetadataButton =
    document.getElementById("fetch-metadata-button");

const fetchMetadataText =
    document.getElementById("fetch-metadata-text");

const fetchMetadataSpinner =
    document.getElementById("fetch-metadata-spinner");

const fetchMetadataIcon =
    document.getElementById("fetch-metadata-icon");

const metadataStatus =
    document.getElementById("metadata-status");

const reelFormError =
    document.getElementById("reel-form-error");

const reelFormSuccess =
    document.getElementById("reel-form-success");

const saveReelButton =
    document.getElementById("save-reel-button");

const saveReelButtonText =
    document.getElementById("save-reel-button-text");

const saveReelSpinner =
    document.getElementById("save-reel-spinner");

const generatedLinkCard =
    document.getElementById("generated-link-card");

const generatedReelId =
    document.getElementById("generated-reel-id");

const generatedFeedbackUrl =
    document.getElementById("generated-feedback-url");

const copyFeedbackUrl =
    document.getElementById("copy-feedback-url");

const addedReelsTableBody =
    document.getElementById("added-reels-table-body");

const addedReelsCount =
    document.getElementById("added-reels-count");

const adminToast =
    document.getElementById("admin-toast");

const adminToastMessage =
    document.getElementById("admin-toast-message");


/* =========================================================
   HELPERS
========================================================= */

function showElement(element) {
    if (element) {
        element.classList.remove("hidden");
    }
}

function hideElement(element) {
    if (element) {
        element.classList.add("hidden");
    }
}

function setMessage(element, message) {
    if (!element) return;

    element.textContent = message || "";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function isValidFacebookUrl(value) {
    try {
        const url = new URL(value);

        if (url.protocol !== "https:") {
            return false;
        }

        const hostname =
            url.hostname.toLowerCase();

        return (
            hostname === "facebook.com" ||
            hostname === "www.facebook.com" ||
            hostname === "m.facebook.com" ||
            hostname === "web.facebook.com" ||
            hostname === "fb.watch" ||
            hostname.endsWith(".facebook.com")
        );

    } catch {
        return false;
    }
}

function formatDate(timestamp) {
    if (!timestamp) {
        return "—";
    }

    const date = new Date(
        typeof timestamp === "number"
            ? timestamp
            : Number(timestamp)
    );

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function formatTime(timestamp) {
    if (!timestamp) {
        return "—";
    }

    const date = new Date(
        typeof timestamp === "number"
            ? timestamp
            : Number(timestamp)
    );

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {
    if (!adminToast || !adminToastMessage) {
        return;
    }

    adminToastMessage.textContent = message;

    adminToast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        adminToast.classList.remove("show");
    }, 3000);
}


/* =========================================================
   BUTTON STATES
========================================================= */

function setLoginLoading(loading) {
    if (!loginButton) return;

    loginButton.disabled = loading;

    if (loading) {
        loginButton.classList.add("is-loading");

        if (loginButtonText) {
            loginButtonText.textContent =
                "Signing in...";
        }

        if (loginSpinner) {
            loginSpinner.style.display =
                "inline-block";
        }

    } else {
        loginButton.classList.remove("is-loading");

        if (loginButtonText) {
            loginButtonText.textContent =
                "Login";
        }

        if (loginSpinner) {
            loginSpinner.style.display =
                "none";
        }
    }
}

function setFetchLoading(loading) {
    if (!fetchMetadataButton) return;

    fetchMetadataButton.disabled = loading;

    if (loading) {
        fetchMetadataButton.classList.add(
            "is-loading"
        );

        if (fetchMetadataText) {
            fetchMetadataText.textContent =
                "Fetching...";
        }

        if (fetchMetadataSpinner) {
            fetchMetadataSpinner.style.display =
                "inline-block";
        }

        if (fetchMetadataIcon) {
            fetchMetadataIcon.style.display =
                "none";
        }

    } else {
        fetchMetadataButton.classList.remove(
            "is-loading"
        );

        if (fetchMetadataText) {
            fetchMetadataText.textContent =
                "Fetch Details";
        }

        if (fetchMetadataSpinner) {
            fetchMetadataSpinner.style.display =
                "none";
        }

        if (fetchMetadataIcon) {
            fetchMetadataIcon.style.display =
                "block";
        }
    }
}

function setSaveLoading(loading) {
    if (!saveReelButton) return;

    saveReelButton.disabled = loading;

    if (loading) {
        saveReelButton.classList.add(
            "is-loading"
        );

        if (saveReelButtonText) {
            saveReelButtonText.textContent =
                "Adding Reel...";
        }

        if (saveReelSpinner) {
            saveReelSpinner.style.display =
                "inline-block";
        }

    } else {
        saveReelButton.classList.remove(
            "is-loading"
        );

        if (saveReelButtonText) {
            saveReelButtonText.textContent =
                "Add Reel";
        }

        if (saveReelSpinner) {
            saveReelSpinner.style.display =
                "none";
        }
    }
}


/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        showLogin();
        return;
    }

    if (user.uid !== AUTHORIZED_ADMIN_UID) {

        await signOut(auth);

        showLogin();

        setMessage(
            loginError,
            "This account is not authorized to access the admin panel."
        );

        return;
    }

    showDashboard();

    startInactivityTimer();

    await loadDashboardData();
});


function showLogin() {
    showElement(loginSection);
    hideElement(dashboardSection);

    stopInactivityTimer();
}


function showDashboard() {
    hideElement(loginSection);
    showElement(dashboardSection);
}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            setMessage(
                loginError,
                ""
            );

            const email =
                adminEmail?.value.trim();

            const password =
                adminPassword?.value || "";

            if (!email || !password) {

                setMessage(
                    loginError,
                    "Enter your email and password."
                );

                return;
            }

            setLoginLoading(true);

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

                    throw new Error(
                        "UNAUTHORIZED_ADMIN"
                    );
                }

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                if (
                    error.message ===
                    "UNAUTHORIZED_ADMIN"
                ) {

                    setMessage(
                        loginError,
                        "This account is not authorized."
                    );

                } else {

                    setMessage(
                        loginError,
                        "Invalid email or password."
                    );
                }

            } finally {

                setLoginLoading(false);
            }
        }
    );
}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            stopInactivityTimer();

            await signOut(auth);

            showLogin();
        }
    );
}


/* =========================================================
   INACTIVITY LOGOUT
========================================================= */

function resetInactivityTimer() {

    clearTimeout(inactivityTimer);

    if (!auth.currentUser) {
        return;
    }

    inactivityTimer =
        setTimeout(async () => {

            await signOut(auth);

            showLogin();

            setMessage(
                loginError,
                "You were logged out after 1 minute of inactivity."
            );

        }, INACTIVITY_LIMIT);
}

function startInactivityTimer() {

    resetInactivityTimer();

    [
        "mousemove",
        "mousedown",
        "keydown",
        "scroll",
        "touchstart",
        "click"
    ].forEach((eventName) => {

        document.addEventListener(
            eventName,
            resetInactivityTimer,
            { passive: true }
        );
    });
}

function stopInactivityTimer() {

    clearTimeout(inactivityTimer);

    inactivityTimer = null;
}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function closeMobileSidebar() {

    adminSidebar?.classList.remove("open");

    adminOverlay?.classList.remove("show");
}

if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
        "click",
        () => {

            adminSidebar?.classList.toggle(
                "open"
            );

            adminOverlay?.classList.toggle(
                "show"
            );
        }
    );
}

if (adminOverlay) {

    adminOverlay.addEventListener(
        "click",
        closeMobileSidebar
    );
}


/* =========================================================
   NAVIGATION
========================================================= */

navItems.forEach((item) => {

    item.addEventListener(
        "click",
        () => {

            const section =
                item.dataset.section;

            navItems.forEach((nav) => {
                nav.classList.remove("active");
            });

            item.classList.add("active");

            if (section === "analysis") {

                showElement(analysisSection);
                hideElement(addReelSection);

            } else if (section === "add-reel") {

                hideElement(analysisSection);
                showElement(addReelSection);

                loadAddedReelsTable();
            }

            closeMobileSidebar();
        }
    );
});


/* =========================================================
   LOAD DASHBOARD DATA
========================================================= */

async function loadDashboardData() {

    try {

        const reelsSnapshot =
            await get(ref(db, "reels"));

        const feedbackSnapshot =
            await get(
                ref(db, "feedback_responses")
            );

        reelsData =
            reelsSnapshot.exists()
                ? reelsSnapshot.val()
                : {};

        feedbackData =
            feedbackSnapshot.exists()
                ? feedbackSnapshot.val()
                : {};

        populateReelFilter();

        renderAnalytics();

        loadAddedReelsTable();

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

        showToast(
            "Unable to load dashboard data."
        );
    }
}


/* =========================================================
   REEL FILTER
========================================================= */

function populateReelFilter() {

    if (!reelFilter) return;

    reelFilter.innerHTML = `
        <option value="ALL">
            All Reels
        </option>
    `;

    const reels = Object.values(
        reelsData || {}
    );

    reels
        .sort(sortReelsNewestFirst)
        .forEach((reel) => {

            const id =
                reel.reelId ||
                reel.id;

            if (!id) return;

            const option =
                document.createElement("option");

            option.value = id;

            option.textContent =
                `${id} — ${reel.title || "Untitled Reel"}`;

            reelFilter.appendChild(option);
        });
}

if (reelFilter) {

    reelFilter.addEventListener(
        "change",
        () => {
            renderAnalytics();
        }
    );
}


/* =========================================================
   REEL SORTING
========================================================= */

function getReelTimestamp(reel) {

    return Number(
        reel?.createdAt ||
        reel?.updatedAt ||
        0
    );
}

function sortReelsNewestFirst(a, b) {

    return (
        getReelTimestamp(b) -
        getReelTimestamp(a)
    );
}


/* =========================================================
   ADDED REELS TABLE
========================================================= */

function loadAddedReelsTable() {

    if (!addedReelsTableBody) {
        return;
    }

    const reels =
        Object.values(reelsData || {})
            .sort(sortReelsNewestFirst);

    if (!reels.length) {

        addedReelsTableBody.innerHTML = `
            <tr class="table-empty-row">
                <td colspan="5">
                    No reels added yet.
                </td>
            </tr>
        `;

        if (addedReelsCount) {
            addedReelsCount.textContent =
                "0 Reels";
        }

        return;
    }

    if (addedReelsCount) {

        addedReelsCount.textContent =
            `${reels.length} ${
                reels.length === 1
                    ? "Reel"
                    : "Reels"
            }`;
    }

    addedReelsTableBody.innerHTML =
        reels.map((reel) => {

            const reelId =
                reel.reelId ||
                reel.id ||
                "—";

            const title =
                reel.title ||
                "Untitled Reel";

            const facebookUrl =
                reel.facebookUrl ||
                reel.facebookURL ||
                reel.postUrl ||
                reel.url ||
                "";

            const status =
                reel.status ||
                "active";

            const createdAt =
                reel.createdAt ||
                reel.updatedAt ||
                0;

            const safeId =
                escapeHtml(reelId);

            const safeTitle =
                escapeHtml(title);

            const safeStatus =
                escapeHtml(status);

            const safeUrl =
                escapeHtml(facebookUrl);

            return `
                <tr>

                    <td>
                        <span class="table-reel-id">
                            ${safeId}
                        </span>
                    </td>

                    <td>
                        <div
                            class="table-title"
                            title="${safeTitle}"
                        >
                            ${safeTitle}
                        </div>
                    </td>

                    <td>
                        ${
                            facebookUrl
                                ? `
                                    <a
                                        class="table-facebook-url"
                                        href="${safeUrl}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="${safeUrl}"
                                    >
                                        ${safeUrl}
                                    </a>
                                `
                                : "—"
                        }
                    </td>

                    <td>
                        <span
                            class="table-status ${
                                String(status).toLowerCase()
                            }"
                        >
                            ${safeStatus}
                        </span>
                    </td>

                    <td>
                        <span class="table-date">
                            ${formatDate(createdAt)}
                        </span>
                    </td>

                </tr>
            `;

        }).join("");
}


/* =========================================================
   GENERATE NEXT REEL ID
========================================================= */

function generateNextReelId() {

    const ids =
        Object.keys(reelsData || {});

    let highestNumber = 0;

    ids.forEach((id) => {

        const match =
            String(id).match(/^RB(\d+)$/i);

        if (!match) return;

        const number =
            Number(match[1]);

        if (number > highestNumber) {
            highestNumber = number;
        }
    });

    return `RB${String(
        highestNumber + 1
    ).padStart(3, "0")}`;
}


/* =========================================================
   FACEBOOK METADATA FETCH
========================================================= */

async function fetchFacebookMetadata() {

    const facebookUrl =
        facebookUrlInput?.value.trim();

    if (!facebookUrl) {

        setMetadataStatus(
            "Enter a Facebook Reel URL first.",
            "error"
        );

        facebookUrlInput?.focus();

        return false;
    }

    if (!isValidFacebookUrl(facebookUrl)) {

        setMetadataStatus(
            "Enter a valid Facebook URL.",
            "error"
        );

        facebookUrlInput?.focus();

        return false;
    }

    setFetchLoading(true);

    setMetadataStatus(
        "Fetching Reel details from Facebook...",
        "loading"
    );

    try {

        const response =
            await fetch(
                METADATA_FUNCTION_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        url: facebookUrl
                    })
                }
            );

        let result = null;

        try {
            result = await response.json();
        } catch {
            result = null;
        }

        if (
            !response.ok ||
            !result?.ok
        ) {

            throw new Error(
                result?.error ||
                "Facebook Reel metadata could not be fetched."
            );
        }

        if (result.title) {

            reelTitleInput.value =
                result.title;
        }

        if (result.thumbnail) {

            thumbnailInput.value =
                result.thumbnail;
        }

        setMetadataStatus(
            "Reel details fetched successfully.",
            "success"
        );

        return true;

    } catch (error) {

        console.error(
            "Metadata fetch error:",
            error
        );

        setMetadataStatus(
            error.message ||
            "Unable to fetch Reel details.",
            "error"
        );

        return false;

    } finally {

        setFetchLoading(false);
    }
}

function setMetadataStatus(
    message,
    type = ""
) {

    if (!metadataStatus) return;

    metadataStatus.textContent =
        message || "";

    metadataStatus.className =
        "metadata-status";

    if (type) {
        metadataStatus.classList.add(type);
    }
}

if (fetchMetadataButton) {

    fetchMetadataButton.addEventListener(
        "click",
        fetchFacebookMetadata
    );
}


/* =========================================================
   AUTO FETCH WHEN URL CHANGES
========================================================= */

let facebookUrlDebounce = null;

if (facebookUrlInput) {

    facebookUrlInput.addEventListener(
        "input",
        () => {

            clearTimeout(
                facebookUrlDebounce
            );

            setMetadataStatus("", "");

            facebookUrlDebounce =
                setTimeout(() => {

                    const value =
                        facebookUrlInput.value.trim();

                    if (
                        value &&
                        isValidFacebookUrl(value)
                    ) {
                        fetchFacebookMetadata();
                    }

                }, 700);
        }
    );
}


/* =========================================================
   ADD REEL
========================================================= */

if (addReelForm) {

    addReelForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            setMessage(
                reelFormError,
                ""
            );

            setMessage(
                reelFormSuccess,
                ""
            );

            const facebookUrl =
                facebookUrlInput?.value.trim();

            let title =
                reelTitleInput?.value.trim();

            let thumbnail =
                thumbnailInput?.value.trim();

            if (!facebookUrl) {

                setMessage(
                    reelFormError,
                    "Facebook Reel URL is required."
                );

                return;
            }

            if (!isValidFacebookUrl(facebookUrl)) {

                setMessage(
                    reelFormError,
                    "Please enter a valid Facebook Reel URL."
                );

                return;
            }

            /*
             * If title is empty, try fetching metadata
             * automatically before saving.
             */
            if (!title) {

                const fetched =
                    await fetchFacebookMetadata();

                title =
                    reelTitleInput?.value.trim();

                thumbnail =
                    thumbnailInput?.value.trim();

                if (!fetched && !title) {

                    setMessage(
                        reelFormError,
                        "Could not fetch the Reel title. Please enter the title manually."
                    );

                    return;
                }
            }

            if (!title) {

                setMessage(
                    reelFormError,
                    "Reel title is required."
                );

                return;
            }

            const reelId =
                generateNextReelId();

            setSaveLoading(true);

            try {

                const reelData = {

                    reelId,

                    title,

                    facebookUrl,

                    thumbnail: thumbnail || "",

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp(),

                    createdBy:
                        AUTHORIZED_ADMIN_UID,

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

                /*
                 * Update local state immediately so
                 * the new Reel appears without requiring
                 * a page refresh.
                 */
                reelsData[reelId] = {
                    ...reelData,

                    createdAt:
                        Date.now(),

                    updatedAt:
                        Date.now()
                };

                populateReelFilter();

                renderAnalytics();

                loadAddedReelsTable();

                const feedbackUrl =
                    generateFeedbackUrl(
                        reelId
                    );

                if (generatedReelId) {
                    generatedReelId.textContent =
                        reelId;
                }

                if (generatedFeedbackUrl) {
                    generatedFeedbackUrl.value =
                        feedbackUrl;
                }

                showElement(
                    generatedLinkCard
                );

                setMessage(
                    reelFormSuccess,
                    `${reelId} added successfully.`
                );

                showToast(
                    `${reelId} added successfully.`
                );

                /*
                 * Clear form only after successful save.
                 */
                addReelForm.reset();

                setMetadataStatus(
                    "",
                    ""
                );

            } catch (error) {

                console.error(
                    "Add Reel error:",
                    error
                );

                setMessage(
                    reelFormError,
                    "Unable to save the Reel. Please try again."
                );

            } finally {

                setSaveLoading(false);
            }
        }
    );
}


/* =========================================================
   FEEDBACK URL
========================================================= */

function generateFeedbackUrl(reelId) {

    const currentUrl =
        new URL(
            window.location.href
        );

    const pathname =
        currentUrl.pathname;

    const adminIndex =
        pathname.lastIndexOf(
            "admin.html"
        );

    let feedbackPath;

    if (adminIndex !== -1) {

        feedbackPath =
            pathname.substring(
                0,
                adminIndex
            ) +
            "index.html";

    } else {

        feedbackPath =
            pathname
                .replace(
                    /[^/]*$/,
                    ""
                ) +
            "index.html";
    }

    return (
        currentUrl.origin +
        feedbackPath +
        `?reel=${encodeURIComponent(reelId)}`
    );
}


/* =========================================================
   COPY FEEDBACK URL
========================================================= */

if (copyFeedbackUrl) {

    copyFeedbackUrl.addEventListener(
        "click",
        async () => {

            const value =
                generatedFeedbackUrl?.value;

            if (!value) return;

            try {

                await navigator.clipboard.writeText(
                    value
                );

                showToast(
                    "Feedback URL copied."
                );

            } catch {

                generatedFeedbackUrl.select();

                document.execCommand(
                    "copy"
                );

                showToast(
                    "Feedback URL copied."
                );
            }
        }
    );
}


/* =========================================================
   ANALYTICS
========================================================= */

function getFilteredFeedback() {

    const selected =
        reelFilter?.value || "ALL";

    const responses =
        Object.values(
            feedbackData || {}
        );

    if (selected === "ALL") {
        return responses;
    }

    return responses.filter(
        (response) =>
            response.reelId === selected
    );
}


function renderAnalytics() {

    const responses =
        getFilteredFeedback();

    renderSummaryMetrics(responses);

    renderReelPerformance();

    renderFeelingAnalysis(responses);

    renderRatingAnalysis(responses);

    renderPsychologyAnalysis(responses);

    renderEngagementAnalysis(responses);

    renderRecommendations(responses);
}


/* =========================================================
   SUMMARY METRICS
========================================================= */

function renderSummaryMetrics(responses) {

    const totalResponses =
        responses.length;

    const ratings =
        responses
            .map(
                (response) =>
                    Number(
                        response.answers?.Q_RATING
                    )
            )
            .filter(
                (value) =>
                    Number.isFinite(value)
            );

    const averageRating =
        ratings.length
            ? ratings.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) / ratings.length
            : 0;

    const moreContent =
        responses.filter(
            (response) => {

                const value =
                    response.answers?.Q_MORE_CONTENT;

                return (
                    String(value)
                        .toLowerCase() ===
                    "yes"
                );
            }
        ).length;

    const moreContentPercent =
        totalResponses
            ? (
                moreContent /
                totalResponses *
                100
            )
                .toFixed(1)
            : "0";

    const totalReels =
        Object.keys(
            reelsData || {}
        ).length;

    setText(
        "metric-total-responses",
        totalResponses
    );

    setText(
        "metric-average-rating",
        ratings.length
            ? averageRating.toFixed(1)
            : "0"
    );

    setText(
        "metric-more-content",
        `${moreContentPercent}%`
    );

    setText(
        "metric-total-reels",
        totalReels
    );
}


/* =========================================================
   REEL PERFORMANCE
========================================================= */

function renderReelPerformance() {

    const container =
        document.getElementById(
            "reel-performance-list"
        );

    if (!container) return;

    const reels =
        Object.values(
            reelsData || {}
        ).sort(sortReelsNewestFirst);

    if (!reels.length) {

        container.innerHTML =
            emptyAnalytics(
                "No reels available."
            );

        return;
    }

    container.innerHTML =
        reels.map((reel) => {

            const id =
                reel.reelId ||
                reel.id;

            const count =
                Object.values(
                    feedbackData || {}
                ).filter(
                    (response) =>
                        response.reelId === id
                ).length;

            return `
                <div class="analytics-row">
                    <div>
                        <strong>
                            ${escapeHtml(id)}
                        </strong>

                        <span>
                            ${escapeHtml(
                                reel.title ||
                                "Untitled Reel"
                            )}
                        </span>
                    </div>

                    <strong>
                        ${count}
                    </strong>
                </div>
            `;

        }).join("");
}


/* =========================================================
   FEELING ANALYSIS
========================================================= */

function renderFeelingAnalysis(responses) {

    const container =
        document.getElementById(
            "feeling-analysis"
        );

    if (!container) return;

    const counts = {};

    responses.forEach(
        (response) => {

            const value =
                response.answers?.Q_FEELING;

            if (!value) return;

            const key =
                String(value);

            counts[key] =
                (counts[key] || 0) + 1;
        }
    );

    renderCountList(
        container,
        counts
    );
}


/* =========================================================
   RATING ANALYSIS
========================================================= */

function renderRatingAnalysis(responses) {

    const container =
        document.getElementById(
            "rating-analysis"
        );

    if (!container) return;

    const counts = {};

    responses.forEach(
        (response) => {

            const value =
                response.answers?.Q_RATING;

            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {
                return;
            }

            const key =
                String(value);

            counts[key] =
                (counts[key] || 0) + 1;
        }
    );

    renderCountList(
        container,
        counts,
        true
    );
}


/* =========================================================
   PSYCHOLOGY ANALYSIS
========================================================= */

function renderPsychologyAnalysis(
    responses
) {

    const container =
        document.getElementById(
            "psychology-analysis"
        );

    if (!container) return;

    if (!responses.length) {

        container.innerHTML =
            emptyAnalytics(
                "No response data available."
            );

        return;
    }

    const connectionCount =
        responses.filter(
            (response) =>
                response.answers?.Q_CONNECTION
        ).length;

    const moreContentCount =
        responses.filter(
            (response) =>
                String(
                    response.answers?.Q_MORE_CONTENT
                ).toLowerCase() === "yes"
        ).length;

    const connectionPercent =
        (
            connectionCount /
            responses.length *
            100
        ).toFixed(1);

    const moreContentPercent =
        (
            moreContentCount /
            responses.length *
            100
        ).toFixed(1);

    container.innerHTML = `

        <div class="analytics-row">

            <div>
                <strong>
                    Audience Connection
                </strong>

                <span>
                    Responses indicating a connection.
                </span>
            </div>

            <strong>
                ${connectionPercent}%
            </strong>

        </div>


        <div class="analytics-row">

            <div>
                <strong>
                    Desire for More Content
                </strong>

                <span>
                    Viewers asking for more content.
                </span>
            </div>

            <strong>
                ${moreContentPercent}%
            </strong>

        </div>
    `;
}


/* =========================================================
   ENGAGEMENT ANALYSIS
========================================================= */

function renderEngagementAnalysis(
    responses
) {

    const container =
        document.getElementById(
            "engagement-analysis"
        );

    if (!container) return;

    const times =
        responses
            .map(
                (response) =>
                    Number(
                        response.responseTime ||
                        response.timings?.totalTime ||
                        response.timing?.totalTime
                    )
            )
            .filter(
                (value) =>
                    Number.isFinite(value) &&
                    value > 0
            );

    if (!times.length) {

        setText(
            "metric-response-time",
            "—"
        );

        setText(
            "metric-fastest-response",
            "—"
        );

        setText(
            "metric-slowest-response",
            "—"
        );

        setText(
            "metric-answer-completion",
            responses.length
                ? "100%"
                : "—"
        );

        container.innerHTML =
            emptyAnalytics(
                "Detailed response timing data is not available yet."
            );

        return;
    }

    const average =
        times.reduce(
            (sum, value) =>
                sum + value,
            0
        ) / times.length;

    const fastest =
        Math.min(...times);

    const slowest =
        Math.max(...times);

    setText(
        "metric-response-time",
        formatDuration(average)
    );

    setText(
        "metric-fastest-response",
        formatDuration(fastest)
    );

    setText(
        "metric-slowest-response",
        formatDuration(slowest)
    );

    setText(
        "metric-answer-completion",
        "100%"
    );

    container.innerHTML =
        `
            <div class="analytics-row">

                <div>
                    <strong>
                        Recorded Responses
                    </strong>

                    <span>
                        Responses with timing data.
                    </span>
                </div>

                <strong>
                    ${times.length}
                </strong>

            </div>
        `;
}


/* =========================================================
   RECOMMENDATIONS
========================================================= */

function renderRecommendations(
    responses
) {

    const container =
        document.getElementById(
            "recommendations"
        );

    if (!container) return;

    if (!responses.length) {

        container.innerHTML =
            emptyAnalytics(
                "Add feedback responses to generate insights."
            );

        return;
    }

    const recommendations = [];

    const moreContentCount =
        responses.filter(
            (response) =>
                String(
                    response.answers?.Q_MORE_CONTENT
                ).toLowerCase() === "yes"
        ).length;

    const moreContentPercent =
        moreContentCount /
        responses.length *
        100;

    if (moreContentPercent >= 60) {

        recommendations.push(
            "A strong share of viewers want more content. Consider maintaining a consistent posting frequency."
        );
    }

    const ratings =
        responses
            .map(
                (response) =>
                    Number(
                        response.answers?.Q_RATING
                    )
            )
            .filter(
                (value) =>
                    Number.isFinite(value)
            );

    if (ratings.length) {

        const average =
            ratings.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) / ratings.length;

        if (average >= 4) {

            recommendations.push(
                "Viewer ratings are strong. Similar devotional themes may be worth continuing."
            );

        } else if (average < 3) {

            recommendations.push(
                "Ratings indicate room for improvement. Review the weaker-performing reels and audience feedback."
            );
        }
    }

    if (!recommendations.length) {

        recommendations.push(
            "Continue collecting responses to build stronger audience insights."
        );
    }

    container.innerHTML =
        recommendations.map(
            (recommendation) => `
                <div class="analytics-row">
                    <div>
                        <strong>
                            Insight
                        </strong>

                        <span>
                            ${escapeHtml(
                                recommendation
                            )}
                        </span>
                    </div>
                </div>
            `
        ).join("");
}


/* =========================================================
   ANALYTICS HELPERS
========================================================= */

function renderCountList(
    container,
    counts,
    numericSort = false
) {

    const entries =
        Object.entries(counts);

    if (!entries.length) {

        container.innerHTML =
            emptyAnalytics(
                "No data available."
            );

        return;
    }

    entries.sort(
        (a, b) => {

            if (numericSort) {
                return Number(b[0]) - Number(a[0]);
            }

            return b[1] - a[1];
        }
    );

    container.innerHTML =
        entries.map(
            ([label, count]) => `
                <div class="analytics-row">

                    <div>
                        <strong>
                            ${escapeHtml(label)}
                        </strong>
                    </div>

                    <strong>
                        ${count}
                    </strong>

                </div>
            `
        ).join("");
}

function emptyAnalytics(message) {

    return `
        <div class="analytics-row">

            <div>
                <span>
                    ${escapeHtml(message)}
                </span>
            </div>

        </div>
    `;
}

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value;
    }
}

function formatDuration(
    milliseconds
) {

    if (
        !Number.isFinite(milliseconds) ||
        milliseconds <= 0
    ) {
        return "—";
    }

    const seconds =
        milliseconds / 1000;

    if (seconds < 60) {

        return `${seconds.toFixed(1)}s`;
    }

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        Math.round(
            seconds % 60
        );

    return `${minutes}m ${remainingSeconds}s`;
}


/* =========================================================
   INITIAL UI STATE
========================================================= */

hideElement(dashboardSection);

if (metadataStatus) {
    setMetadataStatus("", "");
}

if (generatedLinkCard) {
    hideElement(generatedLinkCard);
}
