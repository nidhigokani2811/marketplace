import { createStep } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const step1 = createStep("step-1", async (_, { container }) => {
    const productModuleService = container.resolve(
        Modules.PRODUCT
    )

    const products = await productModuleService.listProducts()
})