import "reflect-metadata";
import { DataSource } from "typeorm";
import { Podcast } from "./entities/podcast.entity.js";
import { toNumberOrDefault } from "../helper.js";
import { Category } from "./entities/category.entity.js";
import { User } from "./entities/user.entity.js";
import { SponsorSection } from "./entities/sponsorSection.entity.js";

export const POSTGRES_DB = process.env.POSTGRES_DB ?? "podcastdb";
export const POSTGRES_HOST = process.env.POSTGRES_HOST ?? "localhost";
export const POSTGRES_PORT = toNumberOrDefault(process.env.POSTGRES_PORT, 5432);
export const POSTGRES_USER = process.env.POSTGRES_USER ?? "postgres";
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? "";

if (POSTGRES_PASSWORD === "") throw new Error("POSTGRES_PASSWORD not set!");

export const AppDataSource = new DataSource({
    type: "postgres",
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    synchronize: true,
    logging: false,
    entities: [Podcast, Category, User, SponsorSection],
    migrations: [],
    subscribers: [],
});

export const initializeDataSource = async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
};
