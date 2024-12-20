import {
  createProductsWorkflow,
  deleteProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import { StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { LinkDefinition } from "@medusajs/framework/types";
import { BRAND_MODULE } from "../../modules/brand";
import BrandModuleService from "../../modules/brand/service";

createProductsWorkflow.hooks.productsCreated(
  async ({ products, additional_data }, { container }) => {
    if (!additional_data?.brand_id) {
      return new StepResponse([], []);
    }

    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE);
    // if the brand doesn't exist, an error is thrown.
    await brandModuleService.retrieveBrand(additional_data.brand_id as string);

    // TODO link brand to product
    const remoteLink = container.resolve("remoteLink");
    const logger = container.resolve("logger");

    const links: LinkDefinition[] = [];

    for (const product of products) {
      links.push({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [BRAND_MODULE]: {
          brand_id: additional_data.brand_id,
        },
      });
    }

    await remoteLink.create(links);

    logger.info("Linked brand to products");

    return new StepResponse(links, links);
  }
);

updateProductsWorkflow.hooks.productsUpdated(
  async ({ products, additional_data }, { container }) => {
    if (!additional_data?.brand_id) {
      return new StepResponse([], []);
    }

    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE);
    await brandModuleService.retrieveBrand(additional_data.brand_id as string);

    const remoteLink = container.resolve("remoteLink");
    const logger = container.resolve("logger");

    const links: LinkDefinition[] = [];
    await remoteLink.delete({
      [Modules.PRODUCT]: {
        product_id: products.map((product) => product.id),
      },
    });

    for (const product of products) {
      links.push({
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [BRAND_MODULE]: {
          brand_id: additional_data.brand_id,
        },
      });
    }

    await remoteLink.create(links);

    logger.info("Linked brand to products");

    return new StepResponse(links, links);
  }
);

deleteProductsWorkflow.hooks.productsDeleted(async ({ ids }, { container }) => {
  const remoteLink = container.resolve("remoteLink");
  ids.forEach(async (id) => {
    const res = await remoteLink.delete({
      [Modules.PRODUCT]: {
        product_id: id,
      },
    });
  });

  return new StepResponse([]);
});
