# GoodLinks Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Save to GoodLinks" action to all article views, using GoodLinks' URL scheme.

**Architecture:** New `src/api/goodlinks.ts` module mirrors the existing `src/api/readwise.ts` pattern but uses `goodlinks://save?url=...&title=...` URL scheme instead of an HTTP API. Actions added to all four article view files.

**Tech Stack:** Raycast API (`open()`), GoodLinks URL scheme, TypeScript

---

### Task 1: Create GoodLinks API module

**Files:**
- Create: `src/api/goodlinks.ts`

- [ ] **Step 1: Create `src/api/goodlinks.ts`**

```ts
import { open } from "@raycast/api";

class GoodLinksError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoodLinksError";
  }
}

export async function saveToGoodlinks(params: { url: string; title?: string }): Promise<void> {
  const encodedUrl = encodeURIComponent(params.url);
  let schemeUrl = `goodlinks://save?url=${encodedUrl}`;
  if (params.title) {
    schemeUrl += `&title=${encodeURIComponent(params.title)}`;
  }

  try {
    await open(schemeUrl);
  } catch {
    throw new GoodLinksError("Failed to open GoodLinks. Make sure GoodLinks is installed.");
  }
}

export { GoodLinksError };
```

- [ ] **Step 2: Commit**

```bash
git add src/api/goodlinks.ts
git commit -m "feat: add GoodLinks API module with URL scheme support"
```

---

### Task 2: Add `markReadOnGoodlinks` preference

**Files:**
- Modify: `package.json` (preferences array)

- [ ] **Step 1: Add preference to `package.json`**

Insert after the `markReadOnReadwise` preference block (after line 127):

```json
    {
      "name": "markReadOnGoodlinks",
      "title": "Mark Read on GoodLinks Save",
      "description": "Automatically mark articles as read when saving to GoodLinks",
      "type": "checkbox",
      "required": false,
      "default": false,
      "label": "Mark Read on GoodLinks Save"
    },
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "feat: add markReadOnGoodlinks preference"
```

---

### Task 3: Add GoodLinks actions to `src/components/ArticleList.tsx`

**Files:**
- Modify: `src/components/ArticleList.tsx`

- [ ] **Step 1: Add import**

Add to the existing imports at the top of the file:

```ts
import { saveToGoodlinks, GoodLinksError } from "../api/goodlinks";
```

- [ ] **Step 2: Add `handleSaveToGoodlinks` handler**

Insert after the `handleOpenInReadwise` function (after line 116):

```ts
async function handleSaveToGoodlinks(article: Article, callbacks: ArticleActionCallbacks) {
  if (!article.url) {
    await showToast({ style: Toast.Style.Failure, title: "Error", message: "This article has no URL" });
    return;
  }
  try {
    await saveToGoodlinks({
      url: article.url,
      title: article.title,
    });
    const prefs = getPreferenceValues<Preferences>();
    if (prefs.markReadOnGoodlinks && !article.isRead) {
      try {
        await markArticleRead(article.id);
        callbacks.onToggleRead?.(article.id, true);
      } catch {
        await showToast({ style: Toast.Style.Failure, title: "Error", message: "Saved to GoodLinks but failed to mark as read" });
        return;
      }
    }
    callbacks.onRefresh?.();
    await showToast({ style: Toast.Style.Success, title: "Saved to GoodLinks" });
  } catch (error: unknown) {
    const message = error instanceof GoodLinksError ? error.message : "Failed to save to GoodLinks";
    await showToast({ style: Toast.Style.Failure, title: "Error", message });
  }
}

async function handleOpenInGoodlinks() {
  await open("goodlinks://");
}
```

- [ ] **Step 3: Add GoodLinks actions to `ArticleListItem`**

In the `ArticleListItem` component's `<ActionPanel>`, after the "Open Readwise Reader" action block (after line 289), insert:

```tsx
          {article.url ? (
            <Action
              title="Save to GoodLinks"
              icon={Icon.Link}
              onAction={() => handleSaveToGoodlinks(article, callbacks)}
              shortcut={{ modifiers: ["cmd", "shift"], key: "g" }}
            />
          ) : null}
          {article.url ? (
            <Action
              title="Open GoodLinks"
              icon={Icon.ArrowRight}
              onAction={handleOpenInGoodlinks}
              shortcut={{ modifiers: ["ctrl", "shift"], key: "g" }}
            />
          ) : null}
```

- [ ] **Step 4: Add GoodLinks actions to `ArticleDetailView`**

In the `ArticleDetailView` component's `<ActionPanel>`, after the "Open Readwise Reader" action block (after line 409), insert:

```tsx
          {article.url ? (
            <Action
              title="Save to GoodLinks"
              icon={Icon.Link}
              onAction={() => handleSaveToGoodlinks(article, callbacks)}
              shortcut={{ modifiers: ["cmd", "shift"], key: "g" }}
            />
          ) : null}
          {article.url ? (
            <Action
              title="Open GoodLinks"
              icon={Icon.ArrowRight}
              onAction={handleOpenInGoodlinks}
              shortcut={{ modifiers: ["ctrl", "shift"], key: "g" }}
            />
          ) : null}
```

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: No errors related to the changes

- [ ] **Step 6: Commit**

```bash
git add src/components/ArticleList.tsx
git commit -m "feat: add Save to GoodLinks action to ArticleList component"
```

---

### Task 4: Add GoodLinks actions to `src/article-detail.tsx`

**Files:**
- Modify: `src/article-detail.tsx`

- [ ] **Step 1: Add imports**

Add to the existing imports at the top of the file:

```ts
import { open } from "@raycast/api";
import { saveToGoodlinks, GoodLinksError } from "./api/goodlinks";
```

Note: `showToast` is already imported from `@raycast/api`.

- [ ] **Step 2: Add `handleSaveToGoodlinks` function**

Insert after the `isStarred` function (after line 39):

```ts
async function handleSaveToGoodlinks(article: Article, onToggleRead?: (article: Article, markRead: boolean) => void) {
  const url = getArticleUrl(article);
  if (!url) {
    await showToast({ style: Toast.Style.Failure, title: "Error", message: "This article has no URL" });
    return;
  }
  try {
    await saveToGoodlinks({ url, title: cleanTitle(article.title) });
    const prefs = getPreferenceValues<Preferences>();
    if (prefs.markReadOnGoodlinks && !isRead(article)) {
      try {
        await api.markAsRead(article.id);
        onToggleRead?.(article, true);
      } catch {
        await showToast({ style: Toast.Style.Failure, title: "Error", message: "Saved to GoodLinks but failed to mark as read" });
        return;
      }
    }
    await showToast({ style: Toast.Style.Success, title: "Saved to GoodLinks" });
  } catch (error: unknown) {
    const message = error instanceof GoodLinksError ? error.message : "Failed to save to GoodLinks";
    await showToast({ style: Toast.Style.Failure, title: "Error", message });
  }
}
```

Also add the `getPreferenceValues` import to the existing `@raycast/api` import on line 3:

Change:
```ts
import { Action, ActionPanel, Color, Detail, Icon, Toast, showToast } from "@raycast/api";
```

To:
```ts
import { Action, ActionPanel, Color, Detail, Icon, Toast, getPreferenceValues, showToast } from "@raycast/api";
```

- [ ] **Step 3: Add GoodLinks actions to the `ArticleDetail` component's action panel**

In the `ArticleDetail` component, after the "Reading" `<ActionPanel.Section>` closing tag (before the `{extraActions}` section, around line 197), insert:

```tsx
          <ActionPanel.Section title="Save">
            {url ? (
              <Action
                title="Save to GoodLinks"
                icon={Icon.Link}
                onAction={() => handleSaveToGoodlinks(article, onToggleRead)}
                shortcut={{ modifiers: ["cmd", "shift"], key: "g" }}
              />
            ) : null}
            {url ? (
              <Action
                title="Open GoodLinks"
                icon={Icon.ArrowRight}
                onAction={() => open("goodlinks://")}
                shortcut={{ modifiers: ["ctrl", "shift"], key: "g" }}
              />
            ) : null}
          </ActionPanel.Section>
```

- [ ] **Step 4: Run lint**

Run: `npm run lint`
Expected: No errors related to the changes

- [ ] **Step 5: Commit**

```bash
git add src/article-detail.tsx
git commit -m "feat: add Save to GoodLinks action to ArticleDetail view"
```

---

### Task 5: Add GoodLinks actions to `src/random-article.tsx`

**Files:**
- Modify: `src/random-article.tsx`

- [ ] **Step 1: Add import**

Add to the existing imports:

```ts
import { saveToGoodlinks, GoodLinksError } from "./api/goodlinks";
```

- [ ] **Step 2: Add `handleSaveToGoodlinksAction` handler**

Insert after the `handleSaveToReadwiseAction` function (after line 68):

```ts
async function handleSaveToGoodlinksAction(article: Article, onDone?: () => void) {
  if (!article.url) {
    await showToast({ style: Toast.Style.Failure, title: "Error", message: "This article has no URL" });
    return;
  }
  try {
    await saveToGoodlinks({
      url: article.url,
      title: article.title,
    });
    const prefs = getPreferenceValues<Preferences>();
    if (prefs.markReadOnGoodlinks && !article.isRead) {
      try {
        await markArticleRead(article.id);
      } catch {
        await showToast({ style: Toast.Style.Failure, title: "Error", message: "Saved to GoodLinks but failed to mark as read" });
        return;
      }
    }
    onDone?.();
    await showToast({ style: Toast.Style.Success, title: "Saved to GoodLinks" });
  } catch (error: unknown) {
    const message = error instanceof GoodLinksError ? error.message : "Failed to save to GoodLinks";
    await showToast({ style: Toast.Style.Failure, title: "Error", message });
  }
}
```

- [ ] **Step 3: Add GoodLinks actions to the action panel**

After the "Open Readwise Reader" action block (after line 186), insert:

```tsx
          {article.url ? (
            <Action
              title="Save to GoodLinks"
              icon={Icon.Link}
              onAction={() => handleSaveToGoodlinksAction(article, () => {
                const prefs = getPreferenceValues<Preferences>();
                if (prefs.markReadOnGoodlinks && !localIsRead) {
                  setLocalIsRead(true);
                }
              })}
              shortcut={{ modifiers: ["cmd", "shift"], key: "g" }}
            />
          ) : null}
          {article.url ? (
            <Action
              title="Open GoodLinks"
              icon={Icon.ArrowRight}
              onAction={() => open("goodlinks://")}
              shortcut={{ modifiers: ["ctrl", "shift"], key: "g" }}
            />
          ) : null}
```

- [ ] **Step 4: Run lint**

Run: `npm run lint`
Expected: No errors related to the changes

- [ ] **Step 5: Commit**

```bash
git add src/random-article.tsx
git commit -m "feat: add Save to GoodLinks action to random article view"
```

---

### Task 6: Add GoodLinks actions to `src/article-list.tsx` (legacy)

**Files:**
- Modify: `src/article-list.tsx`

- [ ] **Step 1: Add imports**

Add to the existing imports:

```ts
import { saveToGoodlinks, GoodLinksError } from "./api/goodlinks";
import { getPreferenceValues, open, openCommandPreferences } from "@raycast/api";
```

Note: Check if `getPreferenceValues`, `open`, and `openCommandPreferences` are already imported from `@raycast/api` and only add what's missing.

- [ ] **Step 2: Add GoodLinks save handler inside the `ArticleList` component**

Inside the `ArticleList` component, after the existing `loadArticles` logic (around line 173), add:

```ts
  const handleSaveToGoodlinks = async (article: Article) => {
    const url = getArticleUrl(article);
    if (!url) {
      await showToast({ style: Toast.Style.Failure, title: "Error", message: "This article has no URL" });
      return;
    }
    try {
      await saveToGoodlinks({ url, title: cleanTitle(article.title) });
      const prefs = getPreferenceValues<Preferences>();
      if (prefs.markReadOnGoodlinks && !isRead(article)) {
        try {
          await api.markAsRead(article.id);
          updateArticle(article.id, (currentArticle) => ({
            ...currentArticle,
            categories: [
              ...currentArticle.categories.filter((category) => category !== "user/-/state/com.google/read"),
              "user/-/state/com.google/read",
            ],
          }));
        } catch {
          await showToast({ style: Toast.Style.Failure, title: "Error", message: "Saved to GoodLinks but failed to mark as read" });
          return;
        }
      }
      await showToast({ style: Toast.Style.Success, title: "Saved to GoodLinks" });
    } catch (error: unknown) {
      const message = error instanceof GoodLinksError ? error.message : "Failed to save to GoodLinks";
      await showToast({ style: Toast.Style.Failure, title: "Error", message });
    }
  };
```

- [ ] **Step 3: Add GoodLinks actions to the article action panel**

In the `articles.map` section of the JSX, after the star/unstar action (around line 427), insert:

```tsx
                <Action
                  title="Save to GoodLinks"
                  icon={Icon.Link}
                  onAction={() => handleSaveToGoodlinks(article)}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "g" }}
                />
                <Action
                  title="Open GoodLinks"
                  icon={Icon.ArrowRight}
                  onAction={() => open("goodlinks://")}
                  shortcut={{ modifiers: ["ctrl", "shift"], key: "g" }}
                />
```

- [ ] **Step 4: Run lint**

Run: `npm run lint`
Expected: No errors related to the changes

- [ ] **Step 5: Commit**

```bash
git add src/article-list.tsx
git commit -m "feat: add Save to GoodLinks action to legacy article list"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run lint across the whole project**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Successful build with no TypeScript errors

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address lint/build issues from GoodLinks integration"
```
