import {
    SubscriberArgs,
    type SubscriberConfig,
} from "@medusajs/medusa"
import { createMeiliSearchClient } from "./utlis/meilisearch-config";

export default async function productDeleteHandler({
    event: { data },
    container,
}: SubscriberArgs<{
    [x: string]: any; entity_id: string
}>) {
    try {
        const client = createMeiliSearchClient();
        const index = client.index("products");
        await index.deleteDocument(data.id);
        console.log(`Product deleted from MeiliSearch: ${data.id}`);
    } catch (error) {
        console.error(`Error handling product deletion for ID ${data.id}:`, error);
    }
}

export const config: SubscriberConfig = {
    event: "product.deleted",
};
