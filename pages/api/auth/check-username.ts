import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { Merchant } from "@prisma/client";
import { handleApiError } from "@/utils/errors";
import dbClient from "@/utils/db";

const requestSchema = z.object({
  username: z.string({ required_error: "Username is required" }),
});

export type CheckUsernameResponse = {
  merchant: Merchant | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckUsernameResponse>
) {
  try {
    const request = requestSchema.parse(req.query);

    const merchant = await dbClient.merchant.findUnique({
      where: { username: request.username },
    });

    res.json({ merchant });
  } catch (error) {
    handleApiError(error, res);
  }
}
