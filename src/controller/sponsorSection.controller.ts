import { Request, Response } from "express";

import { SponsorSectionService } from "../db/services/sponsorSection.service.js";
import { logRequest } from "../utils/logger.js";
import { UserService } from "../db/services/user.service.js";
import { DurationService } from "../db/services/duration.service.js";
import { RatingService } from "../db/services/rating.service.js";
import { SponsorSection } from "../db/entities/sponsorSection.entity.js";
import { Constants } from "../utils/constants.js";
import { UserRole } from "../enums/UserRole.js";

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

        if (sponsorSectionId === undefined) {
            return response.status(400).send("Invalid sponsorSectionId");
        }

        const sponsorSection = await sponsorSectionService.getSponsorSectionById(sponsorSectionId);

        if (sponsorSection === null) {
            return response.status(400).send("Invalid sponsorSectionId");
        }

        const updatedSponsorSection = await ratingService.addRating(
            {
                sponsorSection,
                isPositive,
                submittedBy: user,
            },
            user
        );

        response.status(201).json(updatedSponsorSection.rating);
    } catch (error) {
        console.error("Error in addSponsorSection controller:", error);
        response.status(500).send("Something went wrong");
    }
};

export const getSponsorSectionsByUrl = async (request: Request, response: Response) => {
    logRequest(request);

    const { episodeUrl, duration } = request.body;

    try {
        if (episodeUrl === undefined || duration === undefined) {
            return response.status(400).send("Bad request");
        }

        const sponsorSections = await sponsorSectionService.getSponsorSectionsByUrl(episodeUrl);

        const weightedSponsorSections = sponsorSections.map((sponsorSection) => {
            if (sponsorSection.rating >= Constants.RATING_MIN) {
                const age = new Date().getTime() - new Date(sponsorSection.createdAt).getTime();
                if (age < Constants.RATING_BOOST_TIME) {
                    const ageInDays = Math.ceil(age / (1000 * 60 * 60 * 24));
                    sponsorSection.rating += Constants.RATING_BOOST / ageInDays;
                }
            }

            return sponsorSection;
        });

        weightedSponsorSections.sort((sponsorSectionA, sponsorSectionB) => {
            const ratingDiff = sponsorSectionB.rating - sponsorSectionA.rating;
            if (Math.abs(ratingDiff) < Constants.RATING_DIFF) return Math.random() - 0.5;
            return ratingDiff;
        });

        const filteredSponsorSections: SponsorSection[] = [];
        for (const section of weightedSponsorSections) {
            if (section.rating >= Constants.RATING_MIN && section.submittedBy?.role != UserRole.BANNED) {
                if (!filteredSponsorSections.some((existingSection) => isOverlapping(existingSection, section))) {
                    filteredSponsorSections.push(section);
                }
            }
        }

        response.json(
            filteredSponsorSections.map((sponsorSection) => {
                return {
                    id: sponsorSection.id,
                    startPosition: sponsorSection.startPosition,
                    endPosition: sponsorSection.endPosition,
                    isProvisional: sponsorSection.rating < Constants.RATING_MIN_AUTO_SKIP,
                    rating: sponsorSection.rating,
                };
            })
        );
    } catch (error) {
        console.error("Error in getSponsorSectionById controller:", error);
        response.status(500).send("Something went wrong");
    }
};

function isOverlapping(sectionA: SponsorSection, sectionB: SponsorSection): boolean {
    return sectionA.startPosition < sectionB.endPosition && sectionA.endPosition > sectionB.startPosition;
}
