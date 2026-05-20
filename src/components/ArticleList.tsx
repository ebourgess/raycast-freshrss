import { List, Action, ActionPanel, Icon, Color } from "@raycast/api";
import { showToast, Toast } from "@raycast/api";
import type { Article, ArticleListMode } from "../api/types";
import {
  markArticleRead,
  markArticleUnread,
  starArticle,
  unstarArticle,
  FreshRSSAuthError,
  FreshRSSApiError,
} from "../api/freshrss";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type ArticleActionCallbacks = {
  onRefresh?: () => void;
};

async function handleToggleRead(article: Article, isRead: boolean, onDone?: () => void) {
  try {
    if (isRead) {
      await markArticleUnread(article.id);
    } else {
      await markArticleRead(article.id);
    }
    await showToast({
      style: Toast.Style.Success,
      title: isRead ? "Marked as unread" : "Marked as read",
    });
    onDone?.();
  } catch (error: unknown) {
    const message = error instanceof FreshRSSAuthError || error instanceof FreshRSSApiError ? error.message : "Failed to update article state";
    await showToast({ style: Toast.Style.Failure, title: "Error", message });
  }
}

async function handleToggleStar(article: Article, isStarred: boolean, onDone?: () => void) {
  try {
    if (isStarred) {
      await unstarArticle(article.id);
    } else {
      await starArticle(article.id);
    }
    await showToast({
      style: Toast.Style.Success,
      title: isStarred ? "Unstarred" : "Starred",
    });
    onDone?.();
  } catch (error: unknown) {
    const message = error instanceof FreshRSSAuthError || error instanceof FreshRSSApiError ? error.message : "Failed to update article state";
    await showToast({ style: Toast.Style.Failure, title: "Error", message });
  }
}

type ArticleListProps = {
  articles: Article[];
  isLoading: boolean;
  onRefresh?: () => void;
  mode: ArticleListMode;
};

export function ArticleList({ articles, isLoading, onRefresh, mode }: ArticleListProps) {
  const title = mode === "unread" ? "Unread Articles" : mode === "read" ? "Read Articles" : "Starred Articles";

  const callbacks: ArticleActionCallbacks = {
    onRefresh,
  };

  return (
    <List isLoading={isLoading} navigationTitle={title} searchBarPlaceholder="Search articles...">
      {articles.length === 0 && !isLoading ? (
        <List.EmptyView
          title={mode === "unread" ? "No unread articles" : mode === "read" ? "No read articles" : "No starred articles"}
          description="Try refreshing or check your FreshRSS connection"
          actions={
            onRefresh ? (
              <ActionPanel>
                <Action title="Refresh" onAction={onRefresh} icon={Icon.ArrowClockwise} />
              </ActionPanel>
            ) : undefined
          }
        />
      ) : (
        articles.map((article) => (
          <ArticleListItem key={article.id} article={article} mode={mode} callbacks={callbacks} />
        ))
      )}
    </List>
  );
}

type ArticleListItemProps = {
  article: Article;
  mode: ArticleListMode;
  callbacks: ArticleActionCallbacks;
};

function ArticleListItem({ article, mode, callbacks }: ArticleListItemProps) {
  const accessories: List.Item.Accessory[] = [];

  if (article.isRead !== undefined) {
    accessories.push({
      icon: article.isRead ? { source: Icon.Circle, tintColor: Color.SecondaryText } : { source: Icon.Circle, tintColor: Color.Blue },
      tooltip: article.isRead ? "Read" : "Unread",
    });
  }

  if (article.isStarred !== undefined) {
    accessories.push({
      icon: article.isStarred ? { source: Icon.Star, tintColor: Color.Yellow } : { source: Icon.Star, tintColor: Color.SecondaryText },
      tooltip: article.isStarred ? "Starred" : "Not starred",
    });
  }

  if (article.publishedAt) {
    accessories.push({ text: formatDate(article.publishedAt) });
  }

  const subtitle = [article.feedTitle, article.author].filter(Boolean).join(" · ");

  return (
    <List.Item
      id={article.id}
      title={article.title || "Untitled"}
      subtitle={subtitle}
      accessories={accessories}
      actions={
        <ActionPanel>
          {article.url ? <Action.OpenInBrowser url={article.url} title="Open Article in Browser" /> : null}
          {article.url ? <Action.CopyToClipboard content={article.url} title="Copy Article URL" /> : null}
          {article.id ? <Action.CopyToClipboard content={article.id} title="Copy Article ID" /> : null}
          {mode === "unread" && !article.isRead ? (
            <Action
              title="Mark as Read"
              icon={Icon.Circle}
              onAction={() => handleToggleRead(article, false, callbacks.onRefresh)}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            />
          ) : null}
          {mode === "read" && article.isRead ? (
            <Action
              title="Mark as Unread"
              icon={Icon.Circle}
              onAction={() => handleToggleRead(article, true, callbacks.onRefresh)}
              shortcut={{ modifiers: ["cmd"], key: "u" }}
            />
          ) : null}
          {article.isStarred ? (
            <Action
              title="Unstar Article"
              icon={Icon.Star}
              onAction={() => handleToggleStar(article, true, callbacks.onRefresh)}
              shortcut={{ modifiers: ["cmd", "shift"], key: "s" }}
            />
          ) : (
            <Action
              title="Star Article"
              icon={Icon.Star}
              onAction={() => handleToggleStar(article, false, callbacks.onRefresh)}
              shortcut={{ modifiers: ["cmd"], key: "s" }}
            />
          )}
          {callbacks.onRefresh ? (
            <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={callbacks.onRefresh} shortcut={{ modifiers: ["cmd", "shift"], key: "r" }} />
          ) : null}
        </ActionPanel>
      }
    />
  );
}