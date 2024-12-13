import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import {
    CreateWishlistWorkflow,
    CreateWishlistInput,
} from "../../../../workflows/create-wishlist"

export const POST = async (
    req: MedusaRequest<CreateWishlistInput>,
    res: MedusaResponse
) => {
    console.log("req.body", req.body);
    const { result } = await CreateWishlistWorkflow(req.scope)
        .run({
            input: req.body,
        })
    console.log("result", result);
    res.json({ wishlist: result })
}