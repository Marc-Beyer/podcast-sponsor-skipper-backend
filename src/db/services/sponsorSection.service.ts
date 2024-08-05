import { AppDataSource, initializeDataSource } from "../data-source.js";
import { SponsorSection } from "../entities/sponsorSection.entity.js";

export class SponsorSectionService {
    async getAllSponsorSections(): Promise<SponsorSection[]> {
        await initializeDataSource();

        const sponsorSectionRepository = AppDataSource.getRepository(SponsorSection);
        try {
            return await sponsorSectionRepository.find();
        } catch (error) {
            console.error("Error fetching sponsor sections:", error);
            throw error;
        }
    }

    async addSponsorSection(sectionData: Partial<SponsorSection>): Promise<SponsorSection> {
        await initializeDataSource();

        const sponsorSectionRepository = AppDataSource.getRepository(SponsorSection);
        try {
            const newSection = sponsorSectionRepository.create(sectionData);
            return await sponsorSectionRepository.save(newSection);
        } catch (error) {
            console.error("Error adding sponsor section:", error);
            throw error;
        }
    }

    async getSponsorSectionsByUrl(episodeUrl: string): Promise<SponsorSection[]> {
        await initializeDataSource();

        const sponsorSectionRepository = AppDataSource.getRepository(SponsorSection);
        try {
            return await sponsorSectionRepository.findBy({ episodeUrl });
        } catch (error) {
            console.error("Error fetching sponsor sections:", error);
            throw error;
        }
    }

    async getSponsorSectionById(sponsorSectionId: number): Promise<SponsorSection | null> {
        await initializeDataSource();

        const sponsorSectionRepository = AppDataSource.getRepository(SponsorSection);
        try {
            return await sponsorSectionRepository.findOneBy({ id: sponsorSectionId });
        } catch (error) {
            console.error("Error fetching sponsor sections:", error);
            throw error;
        }
    }
}
