import {
  cookieOptions,
  serializeCookie,
  sessionCookieName,
} from "@/utils/cookies";
import dbClient from "@/utils/db";
import { handleApiError } from "@/utils/errors";
import { subSeconds } from "date-fns";
import { NextApiHandler } from "next";

const logout: NextApiHandler = async (req, res) => {
  try {
    const sessionToken = req.cookies[sessionCookieName];

    if (!sessionToken) {
      res.redirect("/");
      return;
    }

    // take expiry back, auto deletes cookie on frontend
    const newExpiry = subSeconds(new Date(), 1);
    await dbClient.session.delete({
      where: { token: sessionToken },
    });

    // set response cookies
    const cookieConfig = cookieOptions.sessionToken;
    const cookieHeader = serializeCookie(sessionToken, cookieConfig, newExpiry);
    res.setHeader("Set-Cookie", cookieHeader);
    res.redirect("/");
  } catch (error) {
    handleApiError(error, res);
  }
};

export default logout;
