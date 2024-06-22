import { AppDataSource, initializeDataSource } from "../data-source.js";
import { Category } from "../entities/category.entity.js";

export class CategoryService {
    async getAllCategories(): Promise<Category[]> {
        await initializeDataSource();

        const categoryRepository = AppDataSource.getRepository(Category);
        try {
            return await categoryRepository.find();
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw error;
        }
    }
}
