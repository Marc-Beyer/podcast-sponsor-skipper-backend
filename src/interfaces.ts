export interface PodcastRequest {
    url: string;
}

export interface Podcast {
    url: string;
    title: string;
    description: string;
    link: string;
    language: string;
    category: string[];
    imageUrl: string;
    explicit: boolean;
    locked: boolean;
    complete: boolean;
    lastUpdate: Date;
    nrOdEpisodes: number;

    copyright?: string;
    author?: string;
    fundingText?: string;
    fundingUrl?: string;
}

export interface RSSResponse {
    rss: XmlRSS;
}

export interface XmlRSS {
    channel: XmlChannel;
}

export interface XmlChannel {
    "atom:link": [];
    title: string;
    description: string;
    link: string;
    language: string;
    "itunes:category": XmlCategory | XmlCategory[];
    "itunes:explicit": "true" | "false" | "yes" | "no";
    "itunes:image": { "@_href": string };
    item: [];

    "podcast:locked"?: "true" | "false" | "yes" | "no";
    "podcast:guid"?: string;
    "itunes:author"?: string;
    copyright?: string;
    "podcast:txt"?: string;
    "podcast:funding"?: { "#text": string; "@_url": string };
    "itunes:type"?: "episodic" | "serial";
    "itunes:complete"?: "true" | "false" | "yes" | "no";
}

export interface XmlCategory {
    "itunes:category"?: { "@_text": string } | { "@_text": string }[];
    "@_text"?: string;
}
