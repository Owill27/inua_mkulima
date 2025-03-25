import { getApiSession } from "@/utils/auth";
import { handleApiError } from "@/utils/errors";
import { NextApiRequest, NextApiResponse } from "next";

export default async function logged(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getApiSession(req);
    res.json(session?.merchant);
  } catch (error) {
    handleApiError(error, res);
  }
}
