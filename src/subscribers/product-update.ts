import {
    SubscriberArgs,
    type SubscriberConfig,
} from "@medusajs/medusa"
import { Modules } from "@medusajs/framework/utils"
import { createMeiliSearchClient } from "./utlis/meilisearch-config";
import { transformProductData } from "./utlis/transform";

export default async function productUpdateHandler({
    event: { data },
    container,
}: SubscriberArgs<{
    [x: string]: any; entity_id: string
}>) {
    try {
        const productService = container.resolve(Modules.PRODUCT)
        const product = await productService.retrieveProduct(data.id, {
            relations: ["categories", "variants", "options", "collection.*", "tags", "images", "variants.options", "type.*", "tags.*",
                // TODO: add brand
                // "brand.*"
            ]
        });
        if (!product) {
            throw new Error(`Product not found for ID: ${data.id}`);
        }

        const transformedProduct = transformProductData(product);
        const client = createMeiliSearchClient();
        const index = client.index("products");
        await index.updateDocuments([transformedProduct]);
        console.log(`Product updated in MeiliSearch: ${product.id}`);
    } catch (error) {
        console.error(`Error handling product update for ID ${data.id}:`, error);
    }
}

export const config: SubscriberConfig = {
    event: "product.updated",
};