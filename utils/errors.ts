import { NextApiResponse } from "next";
import { writeLog } from "./logger";

const defaultError =
  "An unexpected error occurred. Please try again after some time";

export function handleApiError(error: unknown, res: NextApiResponse) {
  let message = defaultError;
  let code = 500;

  if (error as { message: string }) {
    message = (error as { message: string }).message;
  }

  if (error as { code: number }) {
    code = (error as { code: number }).code;
  }

  writeLog(error);

  res.status(code).json({ message });
}

export type APIError = {
  message: string;
  code: number;
};

export function throwApiError(error: APIError) {
  throw error;
}
