import WishlistModuleService from "../../../modules/wishlist/service";
import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { WISHLIST_MODULE } from "src/modules/wishlist";
type CreateWishlistStepInput = {
    customer_id: string
    product_id: string
}

export const createWishlistStep = createStep(
    "create-wishlist-step",
    async (input: CreateWishlistStepInput, { container }) => {

        const wishlistModuleService: WishlistModuleService = container.resolve(
            WISHLIST_MODULE
        )


        // return new StepResponse(count);

        // // Convert ids to strings to match database column type
        const customer_id = String(input.customer_id)
        const product_id = String(input.product_id)

        // Check if wishlist entry exists
        const existingWishlist = await wishlistModuleService.listWishlists({
            customer_id,
            product_id
        })

        // If exists, remove it and return the deleted entry
        if (existingWishlist.length > 0) {
            const deleted = await wishlistModuleService.deleteWishlists(existingWishlist[0].id)
            return new StepResponse(deleted)
        }

        // If doesn't exist, create new wishlist entry
        const wishlist = await wishlistModuleService.createWishlists({
            customer_id,
            product_id
        })
        return new StepResponse(wishlist, wishlist.id)
    }
);
