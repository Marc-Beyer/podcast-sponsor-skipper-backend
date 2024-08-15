import { FindOptionsSelect, ILike } from "typeorm";
import { requestPodcast } from "../../podcastRequestManager.js";
import { AppDataSource, initializeDataSource } from "../data-source.js";
import { Category } from "../entities/category.entity.js";
import { Podcast } from "../entities/podcast.entity.js";
import { Constants } from "../../utils/constants.js";
import { SponsorSection } from "../entities/sponsorSection.entity.js";

export class PodcastService {
    async updatePodcastById(podcastId: number) {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);

        try {
            const podcast = await podcastRepository.findOne({
                where: { id: podcastId },
                relations: ["categories"],
            });
            if (!podcast) return false;

            return await this.updatePodcast(podcast);
        } catch (error) {
            console.error("Error retrieving podcast:", error);
            return null;
        }
    }

    async rankPodcast(podcastId: number, ranking: number) {
        const podcastRepository = AppDataSource.getRepository(Podcast);

        const podcast = await podcastRepository.findOne({ where: { id: podcastId } });
        if (podcast != null) {
            podcast.ranking = ranking;
            await podcastRepository.save(podcast);
        }
    }

    async updatePodcast(podcast: Podcast) {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);
        const categoryRepository = AppDataSource.getRepository(Category);

        try {
            const [newPodcast, categories] = await requestPodcast(podcast.url);
            if (!newPodcast || !categories) return null;

            const updatedPodcast = { ...newPodcast, id: podcast.id };

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
            updatedPodcast.categories = updatedCategories;

            await podcastRepository.save(updatedPodcast);
            console.log("Podcast updated successfully");

            return updatedPodcast;
        } catch (error) {
            console.error("Error retrieving podcast:", error);
            return null;
        }
    }

    async updateOldestPodcasts(nrOfPodcasts: number) {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);

        try {
            const podcasts = await podcastRepository.find({
                order: { lastUpdate: { direction: "ASC" } },
                relations: ["categories"],
                take: nrOfPodcasts,
            });
            for (const podcast of podcasts) {
                await this.updatePodcast(podcast);
            }

            return podcasts;
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

    async getAllPodcasts(page: number, language: string, search: string, isAdmin: boolean): Promise<[Podcast[], number]> {
        await initializeDataSource();

        const podcastRepository = AppDataSource.getRepository(Podcast);

        try {
            const queryBuilder = podcastRepository.createQueryBuilder("podcast").leftJoinAndSelect("podcast.categories", "category");

            if (isAdmin) {
                queryBuilder
                    .leftJoinAndMapMany(
                        "podcast.sponsorSections",
                        SponsorSection,
                        "sponsorSection",
                        "sponsorSection.podcastUrl = podcast.url"
                    )
                    .leftJoinAndMapOne("sponsorSection.submittedBy", "sponsorSection.submittedBy", "submittedBy");
            }

            const [podcasts, count] = await queryBuilder
                .where("podcast.language ILIKE :language", { language: `${language}%` })
                .andWhere("podcast.title ILIKE :search", { search: `%${search}%` })
                .orderBy("podcast.ranking", "DESC")
                .take(Constants.NR_OF_RESULTS_PER_PAGE)
                .skip(page * Constants.NR_OF_RESULTS_PER_PAGE)
                .getManyAndCount();

            if (isAdmin) {
                (podcasts as (Podcast & { sponsorSections: SponsorSection[] })[]).forEach((podcast) => {
                    podcast.sponsorSections.forEach((section) => {
                        if (section.submittedBy) {
                            delete (section.submittedBy as { token?: string }).token;
                        }
                    });
                });
            }

            return [podcasts, count];
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

            queryBuilder.orderBy("podcast.ranking", "DESC");

            queryBuilder.skip(page * Constants.NR_OF_RESULTS_PER_PAGE).take(Constants.NR_OF_RESULTS_PER_PAGE);

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
