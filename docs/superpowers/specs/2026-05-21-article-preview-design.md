# Article Side-by-Side Preview

## Summary

Add a detail preview pane to article lists so users can read article content without pressing Enter. Uses Raycast's built-in `List.Item.Detail` pattern for a split view: list on the left, article content on the right.

## Changes

### `src/components/ArticleList.tsx`

- Add `isShowingDetail` prop to the `<List>` component to activate split layout
- Add `detail` prop to each `<List.Item>` with a `<List.Item.Detail>` element containing:
  - Markdown: article title as heading + content (fallback chain: content → summary → "No content available")
  - Metadata: feed name, author, published date, read/starred status
- Remove unused `useNavigation` import
- Keep existing `ArticleDetailView` for the `Action.Push` full view — no changes to that component

### No changes to command files

The command files (`unread-articles.tsx`, `read-articles.tsx`, `starred-articles.tsx`, `browse-categories.tsx`) pass through to `<ArticleList>` and need no modifications.

## Layout

```
┌──────────────────┬──────────────────────────────┐
│ Article List     │ ## Article Title              │
│                  │                               │
│ > Article 1      │ Article content rendered as   │
│   Article 2      │ markdown in the detail pane   │
│   Article 3      │                               │
│                  │ Feed: Bloomberg               │
│                  │ Author: John Doe              │
│                  │ Published: May 21, 2026        │
│                  │ Status: Unread                 │
└──────────────────┴──────────────────────────────┘
```

## Interactions

All existing interactions are preserved:
- Arrow keys browse articles (preview updates instantly)
- Enter pushes to full `Detail` view for complete article reading
- All actions (mark read/unread, star/unstar, open in browser, copy URL) remain unchanged