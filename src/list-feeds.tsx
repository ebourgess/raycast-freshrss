import { useState, useEffect, useCallback } from "react";
import { getFeeds } from "./api/freshrss";
import { FeedList } from "./components/FeedList";
import type { Feed } from "./api/types";
import { showToast, Toast } from "@raycast/api";
import { FreshRSSAuthError, FreshRSSApiError } from "./api/freshrss";

export default function ListFeedsCommand() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getFeeds();
      setFeeds(result);
    } catch (error: unknown) {
      const message =
        error instanceof FreshRSSAuthError || error instanceof FreshRSSApiError
          ? error.message
          : "Failed to load feeds. Check your FreshRSS connection.";
      await showToast({ style: Toast.Style.Failure, title: "Error", message });
      setFeeds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <FeedList feeds={feeds} isLoading={isLoading} onRefresh={fetchData} />;
}