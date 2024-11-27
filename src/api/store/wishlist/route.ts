
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createWishlistWorkflow } from "src/workflows/create-wishlist/create-wishlist";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    console.log('1');

    const { result } = await createWishlistWorkflow(req);
    console.log("🚀 ~ POST ~ result:", result)
    res.json({ wishlist: result });
};