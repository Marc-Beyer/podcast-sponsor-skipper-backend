import { Router } from "express";
import { getAllCategories } from "./controller/category.controller.js";
import { getAllPodcasts, getPodcast, getPodcastsByCategory } from "./controller/podcast.controller.js";
import { scrapeRSSFeeds } from "./controller/scrape.controller.js";

const router = Router();

router.get("/categories", getAllCategories);
router.get("/categories/:categoryId/podcasts", getPodcastsByCategory);
router.get("/podcasts", getAllPodcasts);

router.post("/podcast", getPodcast);
router.post("/scrape", scrapeRSSFeeds);

export default router;
