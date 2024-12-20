import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import WishlistModule from "../modules/wishlist";

export default defineLink(ProductModule.linkable.product, {
	linkable: WishlistModule.linkable.wishlistItem,
	deleteCascade: true,
});
