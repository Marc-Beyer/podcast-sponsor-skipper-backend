/* eslint-disable */
"use strict";

const podcastsContainer = document.getElementById("podcasts-container");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const lang = urlParams.get("lang");
const search = urlParams.get("search");
const category = urlParams.get("category");
const page = urlParams.get("page");
console.log(urlParams, category, page, lang, search);

(async () => {
    document
        .querySelector("html")
        .setAttribute("data-bs-theme", window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    await initLanguage(lang);
    await initSearch(search);
    await getPodcasts(category, lang);
    await initCategories(category ?? "");
})();

async function getPodcasts(category, lang) {
    const username = sessionStorage.getItem("username");
    const token = sessionStorage.getItem("token");

    let url = "/api/v1/podcasts";
    if (category) {
        url = `/api/v1/categories/${category}/podcasts`;
    }
    let parsedPage = parseInt(page);
    if (!Number.isNaN(parsedPage)) {
        url += `?page=${page}`;
    } else {
        url += "?page=0";
        parsedPage = 0;
    }
    if (lang) {
        url += `&lang=${lang}`;
    }
    if (search) {
        url += `&search=${search}`;
    }

    const options = { method: "GET", headers: { Authorization: `Bearer ${username} ${token}` } };

    const response = await fetch(url, options);

    const { podcasts, nrOfPages } = await response.json();
    console.log(podcasts);

    createPagination(parsedPage, nrOfPages);

    for (const podcast of podcasts) {
        podcastsContainer.append(
            createPodcastElement(
                podcast.id,
                podcast.imageUrl,
                podcast.title,
                podcast.description,
                podcast.categories ?? [],
                podcast.nrOdEpisodes,
                podcast.link,
                podcast.ranking,
                podcast.sponsorSections,
                username,
                token
            )
        );
    }
}

function createPodcastElement(id, imgUrl, title, description, categories, nrOdEpisodes, link, ranking, sponsorSections, username, token) {
    const podcastElement = document.createElement("div");
    podcastElement.className = "podcast-element card m-3 d-flex flex-row";

    const podcastMainElement = document.createElement("div");
    podcastMainElement.className = "podcast-element-main card";

    const img = document.createElement("img");
    img.className = "card-img-top";
    img.src = imgUrl;
    img.loading = "lazy";
    img.alt = "logo";
    podcastMainElement.append(img);

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

    podcastMainElement.append(info);

    podcastElement.append(podcastMainElement);

    if (username && token && sponsorSections !== null && sponsorSections !== undefined) {
        podcastMainElement.append(createAdminControl(id, ranking, username, token));

        const sponsorSectionsElement = document.createElement("div");
        sponsorSectionsElement.className = "podcast-element-sponsor card";
        sponsorSectionsElement.append(createSponsorSections(id, sponsorSections, username, token));

        const expandButton = document.createElement("button");
        expandButton.textContent = `${sponsorSections.length} sponsor segments ->`;
        expandButton.className = "btn btn-link";
        expandButton.addEventListener("click", () => {
            podcastElement.classList.toggle("expanded");
        });

        podcastMainElement.append(expandButton);

        podcastElement.append(sponsorSectionsElement);
    }

    return podcastElement;
}

function createSponsorSections(id, sponsorSections, username, token) {
    const sponsorSectionsContainer = document.createElement("div");
    sponsorSectionsContainer.className = "sponsor-sections-container";

    sponsorSections.forEach((section) => {
        const sectionContainer = document.createElement("div");
        sectionContainer.className = "sponsor-section";

        const episodeUrlElement = document.createElement("a");
        episodeUrlElement.href = section.episodeUrl;
        episodeUrlElement.textContent = section.episodeUrl;
        episodeUrlElement.target = "_blank";
        sectionContainer.append(episodeUrlElement);

        const positionsElement = document.createElement("div");
        positionsElement.textContent = `Start: ${section.startPosition}, End: ${section.endPosition}`;
        sectionContainer.append(positionsElement);

        const createdAtElement = document.createElement("div");
        const createdAtDate = new Date(section.createdAt);
        createdAtElement.textContent = `Created At: ${createdAtDate.toLocaleString()}`;
        sectionContainer.append(createdAtElement);

        sponsorSectionsContainer.append(sectionContainer);
    });

    return sponsorSectionsContainer;
}

function createAdminControl(id, ranking, username, token) {
    const rankingContainer = document.createElement("div");
    rankingContainer.className = "d-flex flex-row";

    const rankingInput = document.createElement("input");
    rankingInput.type = "text";
    rankingInput.className = "form-control";
    rankingInput.value = ranking;
    rankingContainer.append(rankingInput);

    const rankingButton = document.createElement("button");
    rankingButton.textContent = "+";
    rankingButton.className = "btn btn-dark";
    rankingContainer.append(rankingButton);
    rankingButton.addEventListener("click", async () => {
        console.log("rankingInput", rankingInput.value);

        const response = await fetch(`/api/v1/podcast/${id}/rank`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ranking: rankingInput.value,
                username,
                token,
            }),
        });

        if (response.ok) {
            window.location.reload();
        } else {
            console.log("ERR", response);
        }
    });

    return rankingContainer;
}
