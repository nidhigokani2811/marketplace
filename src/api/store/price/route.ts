import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";


export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    //pric1
    try {
        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
        const currencyCode = req.query.currency_code?.toString().toLowerCase(); // e.g. 'usd' or 'eur'
        const minPrice = Number(req.query.min_price) || 0;
        console.log("🚀 ~ GET ~ minPrice:", minPrice)
        const maxPrice = Number(req.query.max_price) || Infinity;
        console.log("🚀 ~ GET ~ maxPrice:", maxPrice)

        // const { data, metadata } = await query.graph({
        //     entity: "product",
        //     fields: ["id", "title", "variants.*", "variants.price_set.*", "variants.price_set.prices.*"],
        //     relations: ["variants.price_set.prices"], 
        // });
        // const filteredProducts = data.map(product => ({
        //     ...product,
        //     variants: product.variants.map(variant => ({
        //         ...variant,
        //         price_set: {
        //             ...variant.price_set,
        //             prices: variant.price_set.prices.filter(price =>
        //                 (!currencyCode || price.currency_code === currencyCode) &&
        //                 price.amount >= minPrice &&
        //                 price.amount <= maxPrice
        //             )
        //         }
        //     }))
        // })).filter(product =>
        //     // Only keep products that have variants with matching prices
        //     product.variants.some(variant => variant.price_set.prices.length > 0)
        // );
        const response = await query.gql(
            `query {
                product {
                    id
                    title
                    variants {
                        id
                        title
                        price_set {
                            id
                            prices(filter: { 
                                    rules_count: 0
                                }) {
                                id
                                currency_code
                                amount
                                price_list_id
                                min_quantity
                                max_quantity
                                price_list {
                                    id
                                    name
                                }
                                rules_count
                                created_at
                                updated_at
                                deleted_at
                                raw_amount
                            }
                        }
                    }
                }
            }`,

        );
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

    // try {
    //     const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    //     const response = await query.gql(
    //         `query ($priceSetId: String!) {
    //             prices(where: { price_set_id: $priceSetId }) {
    //                 id
    //                 title
    //                 currency_code
    //                 raw_amount
    //                 min_quantity
    //                 max_quantity
    //                 price_set_id
    //                 rules_count
    //                 price_list_id
    //                 price_list {
    //                     id
    //                     name
    //                 }
    //                 created_at
    //                 updated_at
    //                 deleted_at
    //                 amount
    //             }
    //         }`,
    //         {
    //             variables: {
    //                 priceSetId: "pset_01JDRNSVPM15DANXFQPK35CEHJ"
    //             }
    //         }
    //     );

    //     console.log('Full GraphQL Response:', JSON.stringify(response, null, 2));

    //     // If the response structure is different, let's send the raw response for now
    //     res.json({
    //         id: "pset_01JDRNSVPM15DANXFQPK35CEHJ",
    //         response: response
    //     });
    // } catch (error) {
    //     res.status(500).json({ error: error.message });
    // }


    //price 2 
    // try {
    //     const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    //     const response = await query.gql(
    //         `query {
    //             product {
    //                 id
    //                 title
    //                 variants {
    //                     id
    //                     title
    //                      price_set {
    //                     id
    //                     prices(where: { OR: [
    //                         { price_list_id: { is: null } },
    //                         { price_list_id: { isNot: null } }
    //                     ]}, includeAll: true) {
    //                         id
    //                         currency_code
    //                         amount
    //                         price_list_id
    //                         min_quantity
    //                         max_quantity
    //                         price_list {
    //                             id
    //                             name
    //                         }
    //                         rules_count
    //                         created_at
    //                         updated_at
    //                         deleted_at
    //                         raw_amount
    //                         }
    //                     }
    //                 }
    //             }
    //         }`
    //     );

    //     res.json({
    //         success: true,
    //         response,

    //     });


    // } catch (error) {
    //     console.error('Error details:', error);
    //     res.status(500).json({
    //         error: error.message,
    //         stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    //     });
    // }

    // try {
    //     const pricingService = req.scope.resolve(Modules.PRICING);
    //     const productService = req.scope.resolve(Modules.PRODUCT);
    //     console.log("Pricing Service:", pricingService);

    //     // Get products with their price relations
    //     const product = await productService.listProductVariants({}, {
    //         relations: ['variants', 'variants.price_set', 'variants.price_set.prices']
    //     })

    //     const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    //     // const response = await query.gql(
    //     //     `query {
    //     //         product {
    //     //             id
    //     //             title
    //     //             variants {
    //     //                 id
    //     //                 title
    //     //                 price_set {
    //     //                     id
    //     //                     prices {
    //     //                         id
    //     //                         currency_code
    //     //                         amount
    //     //                         price_list_id
    //     //                         min_quantity
    //     //                         max_quantity
    //     //                         price_list {
    //     //                             id
    //     //                             name
    //     //                         }
    //     //                         rules_count
    //     //                         created_at
    //     //                         updated_at
    //     //                         deleted_at
    //     //                         raw_amount
    //     //                     }
    //     //                 }
    //     //             }
    //     //         }
    //     //     }`
    //     // );

    //     res.json({
    //         success: true,
    //         product
    //     });
    // } catch (error) {
    //     console.error('Error:', error);
    //     res.status(500).json({ error: error.message });
    // }


    // try {            
    //     const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    //     const response = await query.gql(
    //         `query {
    //             prices(filters: { price_set_id:  "pset_01JDRNSVPM15DANXFQPK35CEHJ"  }) {
    //                 id
    //                 title
    //                 price_set_id
    //                 currency_code
    //                 raw_amount
    //                 rules_count
    //                 created_at
    //                 updated_at
    //                 deleted_at
    //                 price_list_id
    //                 amount
    //                 min_quantity
    //                 max_quantity
    //             }
    //         }`
    //     );

    //     res.json({
    //         success: true,
    //         response,
    //     });

    // } catch (error) {
    //     console.error('Error details:', error);
    //     res.status(500).json({
    //         error: error.message,
    //         stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    //     });
    // }


    //price 3 with reduce

    // try {
    //     const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    //     const response = await query.gql(
    //         `query {
    //             prices(filters: { price_set_id: "pset_01JDRNSVPM15DANXFQPK35CEHJ" }) {
    //                 id
    //                 currency_code
    //                 amount
    //                 price_list_id
    //                 min_quantity
    //                 max_quantity
    //                 price_list {
    //                     id
    //                     name
    //                 }
    //                 rules_count
    //                 created_at
    //                 updated_at
    //                 deleted_at
    //                 raw_amount
    //                 price_set {
    //                     id
    //                     variant {
    //                         id
    //                         title
    //                         product {
    //                             id
    //                             title
    //                         }
    //                     }
    //                 }
    //             }
    //         }`
    //     );

    //     // Organize the response to group all prices under the price_set
    //     const organizedResponse = response.reduce((acc, price) => {
    //         if (!acc.price_set) {
    //             acc.price_set = {
    //                 id: price.price_set.id,
    //                 variant: price.price_set.variant,
    //                 prices: []
    //             };
    //         }
    //         acc.price_set.prices.push({
    //             id: price.id,
    //             currency_code: price.currency_code,
    //             amount: price.amount,
    //             price_list_id: price.price_list_id,
    //             price_list: price.price_list,
    //             min_quantity: price.min_quantity,
    //             max_quantity: price.max_quantity,
    //             rules_count: price.rules_count,
    //             created_at: price.created_at,
    //             updated_at: price.updated_at,
    //             deleted_at: price.deleted_at,
    //             raw_amount: price.raw_amount
    //         });
    //         return acc;
    //     }, {});

    //     res.json({
    //         success: true,
    //         response: [organizedResponse.price_set]
    //     });

    // } catch (error) {
    //     console.error('Error details:', error);
    //     res.status(500).json({
    //         error: error.message,
    //         stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    //     });
    // }
};



