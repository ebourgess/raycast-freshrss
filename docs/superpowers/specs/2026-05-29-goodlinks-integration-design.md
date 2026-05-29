# GoodLinks Integration Design

## Overview

Add a "Save to GoodLinks" action to all article views in the FreshRSS Raycast extension, allowing users to save articles to the GoodLinks read-later app via its URL scheme.

## Approach

Use GoodLinks' URL scheme (`goodlinks://save?url=...&title=...`) to save articles. This requires no API token or authentication — GoodLinks registers the URL scheme on macOS and handles the save natively when the URL is opened.

## New Files

### `src/api/goodlinks.ts`

- `saveToGoodlinks(url: string, title?: string): Promise<void>` — constructs the GoodLinks URL scheme and opens it via Raycast's `open()` utility
- URL format: `goodlinks://save?url={encodedUrl}&title={encodedTitle}`
- No token or auth needed

## Changes to Existing Files

### `package.json` (preferences)

- Add `markReadOnGoodlinks` checkbox preference (default: false)
- Mirrors the existing `markReadOnReadwise` preference pattern
- Description: "Automatically mark articles as read when saving to GoodLinks"

### `src/components/ArticleList.tsx`

- Import `saveToGoodlinks` from `../api/goodlinks`
- Add `handleSaveToGoodlinks()` handler that:
  1. Checks article has a URL
  2. Calls `saveToGoodlinks()`
  3. If `markReadOnGoodlinks` preference is enabled and article is unread, marks article as read via `markArticleRead()`
  4. Shows success/error toast
- Add "Save to GoodLinks" action (shortcut `cmd+shift+g`) in `ArticleListItem`
- Add "Save to GoodLinks" action (shortcut `cmd+shift+g`) in `ArticleDetailView`
- Add "Open GoodLinks" action (shortcut `ctrl+shift+g`) in both views

### `src/article-detail.tsx`

- Import `saveToGoodlinks` from `./api/goodlinks`
- Add "Save to GoodLinks" action directly in the action panel (same pattern as the existing read/star toggle actions)
- Add "Open GoodLinks" action

### `src/random-article.tsx`

- Add `handleSaveToGoodlinksAction()` handler (mirrors existing `handleSaveToReadwiseAction`)
- Add "Save to GoodLinks" action (shortcut `cmd+shift+g`)
- Add "Open GoodLinks" action (shortcut `ctrl+shift+g`)

### `src/article-list.tsx` (legacy component)

- Add "Save to GoodLinks" action alongside the existing Readwise actions in the article action panel

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save to GoodLinks | `cmd+shift+g` |
| Open GoodLinks app | `ctrl+shift+g` |

## Error Handling

- If article has no URL: show toast error "This article has no URL"
- If GoodLinks is not installed: the URL scheme call will fail silently — macOS won't open anything. Show a toast suggesting the user install GoodLinks if the save appears to not work.
- If `markArticleRead()` fails after a successful GoodLinks save: show toast "Saved to GoodLinks but failed to mark as read" (mirrors Readwise error handling pattern)

## Preferences Summary

| Preference | Type | Default | Description |
|-----------|------|---------|-------------|
| `markReadOnGoodlinks` | checkbox | false | Automatically mark articles as read when saving to GoodLinks |
