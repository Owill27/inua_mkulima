import { Merchant, Session } from "@prisma/client";
import { NextApiRequest } from "next";
import { sessionCookieName } from "./cookies";
import dbClient from "./db";
import { throwApiError } from "./errors";
import { isPast } from "date-fns";

type SessionAndMerchant = Session & {
  merchant: Merchant;
};

export async function getApiSession(
  req: NextApiRequest
): Promise<SessionAndMerchant | null> {
  const token = req.cookies[sessionCookieName];
  if (!token) return null;

  const session = await dbClient.session.findUnique({
    where: { token },
    include: { merchant: true },
  });

  // honor session expiry on read
  if (session && isPast(session?.expires)) {
    return null;
  }

  return session;
}

// cancel action if user is not logged in
export async function getApiSessionOrTerminate(req: NextApiRequest) {
  const session = await getApiSession(req);
  if (!session) {
    throw throwApiError({
      code: 401,
      message: "You are not authorized",
    });
  }

  return session;
}
