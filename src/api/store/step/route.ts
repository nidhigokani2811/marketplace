import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(request: MedusaRequest, res: MedusaResponse) {
    const productModuleService = request.scope.resolve(
        Modules.PRODUCT
    )

    res.json({
        products: await productModuleService.listProducts(),
    })
}