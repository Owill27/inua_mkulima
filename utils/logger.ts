import { writeFileSync } from "fs";

const LOG_FILE = "logs.txt";

export function writeLog(log: unknown) {
  const now = new Date().toISOString();
  const logLine = `${now}: ${JSON.stringify(log)}`;
  writeFileSync(LOG_FILE, logLine);
}
