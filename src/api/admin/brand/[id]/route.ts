import brand, { BRAND_MODULE } from "src/modules/brand";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import BrandModuleService from "src/modules/brand/service";

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
	const brandModuleService: BrandModuleService =
		req.scope.resolve(BRAND_MODULE);
	const { id } = req.params;

	const query = req.scope.resolve("query");
	const { data: brands } = await query.graph({
		entity: "brand",
		fields: ["*", "products.*"],
		filters: {
			id: id,
		},
	});
	if (!brands) {
		throw new Error("Brand not found");
	}

	if (brands[0].products && brands[0].products.length > 0) {
		return res
			.status(400)
			.send({ error: "Brand is associated with products. Cannot delete." });
	}

	await brandModuleService.deleteBrands(id);
	const brandDeleted = await brandModuleService.listBrands();
	res.send({ brand: brandDeleted });
};

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
	const brandModuleService: BrandModuleService =
		req.scope.resolve(BRAND_MODULE);
	const { id } = req.params;
	if (!id) {
		return res.status(400).send({ error: "Brand ID is required." });
	}
	if (
		typeof req.body !== "object" ||
		req.body === null ||
		!req.body.hasOwnProperty("name")
	) {
		return res
			.status(400)
			.send({ error: "Invalid request body. 'name' property is required." });
	}
	const { name } = req.body as { name: string };
	const brand = await brandModuleService.updateBrands({ id, name });

	res.send({ brand });
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const { id } = req.params;
	const query = req.scope.resolve("query");

	const { data: brands } = await query.graph({
		entity: "brand",
		fields: ["*", "products.*"],
		filters: {
			id: id,
		},
	});
	if (!brands) {
		throw new Error("Brand not found");
	}
	res.send(brands[0]);
};
