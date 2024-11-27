import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);


        // Validate and retrieve title from query
        const title = Array.isArray(req.query.title) ? req.query.title[0] : req.query.title;
        if (!title || typeof title !== 'string') {
            return res.status(400).json({ error: "Title is required and must be a string." });
        }

        const { data: productOptions, metadata } = await query.graph({
            entity: "product_option",
            fields: ["id", "title", "values.*"],
            filters: {
                title: { $ilike: title },
                deleted_at: { $eq: null },
            },
            pagination: {
                skip: 0,
                take: 10,
            },
        });
        // const t = await query.graph({
        //     entity: "product_option",
        //     fields: ["*"],
        //     filters: {
        //         deleted_at: { $eq: null },
        //     },
        // });

        const productOptionIds = productOptions.map(option => option.id);

        // const d = await query.graph({
        //     entity: "value",
        //     fields: ["id", "value", "created_at", "updated_at", "option_id"],
        //     filters: {
        //         option_id: { $in: productOptionIds },
        //         deleted_at: { $eq: null },
        //     },
        //     pagination: {
        //         skip: 0,
        //         take: 10,
        //     }
        // });

        // const groupedValues = productOptionValues.reduce((acc, value) => {
        //     if (!acc[value.option_id]) {
        //         acc[value.option_id] = [];
        //     }
        //     acc[value.option_id].push(value);
        //     return acc;
        // }, {});

        // const productOptionDetails = productOptions.map(option => ({
        //     ...option,
        //     values: groupedValues[option.id] || [],
        // }));

        res.json({
            product_option_values: productOptions,
            pagination: metadata,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
