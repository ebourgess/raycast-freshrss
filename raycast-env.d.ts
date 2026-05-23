/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Base URL - Your FreshRSS instance URL (e.g. https://feed.ebourgess.dev) */
  "baseUrl": string,
  /** Username - Your FreshRSS username */
  "username": string,
  /** API Password - Your FreshRSS API password (not your login password) */
  "apiPassword": string,
  /** Readwise Token - Your Readwise access token for saving articles to Reader (optional). Get yours at readwise.io/access_token */
  "readwiseToken"?: string,
  /** Auto Mark as Read - Automatically mark articles as read when you open them */
  "autoMarkAsRead": boolean
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
  /** Arguments passed to the `refresh-feeds` command */
  export type RefreshFeeds = {}
}

