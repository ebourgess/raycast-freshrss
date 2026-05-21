import { useEffect, useState, useCallback } from "react";
import { showToast, Toast, Action, ActionPanel, Icon } from "@raycast/api";
import { refreshFeeds } from "./api/freshrss";
import { FreshRSSAuthError, FreshRSSApiError } from "./api/freshrss";

export default function RefreshFeedsCommand() {
  const [isRefreshing, setIsRefreshing] = useState(true);

  const doRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshFeeds();
      await showToast({ style: Toast.Style.Success, title: "Feeds Refreshed" });
    } catch (error: unknown) {
      const message =
        error instanceof FreshRSSAuthError || error instanceof FreshRSSApiError
          ? error.message
          : "Failed to refresh feeds. Check your FreshRSS connection.";
      await showToast({ style: Toast.Style.Failure, title: "Error", message });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    doRefresh();
  }, [doRefresh]);

  return (
    <ActionPanel>
      <Action title="Refresh Again" icon={Icon.ArrowClockwise} onAction={doRefresh} />
    </ActionPanel>
  );
}
