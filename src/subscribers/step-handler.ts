import { SubscriberArgs } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function subscriberHandler({ container }: SubscriberArgs) {
    const productModuleService = container.resolve(
        Modules.PRODUCT
    )

    const products = await productModuleService.listProducts()
}