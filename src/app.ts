import "dotenv/config";
import "reflect-metadata";
import express, { Application, Request, Response } from "express";
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

// Start a proxy to fetch the RSS feed in the browser with CORS headers
app.get("/proxy", (req: Request, res: Response) => {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
        res.status(400).send("URL is required");
        return;
    }

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch the RSS feed. Status code: ${response.status}`);
            }

            res.set("Content-Type", response.headers.get("content-type") || "text/xml");

            response
                .text()
                .then((data: string) => {
                    res.send(data);
                })
                .catch(() => {
                    res.status(500).send("Failed to fetch RSS feed");
                });
        })
        .catch(() => {
            res.status(500).send("Failed to fetch RSS feed");
        });
});

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
