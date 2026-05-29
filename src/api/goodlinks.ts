import { open } from "@raycast/api";

class GoodLinksError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoodLinksError";
  }
}

export async function saveToGoodlinks(params: { url: string; title?: string }): Promise<void> {
  const encodedUrl = encodeURIComponent(params.url);
  let schemeUrl = `goodlinks://save?url=${encodedUrl}`;
  if (params.title) {
    schemeUrl += `&title=${encodeURIComponent(params.title)}`;
  }

  try {
    await open(schemeUrl);
  } catch {
    throw new GoodLinksError("Failed to open GoodLinks. Make sure GoodLinks is installed.");
  }
}

export { GoodLinksError };
