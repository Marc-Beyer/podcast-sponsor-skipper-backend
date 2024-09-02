/* eslint-disable */
"use strict";

const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username-input");
const tokenInput = document.getElementById("token-input");
const loginBox = document.getElementById("login-box");
const logoutBox = document.getElementById("logout-box");
const logoutButton = document.getElementById("logout-button");
const responseBox = document.getElementById("response-box");

let username = sessionStorage.getItem("username");
let token = sessionStorage.getItem("token");

if (username && token) {
    login();
}

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    username = usernameInput.value;
    token = tokenInput.value;

    login();
});

logoutButton.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.reload();
});

async function login() {
    const response = await fetch("/api/v1/login", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, token }),
    });

    if (response.ok) {
        loginSuccess();
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("username", username);
        showResponse(await response.json());
    } else {
        usernameInput.classList.add("is-invalid");
        tokenInput.classList.add("is-invalid");
    }
}

function loginSuccess() {
    loginBox.style.setProperty("display", "none", "important");
    logoutBox.style.display = "";
    responseBox.style.display = "";
}

function showResponse(response) {
    const roleMapping = {
        0: "DEFAULT",
        1: "BANNED",
        2: "MODERATOR",
        3: "ADMIN",
    };

    responseBox.innerHTML = "";
    const title = document.createElement("h2");
    title.textContent = "User";
    title.classList.add("text-center", "mb-4", "mt-2");
    responseBox.append(title);

    for (const user of response.users) {
        const userCard = document.createElement("div");
        userCard.classList.add("card", "mb-3", "shadow-sm", "mx-auto");
        userCard.style.maxWidth = "700px";

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        const username = document.createElement("h5");
        username.classList.add("card-title");
        username.textContent = user.username;

        const id = document.createElement("p");
        id.classList.add("card-text");
        id.textContent = `ID: ${user.id}`;

        const trustScore = document.createElement("p");
        trustScore.classList.add("card-text");
        trustScore.textContent = `Trust Score: ${user.trustscore}`;

        const role = document.createElement("p");
        role.classList.add("card-text");
        role.textContent = `Role: ${roleMapping[user.role]}`;

        const createdAt = document.createElement("p");
        createdAt.classList.add("card-text", "text-muted");
        createdAt.textContent = `Created At: ${new Date(user.createdat).toLocaleString()}`;

        const nrOfSponsorSections = document.createElement("p");
        nrOfSponsorSections.classList.add("card-text", "text-muted");
        nrOfSponsorSections.textContent = `Nr of submitted Sponsor Sections: ${user.nrOfSponsorSections}`;

        const nrOfRatings = document.createElement("p");
        nrOfRatings.classList.add("card-text", "text-muted");
        nrOfRatings.textContent = `Nr of submitted Ratings: ${user.nrOfRatings}`;

        cardBody.append(username, id, trustScore, role, createdAt, nrOfSponsorSections, nrOfRatings);
        userCard.append(cardBody);
        responseBox.append(userCard);
    }
}
