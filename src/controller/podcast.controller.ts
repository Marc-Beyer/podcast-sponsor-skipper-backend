import { Request, Response } from "express";
import { PodcastService } from "../db/services/podcast.service.js";
import { logRequest } from "../utils/logger.js";

const podcastService = new PodcastService();

export const getPodcastsByCategory = async (request: Request, response: Response) => {
    logRequest(request);
    const categoryId = parseInt(request.params.categoryId, 10);
    console.log(`[s]: categoryId ${categoryId}`);

    if (isNaN(categoryId)) {
        return response.status(400).send("Invalid category ID");
    }

    try {
        const podcasts = await podcastService.getPodcastsByCategory(categoryId);
        response.json(podcasts);
    } catch (error) {
        console.error("Error in getPodcastsByCategory controller:", error);
        response.status(500).send((error as Error).message);
    }
};

export const getAllPodcasts = async (request: Request, response: Response) => {
    logRequest(request);
    try {
        const podcasts = await podcastService.getAllPodcasts();
        response.json(podcasts);
    } catch (error) {
        console.error("Error in getAllPodcasts controller:", error);
        response.status(500).send((error as Error).message);
    }
};
