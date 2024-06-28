/* eslint-disable */
"use strict";

const langSelect = document.getElementById("lang-select");

const langArr = [
    "ar",
    "cs",
    "cs-cz",
    "de",
    "de-at",
    "de-de",
    "el",
    "en",
    "en-au",
    "en-ca",
    "en-gb",
    "en-ie",
    "en-us",
    "es",
    "es-ar",
    "es-co",
    "es-mx",
    "fr",
    "hi",
    "hu",
    "it",
    "ja",
    "mr",
    "nl",
    "nl-nl",
    "pl",
    "pt",
    "pt-br",
    "ru",
    "sk",
    "tr",
    "zh",
    "zh-cn",
    "zh-hant",
    "zh-tw",
];

async function initLanguage(lang = "") {
    for (const language of langArr) {
        langSelect.append(createLangOption(language));
    }
    langSelect.value = lang ?? "";
    console.log("lang", lang);
    langSelect.addEventListener("change", () => {
        setLanguage(langSelect.value);
    });
}

function createLangOption(language) {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = language;
    return option;
}

function setLanguage(language) {
    const urlParams = new URLSearchParams(window.location.search);
    if (language === "") {
        urlParams.delete("lang");
    } else {
        urlParams.set("lang", language);
    }
    window.location.search = urlParams;
}
