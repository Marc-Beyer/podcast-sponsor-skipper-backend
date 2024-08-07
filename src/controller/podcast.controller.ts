import { Request, Response } from "express";
import { PodcastService } from "../db/services/podcast.service.js";
import { logRequest } from "../utils/logger.js";
import { Constants } from "../utils/constants.js";

const podcastService = new PodcastService();

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

    const page = parseInt(queryParams.page ?? "0");

    try {
        const [podcasts, count] = await podcastService.getAllPodcasts(
            Number.isNaN(page) ? 0 : page,
            queryParams.lang ?? "",
            queryParams.search ?? ""
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
        const podcasts = await podcastService.getPodcastByUrl(url);
        response.json(podcasts);
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
