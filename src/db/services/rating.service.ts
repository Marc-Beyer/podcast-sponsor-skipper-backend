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

    async addRating(rating: Partial<Rating>): Promise<Rating | undefined> {
        await initializeDataSource();

        const ratingRepository = AppDataSource.getRepository(Rating);
        const sponsorSectionRepository = AppDataSource.getRepository(SponsorSection);
        try {
            if (rating.sponsorSection === undefined) return undefined;
            const sponsorSection = await sponsorSectionRepository.findOne({
                where: { id: rating.sponsorSection.id },
            });

            if (sponsorSection == null) return undefined;

            const newRating = ratingRepository.create(rating);
            const savedRating = await ratingRepository.save(newRating);
            const ratings = await ratingRepository.find({ where: { sponsorSection: sponsorSection } });

            const totalRating = ratings.reduce((accumulator, currentValue) => {
                return accumulator + (currentValue.isPositive ? Constants.RATING_POSITIVE_FACTOR : Constants.RATING_NEGATIVE_FACTOR);
            }, 0);

            sponsorSection.rating = totalRating;
            await sponsorSectionRepository.save(sponsorSection);

            return savedRating;
        } catch (error) {
            console.error("Error adding rating:", error);
            throw error;
        }
        return undefined;
    }
}
