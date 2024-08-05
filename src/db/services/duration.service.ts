import { AppDataSource, initializeDataSource } from "../data-source.js";
import { Duration } from "../entities/duration.entity.js";

export class DurationService {
    async getAllDurations(episodeUrl: string): Promise<Duration[]> {
        await initializeDataSource();

        const durationRepository = AppDataSource.getRepository(Duration);
        try {
            return await durationRepository.find({ where: { episodeUrl: episodeUrl } });
        } catch (error) {
            console.error("Error fetching durations:", error);
            throw error;
        }
    }

    async addDuration(duration: Partial<Duration>): Promise<Duration> {
        await initializeDataSource();

        const durationRepository = AppDataSource.getRepository(Duration);
        try {
            const newDuration = durationRepository.create(duration);
            return await durationRepository.save(newDuration);
        } catch (error) {
            console.error("Error adding sponsor section:", error);
            throw error;
        }
    }
}
