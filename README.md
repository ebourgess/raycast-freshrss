# FreshRSS Raycast Extension

Browse and manage your FreshRSS feeds and articles directly from Raycast.

## Features

- **List Feeds** — View all subscribed RSS/Atom feeds with icons
- **Add Feed** — Subscribe to a new RSS/Atom feed by URL
- **Remove Feed** — Unsubscribe from a feed with confirmation
- **Unread Articles** — Browse unread articles with pagination, mark-as-read, and star actions
- **Read Articles** — Browse read articles with pagination, mark-as-unread, and star actions
- **Starred Articles** — Browse starred/favorite articles with pagination, unstar, and read/unread actions
- **Browse by Category** — Navigate articles by category/label folders

## Prerequisites

### 1. Enable the FreshRSS API

In your FreshRSS web interface:

1. Log in as your user
2. Go to **Settings** → **Profile**
3. Under **Authentication**, check **"Allow API access (required for mobile apps)"**
4. Save changes

### 2. Set your API password

The API password is separate from your FreshRSS login password:

1. In **Settings** → **Profile**, find the **"API password (e.g., for mobile apps)"** field
2. Enter a password — this will be your API password for Raycast
3. Save changes

### 3. Verify API access

Click the API link shown next to your API password field (e.g. `https://your-instance.example/api/`). If you see a page with test links, the API is enabled.

## Configuration

Configure the extension in Raycast Preferences:

| Preference   | Description                                      | Example                        |
|-------------|--------------------------------------------------|--------------------------------|
| Base URL    | Your FreshRSS instance URL (without `/api/`)    | `https://feed.ebourgess.dev`   |
| Username    | Your FreshRSS username                           | `alice`                        |
| API Password| Your FreshRSS **API password** (not your login)  | *(your API password)*          |

The API endpoint is constructed automatically as `{Base URL}/api/greader.php`.

## FreshRSS API Endpoints Used

This extension uses the FreshRSS Google Reader-compatible API:

| Operation            | Endpoint                                                                           | Method |
|----------------------|------------------------------------------------------------------------------------|--------|
| Authentication       | `/accounts/ClientLogin`                                                           | POST   |
| Write token          | `/reader/api/0/token`                                                               | GET    |
| List feeds           | `/reader/api/0/subscription/list`                                                  | GET    |
| Add feed             | `/reader/api/0/subscription/quickadd`                                               | POST   |
| Remove feed          | `/reader/api/0/subscription/edit`                                                   | POST   |
| List categories      | `/reader/api/0/tag/list`                                                            | GET    |
| Unread articles      | `/reader/api/0/stream/contents/user/-/state/com.google/reading-list`                | GET    |
| Read articles        | `/reader/api/0/stream/contents/user/-/state/com.google/reading-list`                 | GET    |
| Starred articles     | `/reader/api/0/stream/contents/user/-/state/com.google/starred`                      | GET    |
| Articles by category | `/reader/api/0/stream/contents/{categoryId}`                                        | GET    |
| Mark read/unread     | `/reader/api/0/edit-tag`                                                            | POST   |
| Star/unstar          | `/reader/api/0/edit-tag`                                                            | POST   |

## Running Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the extension:

   ```bash
   npm run build
   ```

3. Develop with live reload:

   ```bash
   npm run dev
   ```

4. Lint:

   ```bash
   npm run lint
   ```

## Features Detail

### Pagination

Article lists support pagination via the FreshRSS continuation token. Select "Load more articles..." at the bottom of any article list to fetch the next page.

### Article Detail View

Press `Cmd+Enter` on any article to see the full HTML content rendered in a Detail view, including metadata (feed name, author, published date, read/starred status).

### Caching

Feed lists and categories are cached for 5 minutes to reduce API calls. The cache is automatically invalidated when you add or remove a feed, and on explicit refresh.

### Feed Icons

Feed icons from the FreshRSS API are displayed next to feed titles when available.

### Category Browsing

The "Browse by Category" command shows all labels/folders from your FreshRSS account. Select a category to see its articles with full pagination and read/star support.

## License

MIT