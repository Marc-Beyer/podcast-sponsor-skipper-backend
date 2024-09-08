import { Router } from "express";
import { getAllCategories } from "./controller/category.controller.js";
import {
    getAllPodcasts,
    getPodcast,
    getPodcastById,
    getPodcastsByCategory,
    rankPodcast,
    updatePodcast,
    updatePodcasts,
} from "./controller/podcast.controller.js";
import { scrapeRSSFeeds } from "./controller/scrape.controller.js";
import { addSponsorSection, getSponsorSectionsByUrl, rateSponsorSection } from "./controller/sponsorSection.controller.js";
import { addUser, login, deleteUser, updateUserTrustScore } from "./controller/user.controller.js";

const router = Router();

router.get("/categories", getAllCategories);
router.get("/categories/:categoryId/podcasts", getPodcastsByCategory);
router.get("/podcasts", getAllPodcasts);
router.get("/podcasts/update", updatePodcasts);
router.get("/podcast/:podcastId/update", updatePodcast);
router.post("/podcast/:podcastId/rank", rankPodcast);

router.get("/podcast/:podcastId", getPodcastById);
router.post("/podcast", getPodcast);
router.post("/scrape", scrapeRSSFeeds);

router.post("/submit-sponsor-section", addSponsorSection);
router.post("/get-sponsor-section", getSponsorSectionsByUrl);
router.post("/rate-sponsor-section", rateSponsorSection);

router.post("/delete-account", deleteUser);
router.get("/register", addUser);
router.post("/login", login);
router.post("/updateTrustScore", updateUserTrustScore);

export default router;
