/* eslint-disable */
"use strict";

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

async function initSearch(search) {
    searchInput.value = search;
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        setSearch(searchInput.value);
    });
    searchForm.addEventListener("reset", (e) => {
        if (search) setSearch("");
    });
}

function setSearch(search) {
    const urlParams = new URLSearchParams(window.location.search);
    if (search === "") {
        urlParams.delete("search");
    } else {
        urlParams.set("search", search);
    }
    urlParams.delete("page");
    window.location.search = urlParams;
}
