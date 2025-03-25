import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { Merchant } from "@prisma/client";
import { handleApiError, throwApiError } from "@/utils/errors";
import dbClient from "@/utils/db";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { addSeconds } from "date-fns";
import { cookieOptions, serializeCookie } from "@/utils/cookies";

const SESSION_AGE_SECONDS = 60 * 60; // 1 hour

const requestSchema = z.object({
  username: z.string({ required_error: "Username is required" }),
  password: z.string({ required_error: "Password is required" }),
});

export type LoginResponse = {
  merchant: Merchant | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  try {
    const request = requestSchema.parse(req.body);

    const merchant = await dbClient.merchant.findUnique({
      where: { username: request.username },
    });

    if (!merchant) {
      throw throwApiError({
        code: 400,
        message: "Username or password is incorrect",
      });
    }

    const isValid = bcrypt.compare(request.password, merchant.password);

    if (!isValid) {
      throw throwApiError({
        code: 400,
        message: "Username or password is invalid",
      });
    }

    const token = nanoid(32);
    const expires = addSeconds(new Date(), SESSION_AGE_SECONDS);

    // create a session in the db
    await dbClient.session.create({
      data: {
        token,
        merchant: { connect: { id: merchant.id } },
        expires,
      },
    });

    // set response cookies
    const cookieConfig = cookieOptions.sessionToken;
    const cookieHeader = serializeCookie(token, cookieConfig, expires);
    res.setHeader("Set-Cookie", cookieHeader);
    res.json({ merchant });
  } catch (error) {
    handleApiError(error, res);
  }
}
