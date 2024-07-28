import { Request, Response } from "express";

import { UserService } from "../db/services/user.service.js";
import { logRequest } from "../utils/logger.js";

const userService = new UserService();

export const addUser = async (request: Request, response: Response) => {
    logRequest(request);
    try {
        const { username, token } = await userService.addUser();
        response.status(201).json({ username, token });
    } catch (error) {
        console.error("Error in addUser controller:", error);
        response.status(500).send("Something went wrong");
    }
};
