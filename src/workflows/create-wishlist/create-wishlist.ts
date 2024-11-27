
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import WishlistModuleService from "../../modules/wishlist/service";
export const createWishlistWorkflow = async (req: MedusaRequest) => {


    const { customer_id, product_id } = req.body as { customer_id: any, product_id: any };
    const wishlistService = new WishlistModuleService();

    const result = await wishlistService.createWishlists(customer_id, product_id);

    return { result };
};