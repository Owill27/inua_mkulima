import { getApiSessionOrTerminate } from "@/utils/auth";
import dbClient from "@/utils/db";
import { handleApiError, throwApiError } from "@/utils/errors";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const requestSchema = z.object({
  products: z.array(
    z.object({
      productId: z.string({ required_error: "Product ID is required" }),
      quantity: z
        .number({ required_error: "Quantity is required" })
        .min(1, "Minimum quantity is 1"),
    })
  ),
  farmerId: z.string({ required_error: "Farmer ID is required" }),
});

export type PurchaseRequest = z.infer<typeof requestSchema>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { merchant } = await getApiSessionOrTerminate(req);

    const request = requestSchema.parse(req.body);
    const prodIds = request.products.map((p) => p.productId);

    const [farmer, products] = await dbClient.$transaction([
      dbClient.farmer.findFirst({ where: { id: request.farmerId } }),
      dbClient.product.findMany({
        where: { id: { in: prodIds } },
      }),
    ]);

    if (!farmer) {
      throw throwApiError({ code: 400, message: "Farmer not found" });
    }

    // verify all products are in the catalog
    if (!products.length || products.length < prodIds.length) {
      throw throwApiError({
        code: 400,
        message: "Invalid products selections",
      });
    }

    // make sure there is enough quantity for each
    const notEnough = products.filter((dbP) => {
      const input = request.products.filter((p) => p.productId === dbP.id)[0];

      if (dbP.quantity < input.quantity) {
        return true;
      } else {
        return false;
      }
    });

    if (notEnough.length) {
      throw throwApiError({
        code: 400,
        message: "Not enough product quantities to satisfy transaction",
      });
    }

    const consolidated = products.map((dbP) => {
      const input = request.products.filter((p) => p.productId === dbP.id)[0];
      const totalPrice = dbP.price * input.quantity;
      const deduction = totalPrice * (dbP.subsidyPercent / 100);

      return {
        id: dbP.id,
        totalPrice,
        deduction,
        quantity: input.quantity,
      };
    });

    const totalPrice = consolidated.reduce(
      (sum, curr) => sum + curr.totalPrice,
      0
    );
    const totalDeduction = consolidated.reduce(
      (sum, curr) => sum + curr.deduction,
      0
    );

    if (merchant.balance < totalDeduction) {
      throw throwApiError({
        code: 400,
        message: "Not enough wallet balance to complete transaction",
      });
    }

    const trans = await dbClient.transaction.create({
      data: {
        farmer: { connect: { id: farmer.id } },
        merchant: { connect: { id: merchant.id } },
        totalAmount: totalPrice,
        totalDeduction,
        products: {
          createMany: {
            data: consolidated.map((c) => ({
              productId: c.id,
              quantity: c.quantity,
            })),
          },
        },
      },
    });

    res.json(trans);
  } catch (error) {
    handleApiError(error, res);
  }
}
