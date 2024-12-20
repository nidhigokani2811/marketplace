import { defineMiddlewares } from "@medusajs/medusa";
import { authMiddleware } from "./middlewares/auth";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/wishlist",
      method: "GET",
      middlewares: [authMiddleware],
    },
    {
      matcher: "/store/wishlist",
      method: "POST",
      middlewares: [authMiddleware],
    },
  ],
});
