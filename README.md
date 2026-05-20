# FreshRSS Raycast Extension

Browse and manage your FreshRSS feeds and articles directly from Raycast.

## Features

- **List Feeds** — View all your subscribed RSS/Atom feeds
- **Add Feed** — Subscribe to a new RSS/Atom feed by URL
- **Remove Feed** — Unsubscribe from a feed with confirmation
- **Unread Articles** — Browse unread articles with mark-as-read and star actions
- **Read Articles** — Browse read articles with mark-as-unread and star actions
- **Starred Articles** — Browse starred/favorite articles with unstar and read/unread actions

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

| Operation         | Endpoint                                          | Method |
|-------------------|---------------------------------------------------|--------|
| Authentication    | `/accounts/ClientLogin`                           | POST   |
| Write token       | `/reader/api/0/token`                              | GET    |
| List feeds        | `/reader/api/0/subscription/list`                 | GET    |
| Add feed          | `/reader/api/0/subscription/quickadd`              | POST   |
| Remove feed       | `/reader/api/0/subscription/edit`                  | POST   |
| Unread articles   | `/reader/api/0/stream/contents/user/-/state/com.google/reading-list` | GET |
| Read articles     | `/reader/api/0/stream/contents/user/-/state/com.google/reading-list` | GET |
| Starred articles  | `/reader/api/0/stream/contents/user/-/state/com.google/starred` | GET |
| Mark read/unread  | `/reader/api/0/edit-tag`                           | POST   |
| Star/unstar       | `/reader/api/0/edit-tag`                           | POST   |

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

## Known Limitations

- Fetches up to 50 articles per view (no pagination/continuation support yet)
- Article content is truncated to 300 characters in summaries
- Feed icons are not displayed
- No background sync or local caching
- Categories/folders are shown as metadata but not as a navigation structure

## License

MIT