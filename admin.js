// =========================================
// RUDRA BHAKTI
// ADMIN PANEL SCRIPT
// =========================================


import {

    initializeApp

} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {

    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


import {

    getDatabase,
    ref,
    set,
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




const app =
    initializeApp(firebaseConfig);



const auth =
    getAuth(app);



const database =
    getDatabase(app);






// =========================================
// CONFIG
// =========================================


const CONFIG = {


    adminUID:
        "CEozlrvQkuMUox2gKTlQOzdc3ZS2",


    inactivityLimit:
        60000

};







// =========================================
// DOM
// =========================================


const elements = {


    loginSection:
        document.getElementById("admin-login"),



    dashboard:
        document.getElementById("admin-dashboard"),



    loginForm:
        document.getElementById("login-form"),



    email:
        document.getElementById("admin-email"),



    password:
        document.getElementById("admin-password"),



    loginError:
        document.getElementById("login-error"),



    logoutButton:
        document.getElementById("logout-button"),



    addReelForm:
        document.getElementById("add-reel-form"),



    reelId:
        document.getElementById("reel-id"),



    reelTitle:
        document.getElementById("reel-title-input"),



    reelUrl:
        document.getElementById("reel-url"),



    reelThumbnail:
        document.getElementById("reel-thumbnail-input")

};



let inactivityTimer = null;






// =========================================
// INIT
// =========================================


document.addEventListener(

    "DOMContentLoaded",

    init

);



function init(){


    setupEvents();


    watchAuth();


}
// =========================================
// EVENT SETUP
// =========================================


function setupEvents(){


    elements.loginForm?.addEventListener(

        "submit",

        handleLogin

    );



    elements.logoutButton?.addEventListener(

        "click",

        handleLogout

    );



    elements.addReelForm?.addEventListener(

        "submit",

        handleAddReel

    );



    document

    .querySelectorAll(".nav-button")

    .forEach(button => {


        button.addEventListener(

            "click",

            () => {


                switchSection(

                    button.dataset.section,

                    button

                );


            }

        );


    });



    setupActivityTracking();


}







// =========================================
// AUTH WATCH
// =========================================


function watchAuth(){


    onAuthStateChanged(

        auth,

        user => {


            if(!user){


                showLogin();


                return;


            }




            if(

                user.uid !== CONFIG.adminUID

            ){


                showLoginError(

                    "This account is not authorized for admin access."

                );



                signOut(auth);



                return;


            }




            showDashboard();


            startSessionTimer();



        }

    );


}








// =========================================
// LOGIN
// =========================================


async function handleLogin(event){


    event.preventDefault();


    clearLoginError();



    const email =

        elements.email.value.trim();



    const password =

        elements.password.value;



    if(

        !email ||

        !password

    ){


        showLoginError(

            "Please enter email and password."

        );


        return;

    }




    try{


        const result =

            await signInWithEmailAndPassword(

                auth,

                email,

                password

            );



        if(

            result.user.uid !== CONFIG.adminUID

        ){


            await signOut(auth);



            showLoginError(

                "Invalid admin account."

            );


        }



    }

    catch(error){


        console.error(

            "Login error:",

            error

        );



        showLoginError(

            getAuthErrorMessage(error)

        );


    }


}








// =========================================
// LOGOUT
// =========================================


async function handleLogout(){


    clearSessionTimer();


    await signOut(auth);


}








// =========================================
// UI
// =========================================


function showLogin(){


    elements.loginSection.hidden = false;


    elements.dashboard.hidden = true;


    clearSessionTimer();


}




function showDashboard(){


    elements.loginSection.hidden = true;


    elements.dashboard.hidden = false;


}






function showLoginError(message){


    elements.loginError.textContent = message;


    elements.loginError.hidden = false;


}





function clearLoginError(){


    elements.loginError.textContent = "";


    elements.loginError.hidden = true;


}








// =========================================
// NAVIGATION
// =========================================


function switchSection(

    sectionId,

    button

){



    document

    .querySelectorAll(".admin-section")

    .forEach(section => {


        section.hidden =

            section.id !== sectionId;


    });





    document

    .querySelectorAll(".nav-button")

    .forEach(btn => {


        btn.classList.remove(

            "active"

        );


    });



    button.classList.add(

        "active"

    );


}






// =========================================
// ADD REEL
// =========================================


async function handleAddReel(event){


    event.preventDefault();



    const reelId =

        elements.reelId.value.trim();



    const title =

        elements.reelTitle.value.trim();



    const facebookUrl =

        elements.reelUrl.value.trim();



    const thumbnail =

        elements.reelThumbnail.value.trim();





    if(

        !reelId ||

        !title ||

        !facebookUrl

    ){


        alert(

            "Please fill Reel ID, Title and Facebook URL."

        );


        return;


    }






    try{


        const reelRef =

            ref(

                database,

                `reels/${reelId}`

            );




        await set(

            reelRef,

            {

                id:

                    reelId,


                title,

                facebookUrl,


                thumbnail,


                createdAt:

                    serverTimestamp(),


                createdBy:

                    auth.currentUser.uid


            }

        );




        alert(

            "Reel added successfully."

        );



        elements.addReelForm.reset();




    }

    catch(error){


        console.error(

            "Add reel error:",

            error

        );



        alert(

            "Unable to add reel. Please try again."

        );


    }


}
// =========================================
// SESSION TIMEOUT
// =========================================


function setupActivityTracking(){


    const activityEvents = [


        "mousemove",

        "mousedown",

        "keydown",

        "touchstart",

        "scroll"


    ];



    activityEvents.forEach(

        event => {


            window.addEventListener(

                event,

                resetSessionTimer,

                {
                    passive:true
                }

            );


        }

    );


}





function startSessionTimer(){


    resetSessionTimer();


}





function resetSessionTimer(){


    clearSessionTimer();



    inactivityTimer =

        setTimeout(

            () => {


                autoLogout();


            },

            CONFIG.inactivityLimit

        );


}





function clearSessionTimer(){


    if(inactivityTimer){


        clearTimeout(

            inactivityTimer

        );


        inactivityTimer = null;


    }


}






async function autoLogout(){


    alert(

        "Session expired due to inactivity. Please login again."

    );



    await signOut(auth);


}








// =========================================
// FIREBASE AUTH ERROR HANDLING
// =========================================


function getAuthErrorMessage(error){


    switch(error.code){



        case "auth/invalid-email":

            return "Invalid email address.";




        case "auth/user-not-found":

            return "Admin account not found.";




        case "auth/wrong-password":

            return "Incorrect password.";




        case "auth/invalid-credential":

            return "Invalid email or password.";




        case "auth/network-request-failed":

            return "Network error. Please check your connection.";




        case "auth/too-many-requests":

            return "Too many attempts. Try again later.";




        default:

            return "Login failed. Please try again.";

    }


}







// =========================================
// CLEANUP
// =========================================


window.addEventListener(

    "beforeunload",

    () => {


        clearSessionTimer();


    }

);
