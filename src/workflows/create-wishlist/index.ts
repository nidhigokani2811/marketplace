import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import WishlistModuleService from "src/modules/wishlist/service"

import { WISHLIST_MODULE } from "../../modules/wishlist"

export type CreateWishlistInput = {
    customer_id: string,
    product_id: string
}

export const createWishlistStep = createStep(
    "create-wishlist-step",
    async (input: CreateWishlistInput, { container }) => {
        const wishlistModuleService: WishlistModuleService = container.resolve(
            WISHLIST_MODULE
        )

        const wishlist = await wishlistModuleService.createWishlists(input)

        return new StepResponse(wishlist, wishlist.id)
    },
    async (id: string, { container }) => {
        const wishlistModuleService: WishlistModuleService = container.resolve(
            WISHLIST_MODULE
        )
        await wishlistModuleService.deleteWishlists(id) // Rollback logic
    }
)