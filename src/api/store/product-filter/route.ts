import { ContainerRegistrationKeys, isPresent } from "@medusajs/framework/utils";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { setPricingContext } from "@medusajs/medusa/api/utils/middlewares/index";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        setPricingContext();
        console.log("🔍 Request Query:", req.query);
        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
        const searchTerm = req.query.q as string;
        const sortBy = req.query.sort as string;
        const context: object = {}
        const filters: any = {
            deleted_at: null,
        };

        const pricingContext = {
            currency_code: req.query.currency_code || 'usd',
            region_id: req.query.region_id,
            tax_rate: req.query.tax_rate,
        }
        console.log("💰 Pricing Context:", pricingContext);

        if (searchTerm) {
            filters.$or = [
                { title: { $ilike: `%${searchTerm}%` } },
                { description: { $ilike: `%${searchTerm}%` } }
            ];
        }
        console.log("🔎 Search Filters:", filters);

        context["variants.calculated_price"] = {
            context: pricingContext,
        }
        console.log("📊 Query Context:", context);

        const { data, metadata } = await query.graph({
            entity: "product",
            fields: [
                "id",
                "title",
                "subtitle",
                "description",
                "handle",
                "is_giftcard",
                "discountable",
                "thumbnail",
                "collection_id",
                "type_id",
                "weight",
                "length",
                "height",
                "width",
                "hs_code",
                "origin_country",
                "mid_code",
                "material",
                "created_at",
                "updated_at",
                "type.id",
                "type.value",
                "collection.id",
                "collection.title",
                "options.id",
                "options.title",
                "tags.id",
                "tags.value",
                "images.id",
                "images.url",
                "variants.id",
                "variants.title",
                "variants.sku",
                "variants.options.id",
                "variants.options.value"
            ],
            filters: filters,
            pagination: {
                skip: 0,
                take: 10,
            },
            context
        });



        res.json({
            products: data,
            count: metadata.count,
            offset: metadata.skip,
            limit: metadata.take,
        });
    } catch (error) {
        console.log('error', error);

        res.status(500).json({ error: error.message });
    }
};
