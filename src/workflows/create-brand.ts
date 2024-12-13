// other imports...
import {
    createStep,
    // ...
    StepResponse,
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { BRAND_MODULE } from "src/modules/brand"
import BrandModuleService from "src/modules/brand/service"

// ...

type CreateBrandWorkflowInput = {
    name: string
}
export const createBrandStep = createStep(
    "create-brand-step",
    async (input: CreateBrandWorkflowInput, { container }) => {
        console.log("🚀 ~ CreateBrandWorkflowInput:", input)
        const brandModuleService: BrandModuleService = container.resolve(
            BRAND_MODULE
        )

        const brand = await brandModuleService.createBrands(input)
        console.log("🚀 ~ brand:", brand)

        return new StepResponse(brand, brand.id)
    }
);

export const createBrandWorkflow = createWorkflow(
    "create-brand",
    (input: CreateBrandWorkflowInput) => {
        console.log("🚀 ~ CreateBrandWorkflowInput:", input)

        const brand = createBrandStep(input)

        return new WorkflowResponse(brand)
    }
)