import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createWishlistStep } from "./steps/create-wishlist"
import { createTestStep } from "./steps/test"
import { createProductOptionFilterStep } from "./steps/product-option-filtet"

export type CreateWishlistInput = {
    customer_id: string
    product_id: string
}

export type CreateInput = {
    title_filter?: string
    description_filter?: string
    collection_ids?: string[]
    category_ids?: string[]
    price_range?: { min: number, max: number },
    option_value_groups?: string[][]
}

export type CreateProductOptionFilterInput = {
    query?: string,
    collection_ids?: string[],
    category_ids?: string[]
    price_range?: { min: number, max: number },
    option_value?: string[][],
    sort_by?: string,
    sort_order?: string,
    limit?: number,
    page?: number,
    avilableStock?: boolean,
    isDiscountAvailable?: boolean
}

export const CreateWishlistWorkflow = createWorkflow(
    "create-wishlist",
    (input: CreateWishlistInput) => {
        console.log("input", input);
        const wishlist = createWishlistStep(input)

        return new WorkflowResponse(wishlist)
    }
)
export const CreateTestWorkflow = createWorkflow(
    "create-test",
    (input) => {
        const test = createTestStep(input)
        return new WorkflowResponse(test)
    }
)

export const CreateProductOptionFilterWorkflow = createWorkflow(
    "create-option-filter",
    (input: CreateProductOptionFilterInput) => {
        const test = createProductOptionFilterStep(input)
        return new WorkflowResponse(test)
    }
)