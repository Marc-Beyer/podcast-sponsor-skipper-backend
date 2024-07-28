import { Request, Response } from "express";
import { CategoryService } from "../db/services/category.service.js";
import { logRequest } from "../utils/logger.js";

const categoryService = new CategoryService();

export const getAllCategories = async (request: Request, response: Response) => {
    logRequest(request);
    try {
        const categories = await categoryService.getAllCategories();
        response.json(categories);
    } catch (error) {
        console.error("Error in getAllCategories controller:", error);
        response.status(500).send("Something went wrong");
    }
};
