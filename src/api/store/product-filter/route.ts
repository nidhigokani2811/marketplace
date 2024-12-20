import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { PRODUCT_FILTER_MODULE } from "src/modules/product-filter";
import ProductFilterService from "src/modules/product-filter/service";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const filters = {
      query: (req.query.query as string) || null,
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
      brand_ids: Array.isArray(req.query.brand_ids)
        ? (req.query.brand_ids as string[])
        : null,
      option_value: Array.isArray(req.query.option_value)
        ? (req.query.option_value as unknown as string[][])
        : [],
      sort_by: (req.query.sort_by as string) || "created_at",
      sort_order: (req.query.sort_order as string) || "desc",
      region_id: (req.query.region_id as string) || null,
      limit: parseInt(req.query.limit as string) || 10,
      page: parseInt(req.query.page as string) || 0,
      avilableStock: req.query.avilable_stock
        ? req.query.avilable_stock.toString().toLowerCase() == "true"
          ? true
          : false
        : false,
      isDiscountAvailable: req.query.is_discount_available
        ? req.query.is_discount_available.toString().toLowerCase() == "true"
          ? true
          : false
        : false,
    };
    const options = { input: filters };
    const validSortOptions = ["price", "updated_at", "created_at"];

    if (!validSortOptions.includes(filters.sort_by)) {
      filters.sort_by = "updated_at";
    }
    if (!["ASC", "DESC"].includes(filters.sort_order)) {
      filters.sort_order = "DESC";
    }

    const productFilterService: ProductFilterService = req.scope.resolve(
      PRODUCT_FILTER_MODULE
    );
    const result = await productFilterService.getFilterWithValue(filters);
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};
