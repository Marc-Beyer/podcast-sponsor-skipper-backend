import { Request, Response } from "express";

import { UserService } from "../db/services/user.service.js";
import { logRequest } from "../utils/logger.js";
import { UserRole } from "../enums/UserRole.js";

const userService = new UserService();

export const login = async (request: Request, response: Response) => {
    logRequest(request);
    const { username, token } = request.body;

    try {
        const user = await userService.getUserByUsername(username);
        if (!user) {
            return response.status(401).send("Invalid username or token");
        }

        const isTokenValid = await userService.validateUserToken(user, token);
        if (!isTokenValid) {
            return response.status(401).send("Invalid username or token");
        }

        switch (user.role) {
            case UserRole.ADMIN: {
                const users = (await userService.getAllUsers()).map((user) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { token, ...userWithoutToken } = user;
                    return userWithoutToken;
                });

                return response.status(200).json({
                    UserRole: user.role,
                    users,
                });
            }
            case UserRole.MODERATOR:
                return response.status(200).json({ UserRole: user.role });
            case UserRole.DEFAULT:
            case UserRole.BANNED:
                return response.status(200).json({ UserRole: UserRole.DEFAULT });

            default:
                return response.status(401).send("Invalid user");
        }
    } catch (error) {
        console.error("Error in addSponsorSection controller:", error);
        response.status(500).send("Something went wrong");
    }
};

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

export const deleteUser = async (request: Request, response: Response) => {
    logRequest(request);
    const { username, token } = request.body;

    try {
        const user = await userService.getUserByUsername(username);
        if (!user) {
            return response.status(401).send("Invalid username or token");
        }

        const isTokenValid = await userService.validateUserToken(user, token);
        if (!isTokenValid) {
            return response.status(401).send("Invalid username or token");
        }

        userService.deleteUser(user);

        response.status(200).send("Deleted Account");
    } catch (error) {
        console.error("Error in addSponsorSection controller:", error);
        response.status(500).send("Something went wrong");
    }
};
