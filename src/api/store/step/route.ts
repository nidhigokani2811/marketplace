// import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
// import { EntityManager } from "typeorm";
// import { ProductService } from "@medusajs/medusa/dist/services";

// export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
//     const productService: ProductService = req.scope.resolve("productService");
//     const manager: EntityManager = productService.manager_;

//     try {
//         const searchTerm = req.query.q as string;
//         const collectionIds = Array.isArray(req.query.collection_id)
//             ? req.query.collection_id
//             : req.query.collection_id ? [req.query.collection_id] : [];
//         const categoryIds = Array.isArray(req.query.category_id)
//             ? req.query.category_id
//             : req.query.category_id ? [req.query.category_id] : [];
//         const optionValueIds = Array.isArray(req.query.option_values)
//             ? req.query.option_values
//             : req.query.option_values ? [req.query.option_values] : [];
//         const regionId = req.query.region_id as string;
//         const priceRange = {
//             min: Number(req.query.price_min) || 0,
//             max: Number(req.query.price_max) || Number.MAX_VALUE
//         };

//         // Execute the raw query using the manager
//         const products = await manager.query(`
//             WITH variant_options AS (
//                 // ... rest of your SQL query ...
//             )
//         `, [
//             optionValueIds,
//             regionId,
//             priceRange.min,
//             priceRange.max,
//             searchTerm ? `%${searchTerm}%` : null,
//             collectionIds.length ? collectionIds : null,
//             categoryIds.length ? categoryIds : null
//         ].filter(param => param !== null));

//         res.json({
//             products,
//             count: products.length
//         });
//     } catch (error) {
//         console.error('Error in product filter:', error);
//         res.status(500).json({ error: error.message });
//     }
// }