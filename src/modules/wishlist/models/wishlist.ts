import { model } from "@medusajs/framework/utils"

export const Wishlist = model.define("wishlist", {
    id: model.id().primaryKey(),
    customer_id: model.text().index(),
    product_id: model.text().index()
})