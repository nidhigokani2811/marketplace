import {
    SubscriberArgs,
    type SubscriberConfig,
} from "@medusajs/medusa"
import { Modules } from "@medusajs/framework/utils"
import MeiliSearchService, { transformProduct } from "../modules/meilisearch/service"

export default async function productCreatedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ entity_id: string }>) {
    const productService = container.resolve("productService") as any;
    const meiliSearchService = container.resolve("meiliSearchService") as MeiliSearchService;

    try {
        const product = await productService.retrieve(data.entity_id);
        await meiliSearchService.addDocuments("products", [product], "product");
        console.log("Product added to MeiliSearch:", product.id);
    } catch (error) {
        console.error("Error syncing product with MeiliSearch:", error);
    }
}

export async function productUpdatedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ entity_id: string }>) {
    const productService = container.resolve("productService") as any;
    const meilisearchService = container.resolve("meilisearchService") as MeiliSearchService;

    try {
        const product = await productService.retrieve(data.entity_id);
        const transformedProduct = transformProduct(product);

        await meilisearchService.replaceDocuments(
            "products",
            [transformedProduct],
            "products"
        );
        console.log("Product updated in MeiliSearch:", transformedProduct);
    } catch (error) {
        console.error("Error updating product in MeiliSearch:", error);
    }
}

export async function productDeletedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ entity_id: string }>) {
    const meilisearchService = container.resolve("meilisearchService") as MeiliSearchService;

    try {
        await meilisearchService.deleteDocument("products", data.entity_id)
        console.log("Product deleted from MeiliSearch:", data.entity_id)
    } catch (error) {
        console.error("Error deleting product from MeiliSearch:", error)
    }
}

export const createdConfig: SubscriberConfig = {
    event: "product.created",
}

export const updatedConfig: SubscriberConfig = {
    event: "product.updated",
}

export const deletedConfig: SubscriberConfig = {
    event: "product.deleted",
}
