import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

        const { data: productOptions, metadata } = await query.graph({
            entity: "product_option",
            fields: ["id", "title", "values.*"],
            pagination: {
                skip: 0,
                take: 10,
            },
        });

        // Group and format the data
        const groupedOptions = productOptions.reduce((acc, option) => {
            const title = option.title.toLowerCase();

            if (!acc[title]) {
                acc[title] = {
                    title: option.title,
                    option_id: [],
                    values: []
                };
            }

            // Add option_id
            acc[title].option_id.push(option.id);

            // Process values
            option.values.forEach(val => {
                const lowerValue = val.value.toLowerCase();
                const existingValue = acc[title].values.find(v =>
                    v.value.toLowerCase() === lowerValue
                );

                if (existingValue) {
                    // Add value_id if not already present
                    if (!existingValue.value_id.includes(val.id)) {
                        existingValue.value_id.push(val.id);
                    }
                } else {
                    // Create new value entry
                    acc[title].values.push({
                        value_id: [val.id],
                        value: val.value
                    });
                }
            });

            return acc;
        }, {});

        // Convert to array and take first entry (assuming you want one object per title)
        const formattedResults = Object.values(groupedOptions);

        res.json(formattedResults);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
