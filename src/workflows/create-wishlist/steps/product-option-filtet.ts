import { WISHLIST_MODULE } from "src/modules/wishlist";
import { container } from "node_modules/@medusajs/framework/dist/container";
import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"
import WishlistModuleService from "src/modules/wishlist/service";
import { CreateInput, CreateProductOptionFilterInput } from "..";


export const createProductOptionFilterStep = createStep(
    "create-product-option-filter",
    async (input: CreateProductOptionFilterInput) => {

        const wishlistModuleService: WishlistModuleService = container.resolve(
            WISHLIST_MODULE
        )
        const count = await wishlistModuleService.getFilterWithValue(input);
        return new StepResponse(count)
    }
);
