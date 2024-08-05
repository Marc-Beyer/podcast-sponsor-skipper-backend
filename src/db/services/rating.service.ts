import { Constants } from "../../utils/constants.js";
import { AppDataSource, initializeDataSource } from "../data-source.js";
import { Rating } from "../entities/rating.entity.js";
import { SponsorSection } from "../entities/sponsorSection.entity.js";

export class RatingService {
    async getAllRatings(sponsorSection: SponsorSection): Promise<Rating[]> {
        await initializeDataSource();

        const ratingRepository = AppDataSource.getRepository(Rating);
        try {
            return await ratingRepository.find({ where: { sponsorSection: sponsorSection } });
        } catch (error) {
            console.error("Error fetching ratings:", error);
            throw error;
        }
    }

    async addRating(rating: Partial<Rating>): Promise<SponsorSection> {
        await initializeDataSource();

        const ratingRepository = AppDataSource.getRepository(Rating);
        const sponsorSectionRepository = AppDataSource.getRepository(SponsorSection);
        try {
            if (rating.sponsorSection === undefined) throw new Error("Missing sponsorSection");
            const sponsorSection = await sponsorSectionRepository.findOne({
                where: { id: rating.sponsorSection.id },
            });

            if (sponsorSection == null) throw new Error("Cannot find sponsorSection");

            const newRating = ratingRepository.create(rating);
            await ratingRepository.save(newRating);
            console.log("newRating", newRating);

            const ratings = await ratingRepository.find({ where: { sponsorSection: { id: sponsorSection.id } } });
            console.log("ratings", ratings);

            const totalRating = ratings.reduce((accumulator, currentValue) => {
                return accumulator + (currentValue.isPositive ? Constants.RATING_POSITIVE_FACTOR : Constants.RATING_NEGATIVE_FACTOR);
            }, 0);

            sponsorSection.rating = totalRating;
            return await sponsorSectionRepository.save(sponsorSection);
        } catch (error) {
            console.error("Error adding rating:", error);
            throw error;
        }
    }
}
