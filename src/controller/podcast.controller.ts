import { Request, Response } from "express";
import { PodcastService } from "../db/services/podcast.service.js";
import { logRequest } from "../utils/logger.js";
import { Constants } from "../utils/constants.js";
import { UserRole } from "../enums/UserRole.js";
import { UserService } from "../db/services/user.service.js";

const podcastService = new PodcastService();
const userService = new UserService();

export const getPodcastsByCategory = async (request: Request, response: Response) => {
    logRequest(request);
    const categoryId = parseInt(request.params.categoryId);
    console.log(`[s]: categoryId ${categoryId}`);

    const queryParams: GetPodcastsRequest = request.query as unknown as GetPodcastsRequest;
    const page = parseInt(queryParams.page ?? "0");

    try {
        const [podcasts, count] = await podcastService.getPodcastsByCategory(
            categoryId,
            Number.isNaN(page) ? 0 : page,
            queryParams.lang,
            queryParams.search
        );
        response.json({ podcasts, nrOfPages: Math.ceil(count / Constants.NR_OF_RESULTS_PER_PAGE) });
    } catch (error) {
        console.error("Error in getPodcastsByCategory controller:", error);
        response.status(500).send("Something went wrong");
    }
};

interface GetPodcastsRequest {
    page?: string;
    lang?: string;
    search?: string;
}

export const getAllPodcasts = async (request: Request, response: Response) => {
    logRequest(request);
    const queryParams: GetPodcastsRequest = request.query as unknown as GetPodcastsRequest;
    const [a, username, token] = request.headers.authorization?.split(" ") ?? [undefined, undefined, undefined];
    const isAdmin = await checkIfAdmin(username, token);

    const page = parseInt(queryParams.page ?? "0");

    try {
        const [podcasts, count] = await podcastService.getAllPodcasts(
            Number.isNaN(page) ? 0 : page,
            queryParams.lang ?? "",
            queryParams.search ?? "",
            isAdmin
        );
        response.json({ podcasts, nrOfPages: Math.ceil(count / Constants.NR_OF_RESULTS_PER_PAGE) });
    } catch (error) {
        console.error("Error in getAllPodcasts controller:", error);
        response.status(500).send("Something went wrong");
    }
};

export const getPodcast = async (request: Request, response: Response) => {
    logRequest(request);

    console.log(request.body);

    const url: string = request.body.url;
    if (!url.startsWith("http")) {
        response.status(400).send("Incorrect RSS Feed Url!");
    }

    try {
        const podcast = await podcastService.getPodcastByUrl(url);
        response.json(podcast);
    } catch (error) {
        console.error("Error in getAllPodcasts controller:", error);
        response.status(500).send("Something went wrong");
    }
};

export const updatePodcast = async (request: Request, response: Response) => {
    logRequest(request);
    const podcastId = parseInt(request.params.podcastId);
    console.log(`[s]: podcastId ${podcastId}`);

    try {
        const podcasts = await podcastService.updatePodcastById(podcastId);
        response.json(podcasts);
    } catch (error) {
        console.error("Error in getAllPodcasts controller:", error);
        response.status(500).send("Something went wrong");
    }
};

export const rankPodcast = async (request: Request, response: Response) => {
    logRequest(request);
    const podcastId = parseInt(request.params.podcastId);
    console.log(`[s]: podcastId ${podcastId}`);

    const { ranking, username, token } = request.body;

    try {
        const user = await userService.getUserByUsername(username);
        if (!user) {
            return response.status(401).send("Invalid username or token");
        }

        const isTokenValid = await userService.validateUserToken(user, token);
        if (!isTokenValid) {
            return response.status(401).send("Invalid username or token");
        }

        if (user.role === UserRole.ADMIN) {
            podcastService.rankPodcast(podcastId, ranking);
            return response.status(200).send("Podcast ranking updated successfully");
        } else {
            return response.status(403).send("Unauthorized: Only admins can update podcast rankings");
        }
    } catch (error) {
        console.error("Error in getAllPodcasts controller:", error);
        response.status(500).send("Something went wrong");
    }
};

interface UpdatePodcastsRequest {
    nr?: string;
}

export const updatePodcasts = async (request: Request, response: Response) => {
    logRequest(request);

    const queryParams: UpdatePodcastsRequest = request.query as unknown as UpdatePodcastsRequest;

    const nr = parseInt(queryParams.nr ?? "1");
    try {
        const podcasts = await podcastService.updateOldestPodcasts(Number.isNaN(nr) ? 1 : nr);
        response.json(podcasts);
    } catch (error) {
        console.error("Error in getAllPodcasts controller:", error);
        response.status(500).send("Something went wrong");
    }
};

const checkIfAdmin = async (username: string | undefined | null, token: string | undefined | null) => {
    if (!username || !token) return false;

    const user = await userService.getUserByUsername(username);
    if (!user) {
        return false;
    }

    const isTokenValid = await userService.validateUserToken(user, token);
    if (!isTokenValid) {
        return false;
    }

    return user.role === UserRole.ADMIN;
};
