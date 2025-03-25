import { BareFetcher } from "swr";

export const swrFetcher: BareFetcher<unknown> = (resource, init) => {
  let url: string;
  if (Array.isArray(resource)) {
    url = resource[0];
  } else {
    url = resource;
  }

  return fetch(url, init).then(async (res) => {
    const isJson = Boolean(
      res.headers.get("Content-Type")?.includes("application/json")
    );

    const body = isJson ? await res.json() : res.body;

    if (res.ok) {
      return body;
    } else {
      throw body;
    }
  });
};
