/* eslint-disable */
"use strict";

const podcastsContainer = document.getElementById("podcasts-container");
const categoriesContainer = document.getElementById("categories-container");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const category = urlParams.get("category");
const page = urlParams.get("page");
console.log(urlParams, category, page);

(async function init() {
    document
        .querySelector("html")
        .setAttribute("data-bs-theme", window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    await getPodcasts(category);
    await getCategories(category);
})();

async function getCategories(activeCategoryId) {
    const response = await fetch("/api/v1/categories");

    const categories = await response.json();
    console.log(categories);

    let activeCategoryElement;
    for (const category of categories) {
        const categoryElement = createCategoryElement(category.name, category.id);
        categoriesContainer.append(categoryElement);
        if (activeCategoryId === category.id + "") {
            activeCategoryElement = categoryElement;
            console.log("activeCategoryElement", activeCategoryElement);
        }
    }
    if (category === null) {
        activeCategoryElement = document.getElementById("category-all");
    }
    activeCategoryElement.classList.add("active");
}

function createCategoryElement(name, id) {
    const categoryElement = document.createElement("a");

    categoryElement.className = "nav-link";
    categoryElement.textContent = name;
    categoryElement.id = `category-${id}`;
    categoryElement.href = `index.html?category=${id}`;

    return categoryElement;
}

async function getPodcasts(category) {
    let url = "/api/v1/podcasts";
    if (category) {
        url = `/api/v1/categories/${category}/podcasts`;
    }
    let parsedPage = parseInt(page);
    if (!Number.isNaN(parsedPage)) {
        url += `?page=${page}`;
    } else {
        parsedPage = 0;
    }
    const response = await fetch(url);

    const { podcasts, nrOfPages } = await response.json();
    console.log(podcasts);

    createPagination(parsedPage, nrOfPages);

    for (const podcast of podcasts) {
        podcastsContainer.append(
            createPodcastElement(
                podcast.imageUrl,
                podcast.title,
                podcast.description,
                podcast.categories ?? [],
                podcast.nrOdEpisodes,
                podcast.link
            )
        );
    }
}

function createPodcastElement(imgUrl, title, description, categories, nrOdEpisodes, link) {
    const podcastElement = document.createElement("div");
    podcastElement.className = "podcast-element card m-3";

    const img = document.createElement("img");
    img.className = "card-img-top";
    img.src = imgUrl;
    img.loading = "lazy";
    img.alt = "logo";
    podcastElement.append(img);

    const info = document.createElement("div");
    info.className = "card-body d-flex flex-column overflow-hidden";

    const titleLink = document.createElement("a");
    titleLink.href = link;

    const cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.textContent = title;
    titleLink.append(cardTitle);

    info.append(titleLink);

    const cardCategories = document.createElement("h6");
    cardCategories.className = "card-subtitle mb-2 text-body-secondary";
    cardCategories.style.textWrap = "nowrap";
    cardCategories.style.textOverflow = "ellipsis";
    cardCategories.style.overflow = "hidden";
    cardCategories.textContent = `${nrOdEpisodes} episodes`;
    info.append(cardCategories);

    const cardText = document.createElement("p");
    cardText.className = "card-text overflow-y-auto";
    cardText.style.flex = "1";
    cardText.textContent = description;
    info.append(cardText);

    const categoryContainer = document.createElement("div");
    for (let index = 0; index < categories.length; index++) {
        const categoryElement = document.createElement("a");
        categoryElement.className = "card-link";
        categoryElement.textContent = categories[index].name;
        categoryElement.href = `?category=${categories[index].id}`;
        categoryContainer.append(categoryElement);
    }
    info.append(categoryContainer);

    podcastElement.append(info);

    return podcastElement;
}
