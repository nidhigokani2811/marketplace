import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createBrandWorkflow } from "../../../workflows/create-brand";

type PostAdminCreateBrandType = {
  name: string;
};

export const POST = async (
  req: MedusaRequest<PostAdminCreateBrandType>,
  res: MedusaResponse
) => {
  console.log("req.validatedBody:::", req.body.name);

  const { result } = await createBrandWorkflow(req.scope).run({
    input: req.body,
  });

  res.json({ brand: result });
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  console.log("req.query:::", req.query);
  const query = req.scope.resolve("query");

  const { data: brands } = await query.graph({
    entity: "brand",
    fields: ["*", "products.*"],
  });

  res.json({ brands });
};
