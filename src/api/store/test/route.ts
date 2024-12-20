import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CreateTestWorkflow } from "src/workflows/create-wishlist";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const filters = {
      title_filter: (req.query.q as string) || null,
      description_filter: (req.query.q as string) || null,
      collection_ids: Array.isArray(req.query.collection_ids)
        ? (req.query.collection_ids as string[])
        : null,
      category_ids: Array.isArray(req.query.category_ids)
        ? (req.query.category_ids as string[])
        : null,
      price_range: {
        min: parseFloat(req.query.min_price as string) || 0,
        max: parseFloat(req.query.max_price as string) || 1000000,
      },
      option_value_groups: Array.isArray(req.query.option_value)
        ? (req.query.option_value as unknown as string[][])
        : [],
    };
    const options = { input: filters };

    const { result } = await CreateTestWorkflow().run(options);

    res.json({ result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};
