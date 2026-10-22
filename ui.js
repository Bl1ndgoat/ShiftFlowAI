/*
===========================================================
ShiftFlow AI v2
ui.js

User Interface Manager

Author: ChatGPT
===========================================================
*/

/* ==========================================================
   ELEMENTS
========================================================== */

const pages = document.querySelectorAll(".page");

const toastContainer =
    document.getElementById("toastContainer");



/* ==========================================================
   PAGE NAVIGATION
========================================================== */

export function showPage(pageId){

    pages.forEach(page=>{

        page.classList.remove("active");

    });

    const page=document.getElementById(pageId);

    if(page){

        page.classList.add("active");

    }

}


/* ==========================================================
   TOAST
========================================================== */

export function toast(

    message,

    type="success"

){

    if(!toastContainer) return;

    const div=document.createElement("div");

    div.className=`toast ${type}`;

    div.textContent=message;

    toastContainer.appendChild(div);

    setTimeout(()=>{

        div.remove();

    },3000);

}



/* ==========================================================
   LOADING
========================================================== */

export function showLoading(){

    document

    .getElementById("loadingOverlay")

    ?.classList.remove("hidden");

}

export function hideLoading(){

    document

    .getElementById("loadingOverlay")

    ?.classList.add("hidden");

}



/* ==========================================================
   INIT
========================================================== */

export function initUI() {}