import { Router } from "express";
import { getAllCategories } from "./controller/category.controller.js";
import { getAllPodcasts, getPodcastsByCategory } from "./controller/podcast.controller.js";

const router = Router();

router.get("/categories", getAllCategories);
router.get("/categories/:categoryId/podcasts", getPodcastsByCategory);
router.get("/podcasts", getAllPodcasts);

export default router;
