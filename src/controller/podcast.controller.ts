import { Request, Response } from "express";
import { PodcastService } from "../db/services/podcast.service.js";
import { logRequest } from "../utils/logger.js";
import { NR_OF_RESULTS_PER_PAGE } from "../constants.js";

const podcastService = new PodcastService();
let nrOfPages = 2;
let nrOfPodcasts = 2;

export const addPodcast = () => {
    nrOfPodcasts++;
    nrOfPages = Math.ceil(nrOfPodcasts / NR_OF_RESULTS_PER_PAGE);
};

export const getNrOfPodcasts = async () => {
    try {
        nrOfPodcasts = await podcastService.getNrOfPodcasts();
        nrOfPages = Math.ceil(nrOfPodcasts / NR_OF_RESULTS_PER_PAGE);
        console.log("nrOfPodcasts", nrOfPodcasts, "nrOfPages", nrOfPages);
    } catch (error) {
        console.error("Error in getNrOfPodcasts controller:", error);
    }
};

export const getPodcastsByCategory = async (request: Request, response: Response) => {
    logRequest(request);
    const categoryId = parseInt(request.params.categoryId, 10);
    console.log(`[s]: categoryId ${categoryId}`);

    if (isNaN(categoryId)) {
        return response.status(400).send("Invalid category ID");
    }

    try {
        const podcasts = await podcastService.getPodcastsByCategory(categoryId);
        response.json({ podcasts, nrOfPages });
    } catch (error) {
        console.error("Error in getPodcastsByCategory controller:", error);
        response.status(500).send((error as Error).message);
    }
};

interface GetAllPodcastsRequest {
    page: string;
}

export const getAllPodcasts = async (request: Request, response: Response) => {
    logRequest(request);
    const queryParams: GetAllPodcastsRequest = request.query as unknown as GetAllPodcastsRequest;

    const page = parseInt(queryParams.page);

    try {
        const podcasts = await podcastService.getAllPodcasts(Number.isNaN(page) ? 0 : page);
        response.json({ podcasts, nrOfPages });
    } catch (error) {
        console.error("Error in getAllPodcasts controller:", error);
        response.status(500).send((error as Error).message);
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
        response.status(500).send((error as Error).message);
    }
};
