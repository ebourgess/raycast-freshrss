import { getPreferenceValues } from "@raycast/api";
import type {
  FreshRSSPreferences,
  Feed,
  Article,
  FreshRSSSubscriptionListResponse,
  FreshRSSSubscription,
  FreshRSSQuickAddResponse,
  FreshRSSStreamContentsResponse,
  FreshRSSStreamItem,
} from "./types";

let cachedAuthToken: string | null = null;
let cachedWriteToken: string | null = null;

function getPreferences(): FreshRSSPreferences {
  return getPreferenceValues<FreshRSSPreferences>();
}

function normalizeBaseUrl(url: string): string {
  let normalized = url.trim();
  while (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `https://${normalized}`;
  }
  return normalized;
}

function getApiBaseUrl(): string {
  const prefs = getPreferences();
  return `${normalizeBaseUrl(prefs.baseUrl)}/api/greader.php`;
}

class FreshRSSAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FreshRSSAuthError";
  }
}

class FreshRSSApiError extends Error {
  public readonly statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "FreshRSSApiError";
    this.statusCode = statusCode;
  }
}

async function request(
  path: string,
  options: {
    method?: string;
    params?: Record<string, string>;
    body?: string;
    requireAuth?: boolean;
    requireWriteToken?: boolean;
  } = {}
): Promise<string> {
  const {
    method = "GET",
    params = {},
    body,
    requireAuth = true,
    requireWriteToken = false,
  } = options;

  const prefs = getPreferences();

  if (!prefs.baseUrl?.trim()) {
    throw new FreshRSSAuthError("Base URL is not configured. Set it in Raycast preferences.");
  }
  if (!prefs.username?.trim()) {
    throw new FreshRSSAuthError("Username is not configured. Set it in Raycast preferences.");
  }
  if (!prefs.apiPassword?.trim()) {
    throw new FreshRSSAuthError("API password is not configured. Set it in Raycast preferences.");
  }

  let authToken = "";
  if (requireAuth) {
    authToken = await login();
  }

  let writeToken = "";
  if (requireWriteToken) {
    writeToken = await getToken();
  }

  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}${path}`);

  if (method === "GET") {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const headers: Record<string, string> = {};
  if (authToken) {
    headers["Authorization"] = `GoogleLogin auth=${authToken}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (method === "POST") {
    if (body) {
      fetchOptions.body = body;
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    } else if (requireWriteToken) {
      const formBodyParts: string[] = [];
      if (writeToken) {
        formBodyParts.push(`T=${encodeURIComponent(writeToken)}`);
      }
      for (const [key, value] of Object.entries(params)) {
        formBodyParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
      fetchOptions.body = formBodyParts.join("&");
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), fetchOptions);
  } catch {
    throw new FreshRSSApiError(
      `Network error: Unable to connect to FreshRSS at ${normalizeBaseUrl(prefs.baseUrl)}. ` +
        `Check that the server is running and the base URL is correct.`,
      0
    );
  }

  if (response.status === 401 || response.status === 403) {
    cachedAuthToken = null;
    cachedWriteToken = null;
    if (response.status === 401) {
      throw new FreshRSSAuthError(
        "Authentication failed. Check your username and API password in Raycast preferences. " +
          "The API password is not the same as your FreshRSS login password."
      );
    }
    throw new FreshRSSAuthError(
      "Access forbidden. The FreshRSS API may be disabled. " +
        "Enable 'Allow API access' in FreshRSS settings under Authentication."
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new FreshRSSApiError(
      `FreshRSS API error (${response.status}): ${text || response.statusText}`,
      response.status
    );
  }

  const responseText = await response.text();

  if (responseText.includes("Not Found") || responseText.includes("PAGE NOT FOUND")) {
    throw new FreshRSSApiError(
      `FreshRSS API endpoint not found at ${url.toString()}. ` +
        `Make sure the base URL is correct and API access is enabled. ` +
        `Expected URL format: https://your-instance.example/api/greader.php`,
      404
    );
  }

  return responseText;
}

async function login(): Promise<string> {
  if (cachedAuthToken) {
    return cachedAuthToken;
  }

  const prefs = getPreferences();
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/accounts/ClientLogin`;

  const bodyParams = new URLSearchParams();
  bodyParams.set("Email", prefs.username);
  bodyParams.set("Passwd", prefs.apiPassword);
  bodyParams.set("service", "reader");
  bodyParams.set("client", "raycast-freshrss");
  const bodyStr = bodyParams.toString();

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyStr,
    });
  } catch {
    throw new FreshRSSAuthError(
      `Network error: Unable to connect to FreshRSS at ${normalizeBaseUrl(prefs.baseUrl)}. ` +
        `Check that the server is running and the base URL is correct.`
    );
  }

  if (!response.ok) {
    cachedAuthToken = null;
    cachedWriteToken = null;
    if (response.status === 401 || response.status === 403) {
      throw new FreshRSSAuthError(
        "Authentication failed. Check your username and API password in Raycast preferences. " +
          "The API password is not the same as your FreshRSS login password."
      );
    }
    const text = await response.text().catch(() => "");
    if (text.includes("Not Found") || text.includes("PAGE NOT FOUND")) {
      throw new FreshRSSApiError(
        `FreshRSS API not found at ${normalizeBaseUrl(prefs.baseUrl)}. ` +
          `Make sure the base URL is correct and API access is enabled in FreshRSS settings.`,
        404
      );
    }
    throw new FreshRSSAuthError(
      `Authentication failed (${response.status}): ${text || response.statusText}`
    );
  }

  const text = await response.text();
  const authLine = text.split("\n").find((line: string) => line.startsWith("Auth="));
  if (!authLine) {
    throw new FreshRSSAuthError(
      "Unexpected authentication response from FreshRSS. The server may be misconfigured."
    );
  }

  cachedAuthToken = authLine.substring("Auth=".length).trim();
  return cachedAuthToken;
}

async function getToken(): Promise<string> {
  if (cachedWriteToken) {
    return cachedWriteToken;
  }

  const text = await request("/reader/api/0/token", {
    method: "GET",
    requireAuth: true,
    requireWriteToken: false,
  });

  cachedWriteToken = text.trim();
  return cachedWriteToken;
}

function parseStreamItem(item: FreshRSSStreamItem): Article {
  const articleUrl =
    item.alternate?.find((a: { href: string; type: string }) => a.type === "text/html")?.href ||
    item.alternate?.[0]?.href ||
    "";

  const categories = item.categories || [];
  const isRead = categories.includes("user/-/state/com.google/read");
  const isStarred = categories.includes("user/-/state/com.google/starred");

  const publishedAt = item.published ? new Date(item.published * 1000).toISOString() : undefined;
  const updatedAt = item.updated ? new Date(item.updated * 1000).toISOString() : undefined;

  const rawSummary = item.summary?.content || item.content?.content || undefined;
  const summary = rawSummary ? rawSummary.replace(/<[^>]*>/g, "").trim().slice(0, 300) : undefined;

  return {
    id: item.id,
    title: item.title || "Untitled",
    url: articleUrl,
    feedId: item.origin?.streamId,
    feedTitle: item.origin?.title,
    author: item.author,
    publishedAt,
    updatedAt,
    summary,
    content: item.content?.content || item.summary?.content,
    isRead,
    isStarred,
  };
}

export async function getFeeds(): Promise<Feed[]> {
  const text = await request("/reader/api/0/subscription/list", {
    params: { output: "json" },
  });

  const data: FreshRSSSubscriptionListResponse = JSON.parse(text);

  return (data.subscriptions || []).map((sub: FreshRSSSubscription) => ({
    id: sub.id,
    title: sub.title || "Untitled Feed",
    url: sub.url,
    htmlUrl: sub.htmlUrl,
    iconUrl: sub.iconUrl,
    categories: sub.categories?.map((cat: { id: string; label: string }) => ({ id: cat.id, label: cat.label })),
  }));
}

export async function addFeed(feedUrl: string): Promise<void> {
  const text = await request("/reader/api/0/subscription/quickadd", {
    method: "POST",
    requireAuth: true,
    requireWriteToken: false,
    body: new URLSearchParams({ quickadd: feedUrl }).toString(),
  });

  let result: FreshRSSQuickAddResponse;
  try {
    result = JSON.parse(text);
  } catch {
    throw new FreshRSSApiError("Unexpected response when adding feed. The feed URL may be invalid.", 0);
  }

  if (result.numResults === 0) {
    throw new FreshRSSApiError(
      result.error || "Failed to add feed. The URL may not be a valid RSS/Atom feed, or it may already be subscribed.",
      0
    );
  }
}

export async function removeFeed(feedId: string): Promise<void> {
  await request("/reader/api/0/subscription/edit", {
    method: "POST",
    requireAuth: true,
    requireWriteToken: true,
    params: {
      ac: "unsubscribe",
      s: feedId,
    },
  });
}

export async function getUnreadArticles(): Promise<Article[]> {
  const text = await request("/reader/api/0/stream/contents/user/-/state/com.google/reading-list", {
    params: {
      output: "json",
      n: "50",
      xt: "user/-/state/com.google/read",
    },
  });

  const data: FreshRSSStreamContentsResponse = JSON.parse(text);
  return (data.items || []).map(parseStreamItem);
}

export async function getReadArticles(): Promise<Article[]> {
  const text = await request("/reader/api/0/stream/contents/user/-/state/com.google/reading-list", {
    params: {
      output: "json",
      n: "50",
      it: "user/-/state/com.google/read",
    },
  });

  const data: FreshRSSStreamContentsResponse = JSON.parse(text);
  return (data.items || []).map(parseStreamItem);
}

export async function getStarredArticles(): Promise<Article[]> {
  const text = await request("/reader/api/0/stream/contents/user/-/state/com.google/starred", {
    params: {
      output: "json",
      n: "50",
    },
  });

  const data: FreshRSSStreamContentsResponse = JSON.parse(text);
  return (data.items || []).map(parseStreamItem);
}

export async function markArticleRead(articleId: string): Promise<void> {
  await request("/reader/api/0/edit-tag", {
    method: "POST",
    requireAuth: true,
    requireWriteToken: true,
    params: {
      i: articleId,
      a: "user/-/state/com.google/read",
    },
  });
}

export async function markArticleUnread(articleId: string): Promise<void> {
  await request("/reader/api/0/edit-tag", {
    method: "POST",
    requireAuth: true,
    requireWriteToken: true,
    params: {
      i: articleId,
      r: "user/-/state/com.google/read",
    },
  });
}

export async function starArticle(articleId: string): Promise<void> {
  await request("/reader/api/0/edit-tag", {
    method: "POST",
    requireAuth: true,
    requireWriteToken: true,
    params: {
      i: articleId,
      a: "user/-/state/com.google/starred",
    },
  });
}

export async function unstarArticle(articleId: string): Promise<void> {
  await request("/reader/api/0/edit-tag", {
    method: "POST",
    requireAuth: true,
    requireWriteToken: true,
    params: {
      i: articleId,
      r: "user/-/state/com.google/starred",
    },
  });
}

export { FreshRSSAuthError, FreshRSSApiError };