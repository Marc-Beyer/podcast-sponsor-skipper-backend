/* eslint-disable */
"use strict";

init();
getPodcasts();

let lastPosition = 0;
let sponsorSections = [{ start: 4, end: 40 }];

function init() {
    const audio = document.getElementById("audio");
    audio.volume = 0.2;
    audio.addEventListener("timeupdate", (event) => {
        const curTime = audio.currentTime;
        for (const sponsorSection of sponsorSections) {
            if (audio.seeking) break;

            if (lastPosition < sponsorSection.start && curTime > sponsorSection.start) {
                console.log(
                    "SKIPPING. lastPosition",
                    lastPosition,
                    "curTime",
                    curTime,
                    "sponsorSection.start",
                    sponsorSection.start,
                    "isSeeking",
                    audio.seeking
                );
                audio.currentTime = sponsorSection.end;
                lastPosition = sponsorSection.end;
            }
        }
        if (!audio.seeking) lastPosition = curTime;
    });
    audio.addEventListener("seeking", (event) => {
        console.log("seeked");
        lastPosition = Number.MAX_SAFE_INTEGER;
    });
    audio.addEventListener("seeked", (event) => {
        console.log("seeked");
        lastPosition = Number.MAX_SAFE_INTEGER;
    });

    const sponsorSectionsContainer = document.getElementById("sponsor-sections-container");
    const showSponsorSectionsText = document.getElementById("show-sponsor-sections-text");
    document.getElementById("show-sponsor-sections")?.addEventListener("click", () => {
        if (sponsorSectionsContainer.style.display) {
            sponsorSectionsContainer.style.display = "";
            showSponsorSectionsText.textContent = "hide";
        } else {
            sponsorSectionsContainer.style.display = "none";
            showSponsorSectionsText.textContent = "show";
        }
    });
}

async function getPodcasts() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const podcastId = urlParams.get("id");
    console.log("podcastId", podcastId);

    const url = `/api/v1/podcast/${podcastId}`;

    const username = sessionStorage.getItem("username");
    const token = sessionStorage.getItem("token");

    const options = { method: "GET", headers: { Authorization: `Bearer ${username} ${token}` } };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error("Failed to fetch podcast data");
        }

        const podcast = await response.json();
        showResult(podcast);
        console.log(podcast);

        fetchPodcastRssFeed(podcast.url, podcast);
    } catch (error) {
        console.error("Error fetching podcast data:", error.message);
    }
}

async function getSponsorSections(episodeUrl, duration) {
    const username = sessionStorage.getItem("username");
    const token = sessionStorage.getItem("token");

    const url = "/api/v1/get-sponsor-section";

    const options = {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ episodeUrl, duration, username, token }),
    };
    sponsorSections = [];

    const response = await fetch(url, options);

    if (response.ok) {
        const jsonResponse = await response.json();
        console.log("jsonResponse", jsonResponse);

        const sponsorSectionsContainer = document.getElementById("sponsor-sections-container");
        sponsorSectionsContainer.innerHTML = "";

        for (const sponsorSection of jsonResponse) {
            const sponsorElement = document.createElement("div");
            sponsorElement.classList.add("d-flex", "flex-row", "align-items-center", "border", "my-3", "shadow-lg");
            const sponsorInfoElement = document.createElement("div");
            sponsorInfoElement.style.width = "30%";
            sponsorInfoElement.classList.add("m-2");
            sponsorInfoElement.textContent = `${sponsorSection.startPosition / 1000.0}s - ${sponsorSection.endPosition / 1000.0}s ${
                sponsorSection.isProvisional ? "Provisional" : ""
            }`;
            sponsorElement.append(sponsorInfoElement);

            const btnContainer = document.createElement("div");
            btnContainer.style.width = "70%";
            const sponsorButton = document.createElement("button");
            sponsorButton.textContent = "Skip To Segment";
            sponsorButton.classList.add("btn", "btn-primary", "m-3");
            sponsorButton.addEventListener("click", () => {
                const audio = document.getElementById("audio");
                audio.currentTime = sponsorSection.startPosition / 1000.0;
            });
            btnContainer.appendChild(sponsorButton);

            if (sponsorSection.podcastUrl) {
                const ratingInfo = document.createElement("p");
                ratingInfo.textContent = `Rating: ${sponsorSection.rating}`;
                ratingInfo.classList.add("mb-2");
                sponsorInfoElement.appendChild(ratingInfo);

                const submittedByInfo = document.createElement("p");
                submittedByInfo.textContent = `Submitted By: ${sponsorSection.submittedBy.username} (Trust Score: ${sponsorSection.submittedBy.trustScore})`;
                submittedByInfo.classList.add("mb-2");
                sponsorInfoElement.appendChild(submittedByInfo);

                const createdDateInfo = document.createElement("p");
                createdDateInfo.textContent = `Created At: ${new Date(sponsorSection.createdAt).toLocaleString()}`;
                createdDateInfo.classList.add("mb-2");
                sponsorInfoElement.appendChild(createdDateInfo);

                const previewButton = document.createElement("button");
                previewButton.textContent = "Preview Segment";
                previewButton.classList.add("btn", "btn-primary", "m-3");
                previewButton.addEventListener("click", () => {
                    const audio = document.getElementById("audio");
                    audio.currentTime = Math.max(0, sponsorSection.startPosition / 1000.0 - 3);
                    audio.play();
                });
                btnContainer.appendChild(previewButton);

                const includeButton = document.createElement("button");
                includeButton.textContent = "Include Segment";
                includeButton.classList.add("btn", "btn-success", "m-3");
                includeButton.addEventListener("click", () => {
                    includeButton.classList.toggle("btn-success");
                    includeButton.classList.toggle("btn-danger");
                    if (includeButton.textContent === "Include Segment") {
                        includeButton.textContent = "Remove Segment";
                        sponsorSections.push({
                            start: sponsorSection.startPosition / 1000.0,
                            end: sponsorSection.endPosition / 1000.0,
                            isProvisional: sponsorSection.isProvisional,
                        });
                    } else {
                        includeButton.textContent = "Include Segment";
                        sponsorSections = sponsorSections.filter((sponsorSection) => {
                            return (
                                sponsorSection.end === sponsorSection.endPosition / 1000.0 &&
                                sponsorSection.start === sponsorSection.startPosition / 1000.0
                            );
                        });
                    }
                });
                btnContainer.appendChild(includeButton);
            } else {
                sponsorSections.push({
                    start: sponsorSection.startPosition / 1000.0,
                    end: sponsorSection.endPosition / 1000.0,
                    isProvisional: sponsorSection.isProvisional,
                });
            }

            sponsorElement.appendChild(btnContainer);
            sponsorSectionsContainer.appendChild(sponsorElement);
        }
        console.log(sponsorSections);
        document.getElementById("sponsor-sections-nr").textContent = jsonResponse.length;
    }
}

function displayEpisodeDetails(episode) {
    const container = document.getElementById("episodes-container");
    container.innerHTML = ""; // Clear previous content if needed

    // Create a new div for the episode
    const episodeDiv = document.createElement("div");
    episodeDiv.classList.add("episode", "mb-4", "p-3", "border", "rounded");

    // Add Episode Audio Player
    const audioPlayer = document.createElement("audio");
    audioPlayer.controls = true;
    audioPlayer.src = episode.episodeUrl;
    audioPlayer.classList.add("w-100", "mb-3");
    episodeDiv.appendChild(audioPlayer);

    // Add Podcast URL
    const podcastLink = document.createElement("a");
    podcastLink.href = episode.podcastUrl;
    podcastLink.textContent = "Visit Podcast Feed";
    podcastLink.classList.add("d-block", "mb-2", "btn", "btn-primary");
    episodeDiv.appendChild(podcastLink);

    // Add Episode Duration Info
    const durationInfo = document.createElement("p");
    durationInfo.textContent = `Duration: ${episode.duration.value} minutes, Pre-roll ads: ${episode.duration.hasPreRollAds}, Post-roll ads: ${episode.duration.hasPostRollAds}`;
    durationInfo.classList.add("mb-2");
    episodeDiv.appendChild(durationInfo);

    // Add Episode Start and End Position
    const positionInfo = document.createElement("p");
    positionInfo.textContent = `Start Position: ${episode.startPosition}, End Position: ${episode.endPosition}`;
    positionInfo.classList.add("mb-2");
    episodeDiv.appendChild(positionInfo);

    // Add Episode Rating
    const ratingInfo = document.createElement("p");
    ratingInfo.textContent = `Rating: ${episode.rating}`;
    ratingInfo.classList.add("mb-2");
    episodeDiv.appendChild(ratingInfo);

    // Add Submitted By Info
    const submittedByInfo = document.createElement("p");
    submittedByInfo.textContent = `Submitted By: ${episode.submittedBy.username} (Trust Score: ${episode.submittedBy.trustScore})`;
    submittedByInfo.classList.add("mb-2");
    episodeDiv.appendChild(submittedByInfo);

    // Add Episode Created Date
    const createdDateInfo = document.createElement("p");
    createdDateInfo.textContent = `Created At: ${new Date(episode.createdAt).toLocaleString()}`;
    createdDateInfo.classList.add("mb-2");
    episodeDiv.appendChild(createdDateInfo);

    // Append the episode div to the main container
    container.appendChild(episodeDiv);
}

async function fetchPodcastRssFeed(url, podcast) {
    const proxyUrl = "/proxy?url=";
    const corsUrl = proxyUrl + url;

    const response = await fetch(corsUrl);
    const responseText = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseText, "application/xml");

    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
        throw new Error("Error parsing RSS feed.");
    }

    const items = xmlDoc.querySelectorAll("item");
    const episodes = Array.from(items).map((item) => ({
        imageUrl:
            item.querySelector("itunes\\:image")?.getAttribute("href") ??
            item.querySelector("image")?.getAttribute("href") ??
            item.querySelector("media\\:content")?.getAttribute("url") ??
            podcast.imageUrl,
        title: item.querySelector("title")?.textContent ?? "No title",
        link: item.querySelector("link")?.textContent ?? "#",
        description: item.querySelector("description")?.textContent ?? "No description",
        pubDate: item.querySelector("pubDate")?.textContent ?? "No publication date",
        enclosure: item.querySelector("enclosure")?.getAttribute("url") ?? "No audio URL",
    }));

    console.log("responseText", episodes);
    displayEpisodes(episodes);
}

function displayEpisodes(episodes) {
    const container = document.getElementById("episodes-container");
    container.innerHTML = "";

    episodes.forEach((episode) => {
        const episodeContainer = document.createElement("div");
        episodeContainer.classList.add(
            "episode",
            "mb-4",
            "p-3",
            "border",
            "rounded",
            "d-flex",
            "flex-column",
            "flex-sm-row",
            "align-items-center"
        );

        const imageContainer = document.createElement("div");
        imageContainer.style.width = "20%";

        const artwork = document.createElement("img");
        //artwork.classList.add("episode-title");
        artwork.src = episode.imageUrl;
        artwork.style.width = "100%";
        artwork.style.aspectRatio = "1";
        artwork.loading = "lazy";
        imageContainer.appendChild(artwork);
        episodeContainer.appendChild(imageContainer);

        const episodeDiv = document.createElement("div");
        episodeDiv.style.width = "80%";
        episodeDiv.classList.add("episode-info", "ps-3");

        const titleElement = document.createElement("h5");
        titleElement.classList.add("episode-title");
        titleElement.textContent = episode.title;
        episodeDiv.appendChild(titleElement);

        const pubDateElement = document.createElement("p");
        pubDateElement.classList.add("text-muted");
        pubDateElement.textContent = `Published on: ${episode.pubDate}`;
        episodeDiv.appendChild(pubDateElement);

        const descriptionElement = document.createElement("p");
        descriptionElement.classList.add("episode-description");
        descriptionElement.textContent = episode.description;
        episodeDiv.appendChild(descriptionElement);

        const audioButton = document.createElement("button");
        audioButton.addEventListener("click", () => {
            const audio = document.getElementById("audio");
            const audioSource = document.getElementById("audio-source");
            const audioPlayer = document.getElementById("audio-player");

            audioSource.src = episode.enclosure;
            audio.load();
            getSponsorSections(episode.enclosure, audio.duration);
            audio.play();

            const episodeTitle = document.getElementById("episode-title");
            episodeTitle.textContent = episode.title;
            const audioArtwork = document.getElementById("audio-artwork");
            audioArtwork.src = episode.imageUrl;

            audioPlayer.style.display = "flex";
        });
        audioButton.textContent = "Play Episode";
        audioButton.classList.add("btn", "btn-primary", "mt-3");
        episodeDiv.appendChild(audioButton);

        episodeContainer.appendChild(episodeDiv);
        container.appendChild(episodeContainer);
    });
}

function showResult(podcast) {
    document.title = `Podcast App - Sponsor Skipper | ${podcast.title}`;
    document.getElementById("main-title").textContent = podcast.title;

    document.getElementById("nr-of-episodes").textContent = `${podcast.nrOdEpisodes} episodes`;

    const artworkElement = document.getElementById("artwork");
    artworkElement.src = podcast.imageUrl;
    artworkElement.alt = podcast.title;

    const categoryContainer = document.getElementById("category-container");
    categoryContainer.innerHTML = "";

    podcast.categories.forEach((category) => {
        const categoryLink = document.createElement("a");
        categoryLink.className = "card-link";
        categoryLink.href = `?category=${category.id}`;
        categoryLink.textContent = category.name;
        categoryContainer.appendChild(categoryLink);
    });

    const websiteButton = document.getElementById("website-btn");
    websiteButton.href = podcast.link;

    const rssButton = document.getElementById("rss-btn");
    rssButton.href = podcast.url;

    if (podcast.fundingUrl) {
        const btnContainer = document.getElementById("btn-container");
        const fundingBtn = document.createElement("a");
        fundingBtn.className = "btn btn-success mt-3";
        fundingBtn.href = podcast.fundingUrl;
        fundingBtn.textContent = podcast.fundingText ? podcast.fundingText : "Support Podcast";
        btnContainer.append(fundingBtn);
    }

    document.getElementById("description").textContent = podcast.description;
}
