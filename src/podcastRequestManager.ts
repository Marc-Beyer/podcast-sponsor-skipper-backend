import { XMLParser } from "fast-xml-parser";
import { XmlChannel, XmlCategory } from "./interfaces.js";
import { Podcast as PodcastClass } from "./db/entities/podcast.entity.js";
import { PodcastService } from "./db/services/podcast.service.js";

const XMLParserOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
};

export async function requestPodcast(url: string): Promise<PodcastClass | undefined> {
    try {
        const response = await fetch(url);
        const headerDate = response.headers && response.headers.get("date") ? response.headers.get("date") : "no response date";
        console.log("Status Code:", response.status);
        console.log("Date in Response header:", headerDate);

        const responseText = await response.text();
        console.log("Text:", responseText.substring(0, 700));

        const parser = new XMLParser(XMLParserOptions);
        const parsedResponse = parser.parse(responseText);
        console.log("Parsed:", parsedResponse);
        const channel: XmlChannel = parsedResponse.rss.channel;
        console.log("Parsed itunes:image:", parsedResponse.rss.channel["itunes:image"]);
        console.log("Parsed podcast:funding:", parsedResponse.rss.channel["podcast:funding"]);
        console.log("Parsed itunes:category:", parsedResponse.rss.channel["itunes:category"]);

        /*
            const podcastOld: Podcast = {
                url: url,
                title: channel.title,
                description: channel.description,
                link: channel.link,
                language: channel.language,
                category: parseXmlCategory(channel["itunes:category"]),
                imageUrl: channel["itunes:image"]["@_href"],
                explicit: channel["itunes:explicit"] != "no" && channel["itunes:explicit"] != "false",
                locked: channel["podcast:locked"] == "yes" || channel["podcast:locked"] == "true",
                complete: channel["itunes:complete"] == "yes" || channel["itunes:complete"] == "true",
                lastUpdate: new Date(),
                nrOdEpisodes: channel.item.length,
                copyright: channel.copyright,
                author: channel["itunes:author"],
                fundingText: channel["podcast:funding"]?.["#text"],
                fundingUrl: channel["podcast:funding"]?.["@_url"],
            };
            */

        const podcast = new PodcastClass();
        podcast.url = url;
        podcast.title = channel.title;
        podcast.description = channel.description;
        podcast.link = channel.link ?? url;
        podcast.language = channel.language;
        podcast.imageUrl = channel["itunes:image"]["@_href"];
        podcast.explicit = channel["itunes:explicit"] != "no" && channel["itunes:explicit"] != "false";
        podcast.locked = channel["podcast:locked"] == "yes" || channel["podcast:locked"] == "true";
        podcast.complete = channel["itunes:complete"] == "yes" || channel["itunes:complete"] == "true";
        podcast.lastUpdate = new Date();
        podcast.nrOdEpisodes = channel.item.length;
        podcast.copyright = channel.copyright;
        podcast.author = channel["itunes:author"];
        podcast.fundingText = channel["podcast:funding"]?.["#text"];
        podcast.fundingUrl = channel["podcast:funding"]?.["@_url"];

        console.log("Parsed podcast:", podcast);

        const categories = parseXmlCategory(channel["itunes:category"]);

        const podcastService = new PodcastService();
        const podcastClass = await podcastService.savePodcast(podcast, categories);
        return podcastClass;
    } catch (err) {
        console.log((err as Error).message);
        return undefined;
    }
}

function parseXmlCategory(xmlCategory: XmlCategory | XmlCategory[]): string[] {
    const extractCategories = (category: XmlCategory): string[] => {
        const categories: string[] = [];

        if (category["@_text"]) {
            categories.push(category["@_text"]);
        }

        if (category["itunes:category"]) {
            if (Array.isArray(category["itunes:category"])) {
                categories.push(...category["itunes:category"].map((it) => it["@_text"]));
            } else {
                categories.push(category["itunes:category"]["@_text"]);
            }
        }

        return categories;
    };

    if (Array.isArray(xmlCategory)) {
        return xmlCategory.flatMap(extractCategories);
    } else {
        return extractCategories(xmlCategory);
    }
}
