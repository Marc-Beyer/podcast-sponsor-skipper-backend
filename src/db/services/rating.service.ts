import { UserRole } from "../../enums/UserRole.js";
import { Constants } from "../../utils/constants.js";
import { AppDataSource, initializeDataSource } from "../data-source.js";
import { Rating } from "../entities/rating.entity.js";
import { SponsorSection } from "../entities/sponsorSection.entity.js";
import { User } from "../entities/user.entity.js";

export class RatingService {
    async getAllRatings(sponsorSection: SponsorSection): Promise<Rating[]> {
        await initializeDataSource();

        const ratingRepository = AppDataSource.getRepository(Rating);
        try {
            return await ratingRepository.find({
                where: { sponsorSection: { id: sponsorSection.id } },
                relations: ["submittedBy"],
            });
        } catch (error) {
            console.error("Error fetching ratings:", error);
            throw error;
        }
    }

    async addRating(rating: Partial<Rating>, user: User): Promise<SponsorSection> {
        await initializeDataSource();

        const ratingRepository = AppDataSource.getRepository(Rating);
        const sponsorSectionRepository = AppDataSource.getRepository(SponsorSection);
        try {
            if (rating.sponsorSection === undefined) throw new Error("Missing sponsorSection");
            const sponsorSection = await sponsorSectionRepository.findOne({
                where: { id: rating.sponsorSection.id },
                relations: ["submittedBy"],
            });

            if (sponsorSection == null) throw new Error("Cannot find sponsorSection");

            // TODO: Maybe remove the section if the creator downvotes it
            if (sponsorSection.submittedBy?.id === user.id) throw new Error("Cannot vote for own section");

            const existingRating = await ratingRepository.findOne({
                where: { sponsorSection: { id: sponsorSection.id }, submittedBy: { id: user.id } },
            });

            // TODO: Maybe let the users change their minds
            if (existingRating) throw new Error("User has already rated this section");

            const newRating = ratingRepository.create(rating);
            await ratingRepository.save(newRating);

            const ratings = await this.getAllRatings(sponsorSection);

            let totalRating = 0;

            for (const rating of ratings) {
                if (rating.submittedBy?.role === UserRole.ADMIN) {
                    totalRating = rating.isPositive ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
                    break;
                }
            }

            if (totalRating === 0) {
                totalRating = ratings.reduce((accumulator, currentValue) => {
                    if (currentValue.submittedBy?.role === UserRole.BANNED) return accumulator;
                    return accumulator + (currentValue.isPositive ? Constants.RATING_POSITIVE_FACTOR : Constants.RATING_NEGATIVE_FACTOR);
                }, 0);
            }

            sponsorSection.rating = totalRating;
            return await sponsorSectionRepository.save(sponsorSection);
        } catch (error) {
            console.error("Error adding rating:", error);
            throw error;
        }
    }
}
