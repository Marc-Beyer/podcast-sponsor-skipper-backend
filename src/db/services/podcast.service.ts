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
            console.log("Podcast saved successfully");
        } catch (error) {
            console.error("Error saving podcast:", error);
        } finally {
            await AppDataSource.destroy();
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
            return podcast;
        } catch (error) {
            console.error("Error retrieving podcast:", error);
            return null;
        } finally {
            await AppDataSource.destroy();
        }
    }

    async getAllPodcasts(): Promise<Podcast[]> {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);

        try {
            const podcasts = await podcastRepository.find({
                relations: ["categories"],
            });
            return podcasts;
        } catch (error) {
            console.error("Error retrieving podcasts:", error);
            return [];
        } finally {
            await AppDataSource.destroy();
        }
    }

    async getPodcastsByCategory(categoryId: number): Promise<Podcast[]> {
        await initializeDataSource();

        const categoryRepository = AppDataSource.getRepository(Category);

        const category = await categoryRepository.findOne({
            where: { id: categoryId },
            relations: ["podcasts"],
        });

        if (!category) {
            throw new Error("Category not found");
        }

        return category.podcasts;
    }
}
