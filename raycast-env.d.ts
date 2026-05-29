/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Base URL - Your FreshRSS instance URL (e.g. https://feed.example.com) */
  "baseUrl": string,
  /** Username - Your FreshRSS username */
  "username": string,
  /** API Password - Your FreshRSS API password (not your login password) */
  "apiPassword": string,
  /** Enable Readwise - Enable the Save to Readwise Reader action. You must also set your Readwise access token below. */
  "enableReadwise": boolean,
  /** Readwise Token - Your Readwise access token for saving articles to Reader (optional). Get yours at readwise.io/access_token */
  "readwiseToken"?: string,
  /** Enable GoodLinks - Enable the Save to GoodLinks action. You must also set your GoodLinks API token below. */
  "enableGoodlinks": boolean,
  /** GoodLinks API Token - Your GoodLinks API token (optional). Enable the API in GoodLinks Settings → API and copy the token. */
  "goodlinksApiToken"?: string,
  /** GoodLinks API URL - The base URL for the GoodLinks API (defaults to http://localhost:9428) */
  "goodlinksApiUrl"?: string,
  /** Auto Mark as Read - Automatically mark articles as read when you open them */
  "autoMarkAsRead": boolean,
  /** Mark Read on Readwise Save - Automatically mark articles as read when saving to Readwise Reader */
  "markReadOnReadwise": boolean,
  /** Mark Read on GoodLinks Save - Automatically mark articles as read when saving to GoodLinks */
  "markReadOnGoodlinks": boolean,
  /** Debug Logging - Enable debug logging to console for troubleshooting API requests */
  "debugLogging": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `list-feeds` command */
  export type ListFeeds = ExtensionPreferences & {}
  /** Preferences accessible in the `add-feed` command */
  export type AddFeed = ExtensionPreferences & {}
  /** Preferences accessible in the `remove-feed` command */
  export type RemoveFeed = ExtensionPreferences & {}
  /** Preferences accessible in the `unread-articles` command */
  export type UnreadArticles = ExtensionPreferences & {}
  /** Preferences accessible in the `read-articles` command */
  export type ReadArticles = ExtensionPreferences & {}
  /** Preferences accessible in the `starred-articles` command */
  export type StarredArticles = ExtensionPreferences & {}
  /** Preferences accessible in the `browse-categories` command */
  export type BrowseCategories = ExtensionPreferences & {}
  /** Preferences accessible in the `search-articles` command */
  export type SearchArticles = ExtensionPreferences & {}
  /** Preferences accessible in the `random-article` command */
  export type RandomArticle = ExtensionPreferences & {}
  /** Preferences accessible in the `refresh-feeds` command */
  export type RefreshFeeds = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `list-feeds` command */
  export type ListFeeds = {}
  /** Arguments passed to the `add-feed` command */
  export type AddFeed = {}
  /** Arguments passed to the `remove-feed` command */
  export type RemoveFeed = {}
  /** Arguments passed to the `unread-articles` command */
  export type UnreadArticles = {}
  /** Arguments passed to the `read-articles` command */
  export type ReadArticles = {}
  /** Arguments passed to the `starred-articles` command */
  export type StarredArticles = {}
  /** Arguments passed to the `browse-categories` command */
  export type BrowseCategories = {}
  /** Arguments passed to the `search-articles` command */
  export type SearchArticles = {}
  /** Arguments passed to the `random-article` command */
  export type RandomArticle = {}
  /** Arguments passed to the `refresh-feeds` command */
  export type RefreshFeeds = {}
}

