import MeiliSearch from "meilisearch";

const meiliSearchConfig = {
    host: process.env.MEILI_SEARCH_HOST || "http://meilisearch.io",
    apiKey: process.env.MEILI_SEARCH_API_KEY || "your_api_key",
};

// Validate environment variables
if (!process.env.MEILI_SEARCH_HOST || !process.env.MEILI_SEARCH_API_KEY) {
    throw new Error("MeiliSearch host and API key must be set in environment variables.");
}

export const createMeiliSearchClient = () => {
    return new MeiliSearch(meiliSearchConfig);
};
