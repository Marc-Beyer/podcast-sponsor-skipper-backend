import * as crypto from "crypto";
import * as bcrypt from "bcrypt";

import { AppDataSource, initializeDataSource } from "../data-source.js";
import { User } from "../entities/user.entity.js";
import { UserRole } from "../../enums/UserRole.js";

export class UserService {
    async getAllUsers(): Promise<User[]> {
        await initializeDataSource();

        const userRepository = AppDataSource.getRepository(User);
        try {
            return await userRepository
                .createQueryBuilder("user")
                .select([
                    "user.id AS id",
                    "user.username AS username",
                    "user.trustScore AS trustScore",
                    "user.role AS role",
                    "user.createdAt AS createdAt",
                ])
                .addSelect((subQuery) => {
                    return subQuery
                        .select("COUNT(*)", "count")
                        .from("sponsor_section", "sponsorSection")
                        .where("sponsorSection.submittedById = user.id");
                }, "nrOfSponsorSections")
                .addSelect((subQuery) => {
                    return subQuery.select("COUNT(*)", "count").from("rating", "rating").where("rating.submittedById = user.id");
                }, "nrOfRatings")
                .getRawMany();
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }

    async addUser(): Promise<{ username: string; token: string }> {
        await initializeDataSource();

        const userRepository = AppDataSource.getRepository(User);
        try {
            const username = await this.generateUniqueUsername();
            const { token, hashedToken } = await this.generateUniqueToken();

            const newUser = userRepository.create({
                username,
                token: hashedToken,
                role: UserRole.DEFAULT,
            });
            await userRepository.save(newUser);

            return { username, token };
        } catch (error) {
            console.error("Error adding user:", error);
            throw error;
        }
    }

    async getUserById(id: number): Promise<User | null> {
        await initializeDataSource();

        const userRepository = AppDataSource.getRepository(User);
        try {
            return await userRepository.findOneBy({ id });
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    }

    async getUserByUsername(username: string): Promise<User | null> {
        await initializeDataSource();

        const userRepository = AppDataSource.getRepository(User);
        try {
            return await userRepository.findOneBy({ username });
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    }

    async deleteUser(user: User) {
        await initializeDataSource();

        const userRepository = AppDataSource.getRepository(User);
        try {
            userRepository.delete({ id: user.id });
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }

    async validateUserToken(user: User, token: string): Promise<boolean> {
        try {
            return await bcrypt.compare(token, user.token);
        } catch (error) {
            console.error("Error validating user token:", error);
            throw error;
        }
    }

    private async generateUniqueUsername(): Promise<string> {
        const userRepository = AppDataSource.getRepository(User);
        let username: string;
        let usernameIsUnique = false;

        do {
            username = `user_${crypto.randomBytes(12).toString("hex")}`;
            const existingUser = await userRepository.findOne({ where: { username } });
            if (!existingUser) {
                usernameIsUnique = true;
            }
        } while (!usernameIsUnique);

        return username;
    }

    private async generateUniqueToken(): Promise<{ token: string; hashedToken: string }> {
        const userRepository = AppDataSource.getRepository(User);
        let token: string;
        let hashedToken: string;
        let tokenIsUnique = false;

        do {
            token = crypto.randomBytes(32).toString("hex");
            hashedToken = await bcrypt.hash(token, 10);
            const existingUser = await userRepository.findOne({ where: { token: hashedToken } });
            if (!existingUser) {
                tokenIsUnique = true;
            }
        } while (!tokenIsUnique);

        return { token, hashedToken };
    }
}
