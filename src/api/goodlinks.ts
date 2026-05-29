import { getPreferenceValues } from "@raycast/api";

class GoodLinksError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoodLinksError";
  }
}

function getApiConfig(): { baseUrl: string; token: string } {
  const prefs = getPreferenceValues<Preferences>();
  const token = prefs.goodlinksApiToken?.trim();
  if (!token) {
    throw new GoodLinksError("GoodLinks API token not configured. Set it in Raycast preferences.");
  }
  const baseUrl = prefs.goodlinksApiUrl?.trim() || "http://localhost:9428";
  return { baseUrl, token };
}

export function hasGoodlinksToken(): boolean {
  const prefs = getPreferenceValues<Preferences>();
  return !!prefs.goodlinksApiToken?.trim();
}

export async function saveToGoodlinks(params: {
  url: string;
  title?: string;
  summary?: string;
  tags?: string[];
  read?: boolean;
  starred?: boolean;
}): Promise<{ id: string }> {
  const { baseUrl, token } = getApiConfig();

  const body: Record<string, unknown> = { url: params.url };
  if (params.title) body.title = params.title;
  if (params.summary) body.summary = params.summary;
  if (params.tags && params.tags.length > 0) body.tags = params.tags;
  if (params.read !== undefined) body.read = params.read;
  if (params.starred !== undefined) body.starred = params.starred;

  const response = await fetch(`${baseUrl}/api/v1/links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new GoodLinksError("GoodLinks authentication failed. Check your API token in Raycast preferences.");
    }
    const text = await response.text().catch(() => "");
    throw new GoodLinksError(`Failed to save to GoodLinks (${response.status}): ${text || response.statusText}`);
  }

  const data = (await response.json()) as { id: string };
  return data;
}

export async function getTags(): Promise<string[]> {
  const { baseUrl, token } = getApiConfig();

  const response = await fetch(`${baseUrl}/api/v1/tags`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as string[];
}

export { GoodLinksError };
