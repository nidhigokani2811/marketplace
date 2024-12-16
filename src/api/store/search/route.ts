import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { createMeiliSearchClient } from "src/subscribers/utlis/meilisearch-config";

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const client = createMeiliSearchClient();
        try {
            const searchResult = await client
                .index("products")
                .search(req.query.q as string);

            res.json(searchResult);
        } catch (error) {
            console.error('Error searching MeiliSearch:', error);
            throw error;
        }

    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ error: error.message })
    }
}