import { ILike } from "typeorm";
import { NR_OF_RESULTS_PER_PAGE } from "../../constants.js";
import { requestPodcast } from "../../podcastRequestManager.js";
import { AppDataSource, initializeDataSource } from "../data-source.js";
import { Category } from "../entities/category.entity.js";
import { Podcast } from "../entities/podcast.entity.js";

export class PodcastService {
    async updatePodcast(podcastId: number) {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);
        const categoryRepository = AppDataSource.getRepository(Category);

        try {
            let podcast = await podcastRepository.findOne({
                where: { id: podcastId },
                relations: ["categories"],
            });
            if (!podcast) return false;

            const [newPodcast, categories] = await requestPodcast(podcast.url);
            if (!newPodcast || !categories) return null;

            console.log("Old Podcast", podcast);
            podcast = { ...podcast, ...newPodcast, id: podcast.id };

            console.log("Updated Podcast", podcast);

            await podcastRepository.save(podcast);
            console.log("Podcast updated successfully");

            const updatedCategories = await Promise.all(
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

            // Update the categories of the podcast
            podcast.categories = updatedCategories;

            return podcast;
        } catch (error) {
            console.error("Error retrieving podcast:", error);
            return null;
        }
    }

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

            return podcast;
        } catch (error) {
            console.error("Error saving podcast:", error);
        }
    }

    async getPodcastByUrl(url: string): Promise<Podcast | undefined> {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);

        try {
            const podcast = await podcastRepository.findOne({
                where: { url },
                relations: ["categories"],
            });
            if (podcast) return podcast;

            const [newPodcast, categories] = await requestPodcast(url);
            if (newPodcast && newPodcast) {
                return await this.savePodcast(newPodcast, categories);
            }
            return undefined;
        } catch (error) {
            console.error("Error retrieving podcast:", error);
            return undefined;
        }
    }

    async getAllPodcasts(page: number, language: string, search: string): Promise<[Podcast[], number]> {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);

        try {
            return await podcastRepository.findAndCount({
                relations: ["categories"],
                take: NR_OF_RESULTS_PER_PAGE,
                skip: page * NR_OF_RESULTS_PER_PAGE,
                where: {
                    language: ILike(`${language}%`),
                    title: ILike(`%${search}%`),
                },
            });
        } catch (error) {
            console.error("Error retrieving podcasts:", error);
            return [[], 0];
        }
    }

    async getPodcastsByCategory(
        categoryId: number | undefined,
        page: number,
        language: string | undefined,
        search: string | undefined
    ): Promise<[Podcast[], number]> {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);

        try {
            const queryBuilder = podcastRepository.createQueryBuilder("podcast");
            if (language) {
                queryBuilder.andWhere("podcast.language LIKE :language", { language: `${language}%` });
            }

            if (search) {
                queryBuilder.andWhere("podcast.title LIKE :search", { search: `%${search}%` });
            }
            if (categoryId) {
                queryBuilder
                    .innerJoinAndSelect("podcast.categories", "category", "category.id = :categoryId", { categoryId })
                    .leftJoinAndSelect("podcast.categories", "allCategories");
            } else {
                queryBuilder.leftJoinAndSelect("podcast.categories", "allCategories");
            }
            queryBuilder.skip(page * NR_OF_RESULTS_PER_PAGE).take(NR_OF_RESULTS_PER_PAGE);

            return await queryBuilder.getManyAndCount();
        } catch (error) {
            console.error("Error retrieving podcasts:", error);
            return [[], 0];
        }
    }

    async getNrOfPodcasts(): Promise<number> {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);
        const nrOfPodcasts = await podcastRepository.count();

        return nrOfPodcasts;
    }
}
