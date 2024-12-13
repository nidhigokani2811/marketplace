// import { ContainerRegistrationKeys, isPresent } from "@medusajs/framework/utils";
// import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
// import { UnitOfWork } from "@mikro-orm/core";

// export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
//     try {
//         const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
//         const searchTerm = req.query.q as string;
//         const collectionId = req.query.collection_id as string;
//         const sortBy = (req.query.sortBy as string || 'updated_at');
//         const currencyCode = (req.query.currency_code as string || 'usd').toLowerCase();

//         console.log('🔍 Raw query params:', req.query);

//         // Extract category IDs from array format
//         const categoryIds = Array.isArray(req.query.category_id)
//             ? req.query.category_id
//             : req.query.category_id
//                 ? [req.query.category_id]
//                 : [];

//         console.log('📦 Extracted categoryIds:', categoryIds);

//         // Build base filters
//         let filters: any = {
//             deleted_at: null
//         };

//         // Add search term filter if provided
//         if (searchTerm) {
//             filters.$or = [
//                 { title: { $ilike: `%${searchTerm}%` } },
//                 { description: { $ilike: `%${searchTerm}%` } }
//             ];
//         }

//         // Add category filter if categories are provided
//         if (categoryIds.length > 0) {
//             filters = {
//                 ...filters,
//                 categories: {
//                     id: { $in: categoryIds }
//                 }
//             };
//         }
//         if (collectionId) {
//             filters = {
//                 ...filters,
//                 collection: {
//                     id: collectionId
//                 }
//             };
//         }

//         console.log('🎯 Applied filters:', JSON.stringify(filters, null, 2));

//         const { data: products, metadata } = await query.graph({
//             entity: "product",
//             fields: [
//                 "*",
//                 "variants.*",
//                 "variants.price_set.*",
//                 "variants.price_set.prices.*",
//                 "categories.id",
//                 "variants.options.*"
//             ],
//             filters,
//             pagination: {
//                 skip: 0,
//                 take: 10
//             }
//         });

//         // Custom sorting logic
//         let sortedProducts = [...products];

//         switch (sortBy) {
//             case 'price_asc':
//                 sortedProducts.sort((a, b) => {
//                     const priceA = getLowestPrice(a.variants, currencyCode);
//                     const priceB = getLowestPrice(b.variants, currencyCode);
//                     return priceA - priceB;
//                 });
//                 break;
//             case 'price_desc':
//                 sortedProducts.sort((a, b) => {
//                     const priceA = getLowestPrice(a.variants, currencyCode);
//                     const priceB = getLowestPrice(b.variants, currencyCode);
//                     return priceB - priceA;
//                 });
//                 break;
//             case 'updated_at_desc':
//                 sortedProducts.sort((a, b) => {
//                     return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
//                 });
//                 break;
//             case 'updated_at_asc':
//                 sortedProducts.sort((a, b) => {
//                     return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
//                 });
//                 break;
//             default:
//                 sortedProducts.sort((a, b) => {
//                     return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
//                 });
//         }

//         res.json({
//             products: sortedProducts,
//             count: metadata.count,
//             offset: metadata.skip,
//             limit: metadata.take,
//         });
//     } catch (error) {
//         console.log('error', error);
//         res.status(500).json({ error: error.message });
//     }
// }

// function getLowestPrice(variants: any[], currencyCode: string): number {
//     let lowestPrice = Number.MAX_VALUE;

//     variants.forEach(variant => {
//         const prices = variant.price_set?.prices || [];
//         prices.forEach(price => {
//             if (price.currency_code === currencyCode) {
//                 const amount = parseFloat(price.amount);
//                 if (amount < lowestPrice) {
//                     lowestPrice = amount;
//                 }
//             }
//         });
//     });

//     return lowestPrice === Number.MAX_VALUE ? 0 : lowestPrice;
// }
