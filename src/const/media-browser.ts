import { MediaTypes } from "./common";

export interface MediaBrowserConfig {
  enabled: boolean,
  favorites: FavoritesConfig;
}

interface FavoritesConfig {
  enabled: boolean,
  albums: FavoriteItemConfig,
  artists: FavoriteItemConfig,
  audiobooks: FavoriteItemConfig,
  playlists: FavoriteItemConfig,
  podcasts: FavoriteItemConfig,
  radios: FavoriteItemConfig
  tracks: FavoriteItemConfig,
}

interface FavoriteItemConfig {
  enabled: boolean
}

export const DEFAULT_MEDIA_BROWSER_CONFIG: MediaBrowserConfig = {
  enabled: true,
  favorites: {
    enabled: true,
    albums: {
      enabled: true
    },
    artists: {
      enabled: true
    },
    audiobooks: {
      enabled: true
    },
    playlists: {
      enabled: true
    },
    podcasts: {
      enabled: true
    },
    radios: {
      enabled: true
    },
    tracks: {
      enabled: true
    },
  }
}

export interface MediaBrowserItem {
  name: string,
  uri: string,
  media_type: MediaTypes,
  image: string
}
export interface FavoriteItems {
  albums: MediaBrowserItem[],
  artists: MediaBrowserItem[],
  audiobooks: MediaBrowserItem[],
  playlists: MediaBrowserItem[],
  podcasts: MediaBrowserItem[],
  radios: MediaBrowserItem[],
  tracks: MediaBrowserItem[],
}