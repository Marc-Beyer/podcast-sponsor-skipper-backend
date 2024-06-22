import "dotenv/config";
import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { toNumberOrDefault } from "./helper.js";
import { createDatabase } from "./db/createDatabase.js";
import { POSTGRES_DB, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_USER, initializeDataSource } from "./db/data-source.js";
import router from "./routes.js";

// Get environment variables
const PORT: number = toNumberOrDefault(process.env.PORT, 80);

const app: Application = express();
const dirname = path.dirname(fileURLToPath(import.meta.url));
const apiPath = "/api/v1";

app.use(cors());
app.use(express.json());

// Serve the file of the ../public folder
app.use(express.static(path.join(dirname, "../public")));
app.get("/", (req, res) => {
    console.log(`[s]: GET /`);
    res.sendFile(path.join(dirname, "../public", "index.html"));
});

app.use(apiPath, router);

/*
app.get(`${apiPath}/category/:categoryId/podcasts`, async (request: Request, response: Response) => {
    console.log(`[s]: GET ${apiPath}/podcasts`);

    console.log(`[s]: request.params ${request.params}`, request.params);

    const category = request.params.category;
    console.log(`[s]: category ${category}`);

    const podcasts = await getAllPodcasts();
    response.status(200).json(podcasts);
});

app.get(`${apiPath}/podcasts`, async (request: Request, response: Response) => {
    console.log(`[s]: GET ${apiPath}/podcasts`);

    console.log(`[s]: request.params ${request.params}`, request.params);

    const category = request.params.category;
    console.log(`[s]: category ${category}`);

    const podcasts = await getAllPodcasts();
    response.status(200).json(podcasts);
});

app.get(`${apiPath}/categories`, async (request: Request, response: Response) => {
    console.log(`[s]: GET ${apiPath}/categories`);
    const categories = await getAllCategories();
    response.status(200).json(categories);
});

app.post(`${apiPath}/podcast`, async (request: Request, response: Response) => {
    console.log(`[s]: POST ${apiPath}/podcast`);
    const requestBody: PodcastRequest = request.body;

    console.log(`[s]: BODY`, requestBody.url);

    if (requestBody.url === undefined) {
        response.status(400).send("Url is missing!");
    }

    const root = await requestPodcast(requestBody.url);

    response.status(200).json(root);
});
*/

// Init database
await createDatabase(POSTGRES_DB, {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
});
await initializeDataSource();

// Start the webserver
app.listen(PORT, (): void => {
    console.log(`[s]: Started server at http://127.0.0.1:${PORT}`);
});
