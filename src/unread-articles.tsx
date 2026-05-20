import { useState, useEffect, useCallback } from "react";
import { getUnreadArticles } from "./api/freshrss";
import { ArticleList } from "./components/ArticleList";
import type { Article } from "./api/types";
import { showToast, Toast } from "@raycast/api";
import { FreshRSSAuthError, FreshRSSApiError } from "./api/freshrss";

export default function UnreadArticlesCommand() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getUnreadArticles();
      setArticles(result);
    } catch (error: unknown) {
      const message =
        error instanceof FreshRSSAuthError || error instanceof FreshRSSApiError
          ? error.message
          : "Failed to load unread articles. Check your FreshRSS connection.";
      await showToast({ style: Toast.Style.Failure, title: "Error", message });
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <ArticleList articles={articles} isLoading={isLoading} onRefresh={fetchData} mode="unread" />;
}