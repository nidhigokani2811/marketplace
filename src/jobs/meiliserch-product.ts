import { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createMeiliSearchClient } from "src/subscribers/utlis/meilisearch-config";
import { transformProductData } from "src/subscribers/utlis/transform";

function areProductsEqual(product1, product2, excludedKeys = []) {
  // Create a set of keys to exclude from comparison
  const excludedSet = new Set(excludedKeys);

  const keys1 = Object.keys(product1).filter((key) => !excludedSet.has(key));
  const keys2 = Object.keys(product2).filter((key) => !excludedSet.has(key));

  // Check if the number of keys is the same
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check for equality of each key
  for (const key of keys1) {
    if (
      !keys2.includes(key) ||
      JSON.stringify(product1[key]) !== JSON.stringify(product2[key])
    ) {
      return false;
    }
  }

  return true; // All checks passed, products are equal
}

export default async function productJob(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: p } = await query.graph({
    entity: "product",
    fields: [
      "*",
      "categories.*",
      "variants.*",
      "options.*",
      "collection.*",
      "tags.*",
      "images.*",
      "variants.options.*",
      "type.*",
      "tags.*",
    ],
  });
  p.forEach(async (product) => {
    const client = createMeiliSearchClient();
    const index = client.index("products");
    try {
      // Attempt to get the existing document
      const existingProduct = await index
        .getDocument(product.id)
        .catch((err) => {
          if (err.code === "document_not_found") {
            return null; // Return null to indicate the document does not exist
          }
          return null; // Return null for other errors as well
        });

      const transformedProduct = transformProductData(product);
      if (!existingProduct) {
        // If the document does not exist, add it
        await index.addDocuments([transformedProduct]);
      } else {
        // If the document exists, check for equality and update if necessary
        const isSame = areProductsEqual(
          existingProduct,
          transformedProduct,
          []
        );

        if (!isSame) {
          await index.updateDocuments([transformedProduct]);
        }
      }

      // Check if the product has been deleted and delete it from MeiliSearch
      if (product.deleted_at) {
        await index.deleteDocuments([product.id]);
      }
    } catch (error) {}
  });
}

export const config = {
  name: "meilisearch-product",
  schedule: "0 0 * * *",
};
