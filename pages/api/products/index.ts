import dbClient from "@/utils/db";
import { handleApiError } from "@/utils/errors";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const products = await dbClient.product.findMany();
    res.json(products);
  } catch (error) {
    handleApiError(error, res);
  }
}
