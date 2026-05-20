import { List, Action, ActionPanel, Icon } from "@raycast/api";
import type { Feed } from "../api/types";

type FeedListProps = {
  feeds: Feed[];
  isLoading: boolean;
  actions?: (feed: Feed) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onRefresh?: () => void;
};

export function FeedList({ feeds, isLoading, actions, emptyTitle, emptyDescription, onRefresh }: FeedListProps) {
  return (
    <List isLoading={isLoading} navigationTitle="Feeds" searchBarPlaceholder="Search feeds...">
      {feeds.length === 0 && !isLoading ? (
        <List.EmptyView
          title={emptyTitle || "No feeds found"}
          description={emptyDescription || "No feeds are subscribed on your FreshRSS instance"}
          actions={
            onRefresh ? (
              <ActionPanel>
                <Action title="Refresh" onAction={onRefresh} icon={Icon.ArrowClockwise} />
              </ActionPanel>
            ) : undefined
          }
        />
      ) : (
        feeds.map((feed) => (
          <List.Item
            key={feed.id}
            id={feed.id}
            title={feed.title}
            subtitle={feed.url || feed.htmlUrl || ""}
            icon={Icon.Rss}
            accessories={[{ text: feed.id }]}
            actions={
              <ActionPanel>
                {feed.htmlUrl ? <Action.OpenInBrowser url={feed.htmlUrl} title="Open Site in Browser" /> : null}
                {feed.url ? <Action.OpenInBrowser url={feed.url} title="Open Feed URL in Browser" /> : null}
                {feed.url ? <Action.CopyToClipboard content={feed.url} title="Copy Feed URL" /> : null}
                {feed.htmlUrl ? <Action.CopyToClipboard content={feed.htmlUrl} title="Copy Site URL" /> : null}
                <Action.CopyToClipboard content={feed.id} title="Copy Feed ID" />
                {actions ? actions(feed) : null}
                {onRefresh ? (
                  <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={onRefresh} shortcut={{ modifiers: ["cmd", "shift"], key: "r" }} />
                ) : null}
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}