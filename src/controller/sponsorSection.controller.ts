import { Request, Response } from "express";

import { SponsorSectionService } from "../db/services/sponsorSection.service.js";
import { logRequest } from "../utils/logger.js";
import { UserService } from "../db/services/user.service.js";
import { DurationService } from "../db/services/duration.service.js";
import { RatingService } from "../db/services/rating.service.js";

const sponsorSectionService = new SponsorSectionService();
const userService = new UserService();
const durationService = new DurationService();
const ratingService = new RatingService();

export const addSponsorSection = async (request: Request, response: Response) => {
    logRequest(request);

    const { episodeUrl, podcastUrl, startPosition, endPosition, duration, username, token } = request.body;

    try {
        const user = await userService.getUserByUsername(username);
        if (!user) {
            return response.status(401).send("Invalid username or token");
        }

        const isTokenValid = await userService.validateUserToken(user, token);
        if (!isTokenValid) {
            return response.status(401).send("Invalid username or token");
        }

        if (duration) {
            const createdDuration = await durationService.addDuration({
                episodeUrl: episodeUrl,
                value: duration,
            });

            const newSection = await sponsorSectionService.addSponsorSection({
                episodeUrl,
                podcastUrl,
                startPosition,
                endPosition,
                submittedBy: user,
                duration: createdDuration,
            });

            response.status(201).json(newSection.id);
        } else {
            return response.status(400).send("Bad Request");
        }
    } catch (error) {
        console.error("Error in addSponsorSection controller:", error);
        response.status(500).send("Something went wrong");
    }
};

export const rateSponsorSection = async (request: Request, response: Response) => {
    logRequest(request);

    const { sponsorSectionId, isPositive, duration, username, token } = request.body;

    try {
        const user = await userService.getUserByUsername(username);
        if (!user) {
            return response.status(401).send("Invalid username or token");
        }

        const isTokenValid = await userService.validateUserToken(user, token);
        if (!isTokenValid) {
            return response.status(401).send("Invalid username or token");
        }

        const sponsorSection = await sponsorSectionService.getSponsorSectionById(sponsorSectionId);

        if (sponsorSection == null) {
            return response.status(400).send("Invalid sponsorSectionId");
        }

        const newRating = await ratingService.addRating({
            sponsorSection,
            isPositive,
            submittedBy: user,
        });

        response.status(201).json(sponsorSection.rating);
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
