import { NR_OF_RESULTS_PER_PAGE } from "../../constants.js";
import { addPodcast } from "../../controller/podcast.controller.js";
import { requestPodcast } from "../../podcastRequestManager.js";
import { AppDataSource, initializeDataSource } from "../data-source.js";
import { Category } from "../entities/category.entity.js";
import { Podcast } from "../entities/podcast.entity.js";

export class PodcastService {
    async savePodcast(podcast: Podcast, categories: string[]) {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);
        const categoryRepository = AppDataSource.getRepository(Category);

        // Map the string categories to categories
        podcast.categories = await Promise.all(
            categories.map(async (name) => {
                let category = await categoryRepository.findOne({ where: { name } });
                if (!category) {
                    category = new Category();
                    category.name = name;
                    await categoryRepository.save(category);
                }
                return category;
            })
        );

        try {
            await podcastRepository.save(podcast);
            addPodcast();
            console.log("Podcast saved successfully");

            return podcast;
        } catch (error) {
            console.error("Error saving podcast:", error);
        }
    }

    async getPodcastByUrl(url: string): Promise<Podcast | null> {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);

        try {
            const podcast = await podcastRepository.findOne({
                where: { url },
                relations: ["categories"],
            });
            if (podcast) return podcast;

            const newPodcast = await requestPodcast(url);
            return newPodcast ?? null;
        } catch (error) {
            console.error("Error retrieving podcast:", error);
            return null;
        }
    }

    async getAllPodcasts(page: number): Promise<Podcast[]> {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);

        try {
            const podcasts = await podcastRepository.find({
                relations: ["categories"],
                take: NR_OF_RESULTS_PER_PAGE,
                skip: page * NR_OF_RESULTS_PER_PAGE,
            });
            return podcasts;
        } catch (error) {
            console.error("Error retrieving podcasts:", error);
            return [];
        }
    }

    async getPodcastsByCategory(categoryId: number): Promise<Podcast[]> {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);
        const podcasts = await podcastRepository
            .createQueryBuilder("podcast")
            .innerJoinAndSelect("podcast.categories", "category", "category.id = :categoryId", { categoryId: categoryId })
            .leftJoinAndSelect("podcast.categories", "allCategories")
            .getMany();

        return podcasts;
    }

    async getNrOfPodcasts(): Promise<number> {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);
        const nrOfPodcasts = await podcastRepository.count();

        return nrOfPodcasts;
    }
}
