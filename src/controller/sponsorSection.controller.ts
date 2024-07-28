import { Request, Response } from "express";

import { SponsorSectionService } from "../db/services/sponsorSection.service.js";
import { logRequest } from "../utils/logger.js";
import { UserService } from "../db/services/user.service.js";

const sponsorSectionService = new SponsorSectionService();
const userService = new UserService();

export const addSponsorSection = async (request: Request, response: Response) => {
    logRequest(request);

    const { episodeUrl, podcastUrl, startPosition, endPosition, username, token } = request.body;

    try {
        const user = await userService.getUserByUsername(username);
        if (!user) {
            return response.status(401).send("Invalid username or token");
        }

        const isTokenValid = await userService.validateUserToken(user, token);
        if (!isTokenValid) {
            return response.status(401).send("Invalid username or token");
        }

        const newSection = await sponsorSectionService.addSponsorSection({
            episodeUrl,
            podcastUrl,
            startPosition,
            endPosition,
            submittedBy: user,
        });

        response.status(201).json(newSection.id);
    } catch (error) {
        console.error("Error in addSponsorSection controller:", error);
        response.status(500).send("Something went wrong");
    }
};

export const getSponsorSectionsByUrl = async (request: Request, response: Response) => {
    logRequest(request);
    try {
        const sponsorSections = await sponsorSectionService.getSponsorSectionsByUrl(request.body.episodeUrl);
        response.json(
            sponsorSections.map((sponsorSection) => {
                return {
                    id: sponsorSection.id,
                    startPosition: sponsorSection.startPosition,
                    endPosition: sponsorSection.endPosition,
                };
            })
        );
    } catch (error) {
        console.error("Error in getSponsorSectionById controller:", error);
        response.status(500).send("Something went wrong");
    }
};
