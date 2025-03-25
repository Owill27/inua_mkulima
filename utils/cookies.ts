const baseCookieName = "cck";
const isDev = process.env.NODE_ENV === "development";

const useSecureCookies = !isDev;
let sessionCookieName = `${baseCookieName}.sesc`;

if (useSecureCookies) {
  sessionCookieName = "__Secure-" + sessionCookieName;
}

type CookieOption = {
  name: string;
  HttpOnly: boolean;
  Path: string;
  Secure: boolean;
  SameSite: "Strict" | "Lax" | "None" | "Secure";
};

const cookieOptions = {
  sessionToken: {
    name: sessionCookieName,
    HttpOnly: true,
    SameSite: "Lax",
    Path: "/",
    Secure: useSecureCookies,
  },
} satisfies Record<string, CookieOption>;

export function serializeCookie(
  value: string,
  options: CookieOption,
  expires: Date
) {
  const { name, ...rest } = options;

  const str = Object.entries({
    [name]: value,
    Expires: expires.toUTCString(),
    ...rest,
  })
    .map(([key, value]) => {
      if (typeof value === "boolean") {
        if (value) {
          return key;
        } else {
          return "";
        }
      } else {
        return `${key}=${value}`;
      }
    })
    .join("; ");

  return str;
}

export { useSecureCookies, sessionCookieName, cookieOptions };
