/* eslint-disable */
"use strict";
const categoriesContainer = document.getElementById("categories-container");

async function initCategories(activeCategoryId = "") {
    await getCategories();
    categoriesContainer.value = activeCategoryId;
    console.log("categoriesContainer.value", activeCategoryId, categoriesContainer.value);

    categoriesContainer.addEventListener("change", (e) => {
        e.preventDefault();
        setCategory(categoriesContainer.value);
    });
}

async function getCategories() {
    const response = await fetch("/api/v1/categories");

    const categories = await response.json();
    console.log(categories);

    for (const category of categories) {
        const categoryElement = createCategoryElement(category.name, category.id);
        categoriesContainer.append(categoryElement);
    }
}

function createCategoryElement(name, id) {
    const categoryElement = document.createElement("option");

    categoryElement.textContent = name;
    categoryElement.value = id;

    return categoryElement;
}

function setCategory(categoryId) {
    const urlParams = new URLSearchParams(window.location.search);
    if (categoryId === "") {
        urlParams.delete("category");
    } else {
        urlParams.set("category", categoryId);
    }
    urlParams.delete("page");
    window.location.search = urlParams;
}
