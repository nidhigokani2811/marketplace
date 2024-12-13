// other imports...
import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve("query")

    const { data: brands } = await query.graph({
        entity: "brand",
        fields: ["*", "products.*"],
    })

    res.json({ brands })
}