// =========================================
// RUDRA BHAKTI
// ADMIN PANEL
// AUTHENTICATION + NAVIGATION
// =========================================

import { app } from "firebase.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// =========================================
// AUTHENTICATION
// =========================================

const auth = getAuth(app);


// =========================================
// AUTHORIZED ADMIN UID
// =========================================

const AUTHORIZED_ADMIN_UID =
    "CEozlrvQkuMUox2gKTlQOzdc3ZS2";


// =========================================
// AUTH STATE
// =========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        redirectToLogin();

        return;
    }


    // Only the configured Admin UID
    // is allowed to access this dashboard.

    if (user.uid !== AUTHORIZED_ADMIN_UID) {

        await signOut(auth);

        redirectToLogin();

        return;
    }


    // Authorized administrator

    initializeAdmin();
});


// =========================================
// LOGIN REDIRECT
// =========================================

function redirectToLogin() {

    /*
     * Login UI will be implemented in the
     * next Admin authentication step.
     *
     * For now, the dashboard remains protected
     * and unauthorized users are redirected to
     * the login page when available.
     */

    window.location.replace(
        "admin.html?login=required"
    );
}


// =========================================
// INITIALIZE ADMIN
// =========================================

function initializeAdmin() {

    initializeNavigation();

}


// =========================================
// DOM ELEMENTS
// =========================================

function initializeNavigation() {

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


    // =====================================
    // PAGE TITLES
    // =====================================

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


    // =====================================
    // SIDEBAR
    // =====================================

    function openSidebar() {

        sidebar.classList.add(
            "open"
        );

        sidebarOverlay.classList.add(
            "active"
        );
    }


    function closeSidebar() {

        sidebar.classList.remove(
            "open"
        );

        sidebarOverlay.classList.remove(
            "active"
        );
    }


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            openSidebar
        );
    }


    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );
    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );
    }


    // =====================================
    // PAGE NAVIGATION
    // =====================================

    function showPage(pageName) {

        if (!pageTitles[pageName]) {
            return;
        }


        navItems.forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page === pageName
            );

        });


        adminPages.forEach(page => {

            page.classList.remove(
                "active"
            );

        });


        const targetPage =
            document.getElementById(
                `page-${pageName}`
            );


        if (targetPage) {

            targetPage.classList.add(
                "active"
            );

        }


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


    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                showPage(
                    item.dataset.page
                );

            }
        );

    });


    openPageButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.openPage
                );

            }
        );

    });


    // =====================================
    // INITIAL PAGE
    // =====================================

    function initializePage() {

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
    }


    initializePage();


    // =====================================
    // BROWSER NAVIGATION
    // =====================================

    window.addEventListener(
        "popstate",
        () => {

            const params =
                new URLSearchParams(
                    window.location.search
                );

            const page =
                params.get("page");


            if (
                page &&
                pageTitles[page]
            ) {

                showPage(page);

            } else {

                showPage(
                    "overview"
                );

            }

        }
    );


    // =====================================
    // ESCAPE KEY
    // =====================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                sidebar.classList.contains("open")
            ) {

                closeSidebar();

            }

        }
    );

}
