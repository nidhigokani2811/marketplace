type ProductData = {
  id: string;
  title: string;
  handle: string;
  description: string;
  variants: Variant[];
  tags: string[];
  type: string;
  collection: string[];
  categories: string[];
  //TODO: add brand
  // brand?: string;
};

type Variant = {
  id: string;
  title: string;
  prices: Price[];
  options: Option[];
};

type Price = {
  amount: number;
  currency_code: string;
};

type Option = {
  id: string;
  value: string;
};

export function transformProductData(inputData: any): ProductData | null {
  try {
    const transformedData: ProductData = {
      id: inputData.id || "",
      title: inputData.title || "",
      handle: inputData.handle || "",
      description: inputData.description || "",
      tags: Array.isArray(inputData.tags)
        ? inputData.tags.map((tag: any) => tag.value || "")
        : [],
      type: inputData.type ? inputData.type.value : "",
      collection: Array.isArray(inputData.collection)
        ? inputData.collection.map((collection: any) => collection.title)
        : [inputData.collection.title ? inputData.collection.title : ""],
      categories: Array.isArray(inputData.categories)
        ? inputData.categories.map((category: any) => category.name)
        : [],
      variants: Array.isArray(inputData.variants)
        ? inputData.variants.map((variant: any) => variant.title || "")
        : [],
      // TODO: add brand
      // brand: inputData.brand || "",
    };
    return transformedData;
  } catch (error) {
    console.error("Error transforming data:", error);
    return null;
  }
}
