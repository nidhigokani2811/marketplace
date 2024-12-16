import { MedusaService } from "@medusajs/framework/utils"
import { Wishlist } from "./models/wishlist"
import {
    InjectManager,
    MedusaContext,
} from "@medusajs/framework/utils"
import { EntityManager, SqlEntityManager } from "@mikro-orm/knex"
import { Context } from "@medusajs/framework/types"

interface FilterOptions {
    query?: string
    collection_ids?: string[]
    category_ids?: string[]
    price_range?: { min: number; max: number }
    option_value?: string[][]
    sort_by?: string
    sort_order?: string
    limit?: number
    page?: number,
    avilableStock?: boolean,
    isDiscountAvailable?: boolean,
    region_id?: string
}

class WishlistModuleService extends MedusaService({
    Wishlist,
}) {
    async list(selector: any, config = {}): Promise<any> {
        const wishlists = await super.listWishlists(selector, {
            ...config,
            relations: ["product"],
        })
        return wishlists
    }

    async retrieve(id: string, config = {}): Promise<any> {
        const wishlist = await super.retrieveWishlist(id, {
            ...config,
            relations: ["product"],
        })
        return wishlist
    }
    getFilterWithValueId(input) {
        return input;
    }

    private getCommonCTEs(transformedGroups: string[], regionId: string): string {
        return `
            WITH variant_options AS (
                SELECT 
                    pvo.variant_id,
                    jsonb_agg(
                        jsonb_build_object(
                            'option_id', po.id,
                            'option_title', po.title,
                            'value', pov.value,
                            'option_value_id', pov.id
                        )
                    ) as options
                FROM product_variant_option pvo
                JOIN product_option_value pov ON pvo.option_value_id = pov.id
                JOIN product_option po ON pov.option_id = po.id
                GROUP BY pvo.variant_id
            ),
            option_value_groups AS (
                SELECT 
                    ROW_NUMBER() OVER () as id,
                    value_pairs,
                    array_length(value_pairs, 1) as pair_length
                FROM (
                    VALUES 
                        ${transformedGroups.length > 0
                ? transformedGroups.join(',')
                : '(ARRAY[]::text[])'}                           
                ) AS groups(value_pairs)
            ),
            variants_per_group AS (
                SELECT DISTINCT 
                    pv.id as variant_id
                FROM public.product_variant pv
                LEFT JOIN product_variant_option pvo ON pv.id = pvo.variant_id
                LEFT JOIN product_option_value pov ON pvo.option_value_id = pov.id
                LEFT JOIN product_option po ON pov.option_id = po.id
                CROSS JOIN option_value_groups g
                WHERE 
                    pv.deleted_at IS NULL
                    AND (
                        g.pair_length IS NULL 
                        OR g.pair_length = 0 
                        OR (
                            EXISTS (
                                SELECT 1
                                FROM product_variant_option pvo2
                                JOIN product_option_value pov2 ON pvo2.option_value_id = pov2.id
                                WHERE pvo2.variant_id = pv.id
                                AND LOWER(pov2.value) = ANY(SELECT LOWER(unnest) FROM unnest(g.value_pairs))
                                GROUP BY pvo2.variant_id
                                HAVING COUNT(DISTINCT LOWER(pov2.value)) = g.pair_length
                            )
                        )
                    )
            ),
            filtered_variants AS (
                SELECT DISTINCT variant_id
                FROM variants_per_group
            ),
            region_currency AS (
                SELECT currency_code
                FROM region
                WHERE id = '${regionId}'
                AND deleted_at IS NULL
            ),
            active_prices AS (
                SELECT 
                    pvps.variant_id,
                    price.amount,
                    price.currency_code,
                    price.min_quantity,
                    price.max_quantity,
                    price.price_list_id,
                    price.price_set_id,
                    price.id as price_id,
                    ROW_NUMBER() OVER (
                        PARTITION BY pvps.variant_id, price.currency_code 
                        ORDER BY 
                            CASE 
                                WHEN pl.starts_at <= CURRENT_TIMESTAMP 
                                AND (pl.ends_at IS NULL OR pl.ends_at > CURRENT_TIMESTAMP)
                                THEN 0 
                                ELSE 1 
                            END,
                            price.amount
                    ) as price_rank
                FROM product_variant_price_set pvps
                JOIN price_set ps ON pvps.price_set_id = ps.id 
                JOIN price ON ps.id = price.price_set_id
                LEFT JOIN price_list pl ON price.price_list_id = pl.id
                JOIN region_currency rc ON price.currency_code = rc.currency_code
                WHERE pvps.deleted_at IS NULL
                AND price.deleted_at IS NULL
                AND ps.deleted_at IS NULL
                AND (
                    (pl.id IS NOT NULL
                    AND pl.status = 'active'
                    AND pl.starts_at <= CURRENT_TIMESTAMP
                    AND (pl.ends_at IS NULL OR pl.ends_at > CURRENT_TIMESTAMP))
                    OR 
                    pl.id IS NULL
                )
            ),

            variant_prices AS (
                SELECT 
                    variant_id,
                    jsonb_build_object(
                        'amount', amount,
                        'currency_code', currency_code,
                        'min_quantity', min_quantity,
                        'max_quantity', max_quantity,
                        'price_list_id', price_list_id,
                        'price_id', price_id,
                        'original_price', 
                        CASE 
                            WHEN price_list_id IS NOT NULL THEN (
                                SELECT 
                                jsonb_build_object(
                                'amount',po.amount,
                                'price_id', po.id,
                                'currency_code', po.currency_code,
                                'min_quantity', po.min_quantity,
                                'max_quantity', po.max_quantity)
                                FROM price po
                                WHERE po.price_set_id = active_prices.price_set_id 
                                AND po.price_list_id IS NULL
                                AND po.deleted_at IS NULL
                                AND po.currency_code = active_prices.currency_code
                                LIMIT 1
                            )
                            ELSE null
                        END,
                        'is_discount_available',
                        CASE 
                            WHEN active_prices.amount < (
                                SELECT po.amount
                                FROM price po
                                WHERE po.price_set_id = active_prices.price_set_id 
                                    AND po.price_list_id IS NULL
                                    AND po.deleted_at IS NULL
                                    AND po.currency_code = active_prices.currency_code
                                LIMIT 1
                            ) THEN true
                            ELSE false
                        END
                    ) as price
                FROM active_prices
                WHERE price_rank = 1
            ),
            price_extremes AS (
                SELECT 
                    pv.product_id,
                    MIN((vp.price->>'amount')::numeric) as min_price,
                    MAX((vp.price->>'amount')::numeric) as max_price
                FROM public.product_variant pv
                JOIN variant_prices vp ON pv.id = vp.variant_id
                GROUP BY pv.product_id
            ),
            variant_inventory AS (
                SELECT 
                    pvii.variant_id,
                    SUM(il.stocked_quantity - il.reserved_quantity) AS total_available_inventory
                FROM public.product_variant_inventory_item pvii
                JOIN inventory_level il ON pvii.inventory_item_id = il.inventory_item_id
                WHERE il.deleted_at IS NULL
                GROUP BY pvii.variant_id
            ),
            product_variant_counts AS (
                SELECT 
                    p.id AS product_id,
                    COUNT(DISTINCT pv.id) AS variant_count,
                    COUNT(DISTINCT CASE WHEN vi.total_available_inventory > 0 THEN pv.id END) AS available_variant_count
                FROM public.product p
                LEFT JOIN public.product_variant pv ON p.id = pv.product_id AND pv.deleted_at IS NULL
                LEFT JOIN variant_inventory vi ON pv.id = vi.variant_id
                GROUP BY p.id
            )`
    }

    private getWhereConditions(
        query?: string,
        collectionIds?: string[],
        categoryIds?: string[],
        minPrice?: number,
        maxPrice?: number,
        avilableStock?: boolean,
        isDiscountAvailable?: boolean,
    ): string {

        return `
            p.deleted_at IS NULL
            ${query ? `AND (p.title ILIKE '%${query}%' OR p.description ILIKE '%${query}%')` : ''}
            ${collectionIds?.length ? `AND (p.collection_id = ANY(ARRAY[${collectionIds.map(id => `'${id}'`).join(',')}]))` : ''}
            ${categoryIds?.length ? `AND (pcp.product_category_id = ANY(ARRAY[${categoryIds.map(id => `'${id}'`).join(',')}]))` : ''}
            ${(minPrice !== undefined && maxPrice !== undefined)
                ? `AND EXISTS (
                    SELECT 1 
                    FROM variant_prices vp2 
                    WHERE vp2.variant_id = pv.id 
                    AND (vp2.price->>'amount')::numeric BETWEEN ${minPrice} AND ${maxPrice}
                )`
                : ''
            }
            ${avilableStock ? 'AND pvc.available_variant_count > 0' : ''}
            ${isDiscountAvailable ? 'AND (price->>\'is_discount_available\')::boolean = true' : ''}`
    }

    private getCommonJoins(): string {
        return `
            public.product p
            LEFT JOIN public.product_variant pv ON p.id = pv.product_id AND pv.deleted_at IS NULL
            LEFT JOIN product_variant_counts pvc ON p.id = pvc.product_id
            LEFT JOIN variant_inventory vi ON pv.id = vi.variant_id
            INNER JOIN filtered_variants fv ON pv.id = fv.variant_id
            LEFT JOIN variant_options vo ON pv.id = vo.variant_id
            LEFT JOIN variant_prices vp ON pv.id = vp.variant_id
            LEFT JOIN public.product_category_product pcp ON p.id = pcp.product_id
            LEFT JOIN price_extremes pe ON p.id = pe.product_id`
    }

    @InjectManager()
    async getFilterWithValue(
        filters: FilterOptions,
        @MedusaContext() sharedContext?: Context<SqlEntityManager>
    ): Promise<any> {
        if (!sharedContext?.manager) {
            throw new Error("Shared context or manager is undefined.")
        }

        const query = filters?.query
        const collectionIds = filters?.collection_ids
        const categoryIds = filters?.category_ids
        const minPrice = filters?.price_range?.min
        const maxPrice = filters?.price_range?.max
        const optionValue = filters?.option_value || []
        const regionId = filters?.region_id
        const transformedGroups = optionValue.map((group) => {
            const parsedGroup = JSON.parse(group as unknown as string)
            return `(ARRAY[${parsedGroup.map(option => `'${option}'`).join(', ')}])`
        })


        let sortBy = filters?.sort_by?.toLowerCase() === 'price' ||
            filters?.sort_by?.toLowerCase() === 'updated_at'
            ? filters.sort_by
            : 'updated_at'

        let sortOrder = filters?.sort_order?.toUpperCase() === 'ASC' ||
            filters?.sort_order?.toUpperCase() === 'DESC'
            ? filters.sort_order
            : 'DESC'

        const page = filters?.page || 1
        const limit = filters?.limit || 10
        const offset = (page - 1) * limit
        const avilableStock = filters?.avilableStock || false
        const isDiscountAvailable = filters?.isDiscountAvailable || false
        try {
            const [count, products] = await Promise.all([
                sharedContext.manager.execute(`
                    ${this.getCommonCTEs(transformedGroups, regionId)}
                    SELECT COUNT(*) FROM (
                        SELECT 
                            p.id as product_id
                        FROM 
                            ${this.getCommonJoins()}
                        WHERE 
                            ${this.getWhereConditions(query, collectionIds, categoryIds, minPrice, maxPrice, avilableStock, isDiscountAvailable)}
                        GROUP BY 
                            p.id, p.title, p.description, p.status, p.updated_at, pe.max_price, p.collection_id
                    ) as count`),
                sharedContext.manager.execute(`
                    ${this.getCommonCTEs(transformedGroups, regionId)}
                    SELECT 
                        p.id as product_id,
                        p.title as product_title,
                        p.description,
                        p.status,
                        p.updated_at,
                        pe.max_price,   
                        p.created_at,
                        p.thumbnail,
                        p.handle,
                        p.discountable,
                        p.collection_id,    
                        p.weight,
                        p.length,
                        p.height,
                        p.width,
                        STRING_AGG(DISTINCT pcp.product_category_id, ',') as product_category_ids,
                        jsonb_agg(
                            ${avilableStock ? `CASE 
                                WHEN vi.total_available_inventory > 0 THEN` : ''}
                                    jsonb_build_object(
                                        'variant_id', pv.id,
                                        'title', pv.title,
                                        'sku', pv.sku,
                                        'allow_backorder', pv.allow_backorder,
                                        'manage_inventory', pv.manage_inventory,
                                        'origin_country', pv.origin_country,
                                        'height', pv.height,
                                        'width', pv.width,
                                        'material', pv.material,
                                        'weight', pv.weight,
                                        'length', pv.length,
                                        'metadata', pv.metadata,
                                        'variant_rank', pv.variant_rank,
                                        'options', COALESCE(vo.options, '[]'::jsonb),
                                        'price', COALESCE(vp.price, '{}'::jsonb),
                                        'inventory', COALESCE(vi.total_available_inventory, 0)
                                    )
                            ${avilableStock ? 'ELSE NULL' : ''}
                        ${avilableStock ? 'END' : ''}
                        ) ${avilableStock ? 'FILTER (WHERE vi.total_available_inventory > 0)' : ''} as variants
                    FROM 
                        ${this.getCommonJoins()}
                    WHERE 
                        ${this.getWhereConditions(query, collectionIds, categoryIds, minPrice, maxPrice, avilableStock, isDiscountAvailable)}
                    GROUP BY 
                        p.id, p.title, p.description, p.status, p.updated_at, pe.max_price, p.collection_id
                    ORDER BY 
                        ${sortBy === 'price' ? 'pe.max_price' : 'p.updated_at'} ${sortOrder} NULLS LAST
                    LIMIT ${limit} OFFSET ${offset}`)
            ])

            return {
                products,
                page,
                limit,
                count: Number(count[0].count)
            }
        } catch (error) {
            console.error("Error in getFilterWithValue:", error)
            throw error
        }
    }
}

export default WishlistModuleService