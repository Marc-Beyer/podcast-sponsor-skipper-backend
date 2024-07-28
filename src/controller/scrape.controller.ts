import { Request, Response } from "express";
import { logRequest } from "../utils/logger.js";
import { PodcastService } from "../db/services/podcast.service.js";
import { UserService } from "../db/services/user.service.js";
import { UserRole } from "../enums/UserRole.js";

const userService = new UserService();

export const scrapeRSSFeeds = async (request: Request, response: Response) => {
    logRequest(request);

    try {
        const { url, username, token } = request.body;

        if (!url.startsWith("http")) {
            response.status(400).send("Incorrect RSS Feed Url!");
        }

        const user = await userService.getUserByUsername(username);
        if (!user) {
            return response.status(401).send("Invalid username or token");
        }

        const isTokenValid = await userService.validateUserToken(user, token);
        if (!isTokenValid) {
            return response.status(401).send("Invalid username or token");
        }

        if (user.role !== UserRole.ADMIN) {
            return response.status(401).send("Unauthorized");
        }

        const scrapeResponse = await fetch(url);
        const regexp = /"https:\/\/chartable\.com\/podcasts\/[^"]+"/gm;
        const textResponse = await scrapeResponse.text();
        const matchArray = [...textResponse.matchAll(regexp)];
        const linkSet = new Set<string>();
        for (const match of matchArray) {
            const link = match[0];
            linkSet.add(link.substring(1, link.length - 1));
        }
        console.log(linkSet);
        console.log(linkSet.size);

        const linkArray = Array.from(linkSet);
        for (let index = 0; index < linkArray.length; index++) {
            const iterator = linkArray[index];
            console.log(index, "/", linkArray.length);
            await scrapeRSSFeedUrl(iterator);
        }

        response.json(scrapeResponse);
        /**
         * 
    document.querySelectorAll("a").forEach((e) => {
        if (e.href?.startsWith("https://chartable.com/podcasts/") === true) console.log(e.href);
    });
    "https*:\/\/[^"]+">RSS feed<\/a>
         */
    } catch (error) {
        console.error("Error in scrapeRSSFeeds controller:", error);
        response.status(500).send("Something went wrong");
    }
};

export const scrapeRSSFeedUrl = async (url: string) => {
    try {
        const podcastService = new PodcastService();
        const scrapeResponse = await fetch(url);
        const regexp = /"https*:\/\/[^"]+">RSS feed<\/a>/gm;
        const textResponse = await scrapeResponse.text();
        const match = textResponse.match(regexp);
        if (match) {
            let link = match[0];
            link = link.substring(1, link.length - 14);
            console.log("Match", link);
            return await podcastService.getPodcastByUrl(link);
        } else {
            console.log("No match", url);
            return null;
        }
    } catch (error) {
        console.error("Error in scrapeRSSFeedUrl controller:", error);
        return null;
    }
};
