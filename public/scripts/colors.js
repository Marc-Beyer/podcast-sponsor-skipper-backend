/* eslint-disable */
"use strict";

(() => {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => setColorScheme());
})();

function setColorScheme() {
    document
        .querySelector("html")
        .setAttribute("data-bs-theme", window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
