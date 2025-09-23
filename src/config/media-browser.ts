import { mdiHeart } from "@mdi/js";

import { Config } from "./config";

export interface MediaBrowserConfig {
  enabled: boolean,
  favorites: FavoritesConfig;
  sections: customSection[];
}

export interface customSection {
  name: string,
  image: string,
  items: customItem[]
}
export interface customItem {
  name: string,
  image: string,
  media_content_id: never,
  media_content_type: never,
  service: never
}

export interface FavoritesConfig {
  enabled: boolean,
  albums: FavoriteItemConfig,
  artists: FavoriteItemConfig,
  audiobooks: FavoriteItemConfig,
  playlists: FavoriteItemConfig,
  podcasts: FavoriteItemConfig,
  radios: FavoriteItemConfig
  tracks: FavoriteItemConfig,
}

export interface FavoriteItemConfig {
  enabled: boolean,
  limit: number,
  items: customItem[],
}
export const DEFAULT_FAVORITE_ITEM_CONFIG: FavoriteItemConfig = {
  enabled: true,
  limit: 25,
  items: []
}

const DEFAULT_FAVORITES_CONFIG: FavoritesConfig = {
  enabled: true,
  albums: DEFAULT_FAVORITE_ITEM_CONFIG,
  artists: DEFAULT_FAVORITE_ITEM_CONFIG,
  audiobooks: DEFAULT_FAVORITE_ITEM_CONFIG,
  playlists: DEFAULT_FAVORITE_ITEM_CONFIG,
  podcasts: DEFAULT_FAVORITE_ITEM_CONFIG,
  radios: DEFAULT_FAVORITE_ITEM_CONFIG,
  tracks: DEFAULT_FAVORITE_ITEM_CONFIG,
}
const DEFAULT_CUSTOM_SECTION_CONFIG = []

export const DEFAULT_MEDIA_BROWSER_CONFIG: MediaBrowserConfig = {
  enabled: true,
  favorites: DEFAULT_FAVORITES_CONFIG,
  sections: DEFAULT_CUSTOM_SECTION_CONFIG
}

function favoritesConfigForm(section: string) {
  return {
    name: section,
    type: "expandable",
    schema: [
      {
        name: "",
        type: "grid",
        schema: [
          { name: "enabled", selector: { boolean: {} }, default: true },
          { name: "limit", selector: { number: { min: 0, max: 500, mode: "box" } } },
        ]
      }
    ]
  }
}
export function mediaBrowserConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} } },
    {
      name: "favorites",
      type: "expandable",
      iconPath: mdiHeart,
      schema: [
        favoritesConfigForm("album"),
        favoritesConfigForm("artists"),
        favoritesConfigForm("audiobooks"),
        favoritesConfigForm("playlists"),
        favoritesConfigForm("podcasts"),
        favoritesConfigForm("radios"),
        favoritesConfigForm("tracks"),
      ]
    }
  ]
}

function processFavoriteItemConfig(config: FavoriteItemConfig) {
  const default_favorites_config = DEFAULT_FAVORITE_ITEM_CONFIG;
  return {
    ...default_favorites_config,
    ...config
  };
}

function processFavorites(config: MediaBrowserConfig): MediaBrowserConfig {
  let favorites_config = config.favorites;
  favorites_config = {
    ...DEFAULT_FAVORITES_CONFIG,
    ...favorites_config
  };
  favorites_config = {
    ...favorites_config,
    albums: processFavoriteItemConfig(favorites_config.albums),
    artists: processFavoriteItemConfig(favorites_config.artists),
    audiobooks: processFavoriteItemConfig(favorites_config.audiobooks),
    playlists: processFavoriteItemConfig(favorites_config.playlists),
    podcasts: processFavoriteItemConfig(favorites_config.podcasts),
    radios: processFavoriteItemConfig(favorites_config.radios),
    tracks: processFavoriteItemConfig(favorites_config.tracks)
  }
  return {
    ...config,
    favorites: favorites_config
  }
}
function processSections(config: MediaBrowserConfig): MediaBrowserConfig {
  let section_config = config.sections;
  section_config = [
    ...DEFAULT_CUSTOM_SECTION_CONFIG,
    ...section_config
  ]
  return {
    ...config,
    sections: section_config
  }
}
function processDefaults(config: MediaBrowserConfig) {
  return {
    ...DEFAULT_MEDIA_BROWSER_CONFIG,
    ...config
  }
}
export function processMediaBrowserConfig(config: Config): Config {
  let browser_config = config.media_browser;
  browser_config = processDefaults(browser_config);
  browser_config = processFavorites(browser_config);
  browser_config = processSections(browser_config);
  return {
    ...config,
    media_browser: browser_config
  }
}