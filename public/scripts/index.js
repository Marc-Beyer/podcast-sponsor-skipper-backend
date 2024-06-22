/* eslint-disable */
"use strict";

console.log("Hello");

const podcastsContainer = document.getElementById("podcasts-container");
const categoriesContainer = document.getElementById("categories-container");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const category = urlParams.get("category");
console.log(urlParams, category);

getPodcasts(category);
getCategories();

async function getCategories() {
    const response = await fetch("/api/v1/categories");

    const categories = await response.json();
    console.log(categories);

    for (const category of categories) {
        categoriesContainer.append(createCategoryElement(category.name, category.id));
    }
}

function createCategoryElement(name, id) {
    const categoryElement = document.createElement("a");

    categoryElement.className = "nav-link active";
    categoryElement.textContent = name;
    categoryElement.href = `index.html?category=${id}`;

    return categoryElement;
}

async function getPodcasts(category) {
    let url = "/api/v1/podcasts";
    if (category) {
        url = `/api/v1/categories/${category}/podcasts`;
    }
    const response = await fetch(url);

    const podcasts = await response.json();
    console.log(podcasts);

    for (const podcast of podcasts) {
        podcastsContainer.append(
            createPodcastElement(
                podcast.imageUrl,
                podcast.title,
                podcast.description,
                podcast.categories?.map((it) => it.name).join(", ") ?? []
            )
        );
    }
}

function createPodcastElement(imgUrl, title, description, categories) {
    const podcastElement = document.createElement("div");
    podcastElement.className = "podcast-element card m-3";
    podcastElement.style.width = "14rem";

    const img = document.createElement("img");
    img.className = "card-img-top";
    img.src = imgUrl;
    img.loading = "lazy";
    img.alt = "logo";
    podcastElement.append(img);

    const info = document.createElement("div");
    info.className = "card-body";

    const cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.textContent = title;
    info.append(cardTitle);

    const cardCategories = document.createElement("h6");
    cardCategories.className = "card-subtitle mb-2 text-body-secondary";
    cardCategories.style.textWrap = "nowrap";
    cardCategories.style.textOverflow = "ellipsis";
    cardCategories.style.overflow = "hidden";
    cardCategories.textContent = categories;
    cardCategories.title = categories;
    info.append(cardCategories);

    const cardText = document.createElement("p");
    cardText.className = "card-text";
    cardText.style.maxHeight = "6rem";
    cardText.style.overflow = "hidden";
    cardText.textContent = description;
    info.append(cardText);

    podcastElement.append(info);

    return podcastElement;
}
