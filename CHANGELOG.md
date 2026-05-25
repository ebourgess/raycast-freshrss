# Changelog

All notable changes to the FreshRSS Raycast extension will be documented in this file.

## [1.0.0] - 2026-05-25

### Added

- Save to Readwise integration for articles
- Article detail view for reading full content
- Search articles command (`search-articles`) with full-text search across all feeds
- `searchArticles` API function
- Refresh feeds command (`refresh-feeds`) with cache clearing
- `refreshFeeds` API function
- Category selection when adding feeds
- Keyboard shortcuts for open article, copy URL, and copy ID
- Article actions (mark read/unread, star/unstar) in detail view
- Feed drill-down from category and unread views
- Optimistic UI updates for mark-as-read and star/unstar actions
- Mark all as read action
- Feed editing support
- Unread count badges on feeds and categories
- Dashboard view with unread overview
- Auto mark-as-read preference (optional)
- Browse by Category command (`browse-categories`)

### Fixed

- Search functionality returning incorrect results
- Category adding flow not working properly
- Refresh feeds not clearing cache correctly
- Extension authentication and connection issues
- Limitations in the initial Google Reader API implementation

### Changed

- Updated extension icon
- Anonymized documentation links
- Removed copy article ID action (replaced by copy URL)
- Updated dependencies (`@raycast/api`, `@raycast/utils`, `typescript`)

## [0.1.0] - Initial Release

### Added

- List Feeds command (`list-feeds`)
- Add Feed command (`add-feed`)
- Remove Feed command (`remove-feed`)
- Unread Articles command (`unread-articles`)
- Read Articles command (`read-articles`)
- Starred Articles command (`starred-articles`)
- FreshRSS Google Reader API client with authentication
- Preferences for base URL, username, and API password