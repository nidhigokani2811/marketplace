import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    // Using the `graph` method to fetch product options
    const { data, metadata } = await query.graph({
      entity: "product_option",
      fields: ["id", "title", "product_id", "metadata", "created_at", "updated_at"],
      filters: {
        deleted_at: null,
      },
      pagination: {
        skip: 0,
        take: 10,
      },
    });

    // Normalize titles to lowercase and filter out duplicates (case-insensitive)
    const uniqueData = [];
    const seenTitles = new Set();

    for (const option of data) {
      const normalizedTitle = option.title.toLowerCase(); // Normalize title to lowercase
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);  // Add the lowercase title to the set
        uniqueData.push(option);  // Add the product option to the result
      }
    }

    res.json({
      products: uniqueData,
      pagination: metadata,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
