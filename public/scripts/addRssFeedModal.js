/* eslint-disable */
"use strict";

const addRssFeedCloseBtn = document.getElementById("add-rss-feed-close-btn");
const addRssFeedBtn = document.getElementById("add-rss-feed-btn");
const addRssFeedInput = document.getElementById("add-rss-feed-input");

addRssFeedBtn.addEventListener("click", async () => {
    const rssFeed = addRssFeedInput.value;

    const success = await addRssFeed(rssFeed);

    if (success === true) addRssFeedCloseBtn.click();
});

async function addRssFeed(rssFeed) {
    console.log("rssFeed", rssFeed);
    const response = await fetch("/api/v1/podcast", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: rssFeed }),
    });

    if (response.ok) {
        const podcast = await response.json();
        console.log(podcast);
        return true;
    }
    return false;
}
