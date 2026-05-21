# Four Feature Additions: Search, Refresh, Keyboard Nav, Detail Actions

## Summary

Add four features to the FreshRSS Raycast extension:
1. **Search Articles** — full-text search via FreshRSS API
2. **Feed Refresh** — force-refresh all feeds from Raycast
3. **Keyboard Navigation** — add missing shortcuts to action panels
4. **Article Actions in Detail View** — mark read/unread and star/unstar from the pushed detail view

## 1. Search Articles

### New file: `src/search-articles.tsx`
- New Raycast command `search-articles`
- Uses `List` with `searchBarPlaceholder="Search articles..."`
- Search query passed to `searchArticles()` API function
- Results displayed via existing `ArticleList` component
- Debounced search (300ms) to avoid excessive API calls
- Empty state with helpful message when no results

### API: `searchArticles(query, continuation?)` in `src/api/freshrss.ts`
- Endpoint: `GET /reader/api/0/search/items/`
- Params: `q` (query), `n` (50), `c` (continuation token), `output=json`
- Returns `ArticleFetchResult` (same as other article fetchers)
- Reuses `parseStreamItem()` and `buildFeedIconMap()` for consistency

### package.json
- New command entry: `search-articles`, title "Search Articles", mode "view"

## 2. Feed Refresh

### New file: `src/refresh-feeds.tsx`
- New Raycast command `refresh-feeds`
- Calls `refreshFeeds()` API function
- Shows loading toast, then success toast
- Invalidates feed cache
- Also added as an action on the feed list (in `FeedList` or `list-feeds`)

### API: `refreshFeeds()` in `src/api/freshrss.ts`
- Calls the FreshRSS force refresh endpoint
- Invalidates the feed cache
- Returns void

### package.json
- New command entry: `refresh-feeds`, title "Refresh Feeds", mode "no-view"

## 3. Keyboard Navigation

### Changes to `src/components/ArticleList.tsx`
Add missing shortcuts to the action panel in both `ArticleListItem` and `ArticleDetailView`:
- `Cmd+O` — Open in Browser
- `Cmd+C` — Copy URL
- `Cmd+K` — Copy Article ID

No changes to other files.

## 4. Article Actions in Detail View

### Changes to `src/components/ArticleList.tsx`
Add to `ArticleDetailView` action panel:
- Mark as Read / Mark as Unread (toggles based on `article.isRead`)
- Star / Unstar (toggles based on `article.isStarred`)
- Refresh action (calls `onRefresh` callback)

These require passing `callbacks` to `ArticleDetailView` so it can trigger refresh.

## Files Changed

| File | Changes |
|------|---------|
| `src/api/freshrss.ts` | Add `searchArticles()`, `refreshFeeds()` |
| `src/search-articles.tsx` | New file |
| `src/refresh-feeds.tsx` | New file |
| `src/components/ArticleList.tsx` | Add shortcuts + detail view actions |
| `package.json` | Register new commands |

## Dependencies

All features use existing patterns:
- `ArticleList` component for rendering results
- `parseStreamItem()` for parsing API responses
- `buildFeedIconMap()` for feed icons
- `handleToggleRead()` / `handleToggleStar()` for article actions
- `showToast` / `Toast` for user feedback
