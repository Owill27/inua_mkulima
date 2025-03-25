import dbClient from "@/utils/db";
import { handleApiError } from "@/utils/errors";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const productsSelect = {
  id: true,
  name: true,
  price: true,
  subsidyPercent: true,
  quantity: true,
  createdAt: true,
} satisfies Prisma.ProductSelect;

type ProductsAPIItem = Prisma.ProductGetPayload<{
  select: typeof productsSelect;
}>;

export type ProductsAPIReturn = ProductsAPIItem[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProductsAPIReturn>
) {
  try {
    const products = await dbClient.product.findMany({
      select: productsSelect,
    });
    res.json(products);
  } catch (error) {
    handleApiError(error, res);
  }
}
