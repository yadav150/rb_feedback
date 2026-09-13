// =========================================
// RUDRA BHAKTI
// ADMIN PANEL
// AUTHENTICATION + SECURITY + NAVIGATION
// =========================================

import { app } from "firebase.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// =========================================
// CONFIGURATION
// =========================================

const AUTHORIZED_ADMIN_UID =
    "CEozlrvQkuMUox2gKTlQOzdc3ZS2";

const INACTIVITY_LIMIT =
    60 * 1000;


// =========================================
// FIREBASE AUTH
// =========================================

const auth = getAuth(app);


// =========================================
// DOM ELEMENTS
// =========================================

const loginScreen =
    document.getElementById("login-screen");

const adminApp =
    document.getElementById("admin-app");

const loginForm =
    document.getElementById("login-form");

const emailInput =
    document.getElementById("admin-email");

const passwordInput =
    document.getElementById("admin-password");

const loginButton =
    document.getElementById("login-button");

const loginButtonText =
    document.getElementById("login-button-text");

const loginLoader =
    document.getElementById("login-loader");

const loginMessage =
    document.getElementById("login-message");

const emailError =
    document.getElementById("email-error");

const passwordError =
    document.getElementById("password-error");

const passwordToggle =
    document.getElementById("password-toggle");

const adminAvatar =
    document.getElementById("admin-avatar");


// =========================================
// STATE
// =========================================

let inactivityTimer = null;
let currentAdmin = null;
let authenticationChecked = false;


// =========================================
// MESSAGE HELPERS
// =========================================

function showLoginMessage(message, type = "error") {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = message;

    loginMessage.className =
        `login-message ${type}`;

    loginMessage.hidden = false;
}


function hideLoginMessage() {

    if (!loginMessage) {
        return;
    }

    loginMessage.hidden = true;
    loginMessage.textContent = "";
    loginMessage.className =
        "login-message";
}


function clearFieldErrors() {

    if (emailError) {
        emailError.textContent = "";
    }

    if (passwordError) {
        passwordError.textContent = "";
    }

}


// =========================================
// LOGIN LOADING STATE
// =========================================

function setLoginLoading(isLoading) {

    if (!loginButton) {
        return;
    }

    loginButton.disabled = isLoading;

    if (loginButtonText) {

        loginButtonText.textContent =
            isLoading
                ? "Signing in..."
                : "Sign in";
    }

    if (loginLoader) {

        loginLoader.hidden =
            !isLoading;
    }

}


// =========================================
// FRIENDLY FIREBASE ERRORS
// =========================================

function getAuthErrorMessage(error) {

    const code =
        error?.code || "";


    switch (code) {

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "The email or password is incorrect.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-disabled":
            return "This administrator account has been disabled.";

        case "auth/too-many-requests":
            return "Too many unsuccessful attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network connection failed. Please check your connection and try again.";

        case "auth/operation-not-allowed":
            return "Email and password sign-in is not enabled for this Firebase project.";

        default:
            return "Unable to sign in right now. Please try again.";
    }

}


// =========================================
// SHOW / HIDE APPLICATION
// =========================================

function showAdminApp() {

    if (loginScreen) {
        loginScreen.hidden = true;
    }

    if (adminApp) {
        adminApp.hidden = false;
    }

}


function showLoginScreen() {

    if (adminApp) {
        adminApp.hidden = true;
    }

    if (loginScreen) {
        loginScreen.hidden = false;
    }

}


// =========================================
// PASSWORD VISIBILITY
// =========================================

if (passwordToggle && passwordInput) {

    passwordToggle.addEventListener(
        "click",
        () => {

            const isPassword =
                passwordInput.type === "password";


            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";


            passwordToggle.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );


            passwordToggle.setAttribute(
                "aria-pressed",
                String(isPassword)
            );

        }
    );

}


// =========================================
// LOGIN FORM VALIDATION
// =========================================

function validateLoginForm() {

    clearFieldErrors();

    hideLoginMessage();

    let valid = true;


    const email =
        emailInput?.value.trim() || "";

    const password =
        passwordInput?.value || "";


    if (!email) {

        if (emailError) {
            emailError.textContent =
                "Email address is required.";
        }

        valid = false;

    } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

        if (emailError) {
            emailError.textContent =
                "Please enter a valid email address.";
        }

        valid = false;
    }


    if (!password) {

        if (passwordError) {
            passwordError.textContent =
                "Password is required.";
        }

        valid = false;

    }


    return valid;
}


// =========================================
// LOGIN
// =========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!validateLoginForm()) {
                return;
            }


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            setLoginLoading(true);


            try {

                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    credential.user;


                // =================================
                // ADMIN UID VERIFICATION
                // =================================

                if (
                    !user ||
                    user.uid !== AUTHORIZED_ADMIN_UID
                ) {

                    await signOut(auth);

                    showLoginScreen();

                    showLoginMessage(
                        "Access denied. This account is not authorized to access the Rudra Bhakti Admin Panel.",
                        "error"
                    );

                    return;
                }


                currentAdmin = user;

                showAdminApp();

                startInactivityTimer();

                initializeNavigation();


            } catch (error) {

                console.error(
                    "Admin authentication error:",
                    error
                );


                showLoginScreen();

                showLoginMessage(
                    getAuthErrorMessage(error),
                    "error"
                );

            } finally {

                setLoginLoading(false);

            }

        }
    );

}


// =========================================
// LOGOUT
// =========================================

async function logoutAdmin(reason = "manual") {

    stopInactivityTimer();


    try {

        await signOut(auth);

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    } finally {

        currentAdmin = null;

        showLoginScreen();

        clearFieldErrors();


        if (reason === "timeout") {

            showLoginMessage(
                "You were automatically signed out because there was no activity for 1 minute. Please sign in again.",
                "timeout"
            );

        } else {

            hideLoginMessage();

        }


        if (passwordInput) {
            passwordInput.value = "";
        }

    }

}


// =========================================
// LOGOUT BUTTON
// =========================================

function attachLogoutButton() {

    const logoutButton =
        document.getElementById(
            "admin-logout"
        );


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        async () => {

            logoutButton.disabled = true;

            await logoutAdmin(
                "manual"
            );

            logoutButton.disabled = false;

        }
    );

}


// =========================================
// INACTIVITY SECURITY
// =========================================

function resetInactivityTimer() {

    if (!currentAdmin) {
        return;
    }


    clearTimeout(
        inactivityTimer
    );


    inactivityTimer =
        setTimeout(
            () => {

                logoutAdmin(
                    "timeout"
                );

            },
            INACTIVITY_LIMIT
        );

}


function startInactivityTimer() {

    stopInactivityTimer();

    resetInactivityTimer();

}


function stopInactivityTimer() {

    if (inactivityTimer) {

        clearTimeout(
            inactivityTimer
        );

        inactivityTimer = null;
    }

}


// =========================================
// USER ACTIVITY EVENTS
// =========================================

const activityEvents = [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "scroll",
    "click"
];


activityEvents.forEach(
    eventName => {

        document.addEventListener(
            eventName,
            () => {

                if (currentAdmin) {

                    resetInactivityTimer();

                }

            },
            {
                passive: true
            }
        );

    }
);


// =========================================
// FIREBASE AUTH STATE
// =========================================

onAuthStateChanged(
    auth,
    async user => {

        authenticationChecked = true;


        if (!user) {

            currentAdmin = null;

            stopInactivityTimer();

            showLoginScreen();

            attachLogoutButton();

            return;
        }


        // =====================================
        // AUTHORIZED UID CHECK
        // =====================================

        if (
            user.uid !== AUTHORIZED_ADMIN_UID
        ) {

            currentAdmin = null;

            stopInactivityTimer();

            try {

                await signOut(auth);

            } catch (error) {

                console.error(
                    "Unauthorized sign-out error:",
                    error
                );

            }


            showLoginScreen();

            showLoginMessage(
                "Access denied. This account is not authorized to access the Rudra Bhakti Admin Panel.",
                "error"
            );

            return;
        }


        // =====================================
        // VALID ADMIN SESSION
        // =====================================

        currentAdmin = user;

        showAdminApp();

        updateAdminIdentity(user);

        startInactivityTimer();

        initializeNavigation();

        attachLogoutButton();

    }
);


// =========================================
// ADMIN IDENTITY
// =========================================

function updateAdminIdentity(user) {

    if (!adminAvatar) {
        return;
    }


    const email =
        user?.email || "Admin";


    const firstCharacter =
        email
            .charAt(0)
            .toUpperCase();


    adminAvatar.textContent =
        firstCharacter || "A";

}


// =========================================
// NAVIGATION
// =========================================

let navigationInitialized = false;


function initializeNavigation() {

    if (navigationInitialized) {
        return;
    }

    navigationInitialized = true;


    const sidebar =
        document.getElementById(
            "admin-sidebar"
        );

    const sidebarOverlay =
        document.getElementById(
            "sidebar-overlay"
        );

    const menuButton =
        document.getElementById(
            "menu-button"
        );

    const sidebarClose =
        document.getElementById(
            "sidebar-close"
        );

    const pageTitle =
        document.getElementById(
            "page-title"
        );

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    const adminPages =
        document.querySelectorAll(
            ".admin-page"
        );

    const openPageButtons =
        document.querySelectorAll(
            "[data-open-page]"
        );


    const pageTitles = {

        overview:
            "Overview",

        reels:
            "Reels",

        analytics:
            "Analytics",

        insights:
            "Insights",

        recommendations:
            "Recommendations"

    };


    function openSidebar() {

        sidebar?.classList.add(
            "open"
        );

        sidebarOverlay?.classList.add(
            "active"
        );

    }


    function closeSidebar() {

        sidebar?.classList.remove(
            "open"
        );

        sidebarOverlay?.classList.remove(
            "active"
        );

    }


    menuButton?.addEventListener(
        "click",
        openSidebar
    );


    sidebarClose?.addEventListener(
        "click",
        closeSidebar
    );


    sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );


    function showPage(pageName) {

        if (!pageTitles[pageName]) {
            return;
        }


        navItems.forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.page === pageName
                );

            }
        );


        adminPages.forEach(
            page => {

                page.classList.remove(
                    "active"
                );

            }
        );


        const targetPage =
            document.getElementById(
                `page-${pageName}`
            );


        targetPage?.classList.add(
            "active"
        );


        if (pageTitle) {

            pageTitle.textContent =
                pageTitles[pageName];

        }


        closeSidebar();


        const url =
            new URL(
                window.location.href
            );


        url.searchParams.set(
            "page",
            pageName
        );


        window.history.replaceState(
            {},
            "",
            url
        );

    }


    navItems.forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    showPage(
                        item.dataset.page
                    );

                }
            );

        }
    );


    openPageButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showPage(
                        button.dataset.openPage
                    );

                }
            );

        }
    );


    const params =
        new URLSearchParams(
            window.location.search
        );


    const requestedPage =
        params.get("page");


    if (
        requestedPage &&
        pageTitles[requestedPage]
    ) {

        showPage(
            requestedPage
        );

    } else {

        showPage(
            "overview"
        );

    }


    window.addEventListener(
        "popstate",
        () => {

            const currentParams =
                new URLSearchParams(
                    window.location.search
                );


            const page =
                currentParams.get("page");


            showPage(
                pageTitles[page]
                    ? page
                    : "overview"
            );

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                sidebar?.classList.contains("open")
            ) {

                closeSidebar();

            }

        }
    );

}


// =========================================
// STARTUP FALLBACK
// =========================================

setTimeout(
    () => {

        if (!authenticationChecked) {

            showLoginScreen();

            showLoginMessage(
                "Unable to verify the admin session. Please refresh the page and try again.",
                "error"
            );

        }

    },
    10000
);
