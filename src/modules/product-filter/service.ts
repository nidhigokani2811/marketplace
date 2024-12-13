import { Context } from "@medusajs/framework/types";
import { InjectManager, MedusaContext } from "@medusajs/framework/utils";
import { SqlEntityManager } from "@mikro-orm/knex";

class HelloModuleService {
    /**
     * This method uses dependency injection to access the shared context and the database manager.
     * The `@InjectManager` decorator ensures that the transaction manager is injected automatically.
     * 
     * @param sharedContext - Optional Medusa context containing the SqlEntityManager
     * @returns The count of records in the "wishlist" table
     */
    @InjectManager()
    async getCount(
        @MedusaContext() sharedContext?: Context<SqlEntityManager>
    ): Promise<number> {
        if (!sharedContext || !sharedContext.manager) {
            throw new Error("Shared context or manager is undefined.");
        }

        console.log("🚀 ~ getCount ~ sharedContext:", sharedContext);
        console.log("🚀 ~ getCount ~ sharedContext.manager:", sharedContext.manager);

        try {
            // Example: Count rows in the "wishlist" table
            const count = await sharedContext.manager.count("wishlist");
            console.log("🚀 ~ getCount ~ wishlist count:", count);
            return count;
        } catch (error) {
            console.error("Error in getCount:", error);
            throw error;
        }
    }
}

export default HelloModuleService;