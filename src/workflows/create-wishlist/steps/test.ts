import { WISHLIST_MODULE } from "src/modules/wishlist";
import { container } from "node_modules/@medusajs/framework/dist/container";
import HelloModuleService from "../../../modules/product-filter/service";
import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"
import WishlistModuleService from "src/modules/wishlist/service";
import { CreateInput } from "..";


export const createTestStep = createStep(
    "create-test-step",
    async (input: CreateInput) => {
        console.log('step');

        const helloModuleService: HelloModuleService = container.resolve(
            "product-filter"
        )
        const count = await helloModuleService.getCount();
        return new StepResponse(count)
    }
);
