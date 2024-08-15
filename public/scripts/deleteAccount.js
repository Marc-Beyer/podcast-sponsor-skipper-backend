/* eslint-disable */
"use strict";

const deleteAccountForm = document.getElementById("delete-account-form");
const usernameInput = document.getElementById("username-input");
const tokenInput = document.getElementById("token-input");
const mainTitle = document.getElementById("main-title");
const infoBox = document.getElementById("info-box");

deleteAccountForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const token = tokenInput.value;

    const response = await fetch("/api/v1/delete-account", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, token }),
    });

    if (response.ok) {
        deleteAccountForm.hidden = true;
        infoBox.hidden = true;
        mainTitle.textContent = "Your account was deleted!";
    } else {
        usernameInput.classList.add("is-invalid");
        tokenInput.classList.add("is-invalid");
    }
});
