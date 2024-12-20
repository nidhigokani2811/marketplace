import { defineLink } from "@medusajs/framework/utils";
import WishlistModule from "../modules/wishlist";
import CustomerModule from "@medusajs/medusa/customer";

export default defineLink(CustomerModule.linkable.customer, {
	linkable: WishlistModule.linkable.wishlist,
	deleteCascade: true,
});
