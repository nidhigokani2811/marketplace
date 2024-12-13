// import {
//     defineMiddlewares,
//     validateAndTransformBody,
// } from "@medusajs/framework/http"
// import { PostAdminCreateBrand } from "./validator"

// export default defineMiddlewares({
//     routes: [
//         {
//             matcher: "/store/brand",
//             method: "POST",
//             middlewares: [
//                 validateAndTransformBody(PostAdminCreateBrand),
//             ],
//         },
//     ],
// })