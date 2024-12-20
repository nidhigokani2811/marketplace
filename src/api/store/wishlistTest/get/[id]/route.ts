import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import {
    ContainerRegistrationKeys,
} from "@medusajs/framework/utils"

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve(
        ContainerRegistrationKeys.QUERY
    )

    // First get wishlists
    const { data: wishlists } = await query.graph({
        entity: "wishlist",
        fields: [
            "id",
            "customer_id",
            "product_id",
            "created_at",
            "updated_at",
            "deleted_at",

        ],
        filters: {
            customer_id: req.params.id,
        },
    })

    // Get unique product IDs
    const productIds = [...new Set(wishlists.map(w => w.product_id))]

    // Fetch products
    const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "title", "thumbnail", "handle"],
        filters: {
            id: productIds
        }
    })

    // Combine wishlist and product data
    const wishlistsWithProducts = wishlists.map(wishlist => ({
        ...wishlist,
        product: products.find(p => p.id === wishlist.product_id)
    }))

    res.json({ wishlists: wishlistsWithProducts })
}