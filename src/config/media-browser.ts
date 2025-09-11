import { mdiHeart } from "@mdi/js";
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
  limit: number
}
export const DEFAULT_FAVORITE_ITEM_CONFIG: FavoriteItemConfig = {
  enabled: true,
  limit: 25
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

function processFavorites(config: FavoritesConfig) {
  config = {
    ...DEFAULT_FAVORITES_CONFIG,
    ...config
  };
  const result: FavoritesConfig = {
    enabled: config?.enabled ?? true,
    albums: processFavoriteItemConfig(config.albums),
    artists: processFavoriteItemConfig(config.artists),
    audiobooks: processFavoriteItemConfig(config.audiobooks),
    playlists: processFavoriteItemConfig(config.playlists),
    podcasts: processFavoriteItemConfig(config.podcasts),
    radios: processFavoriteItemConfig(config.radios),
    tracks: processFavoriteItemConfig(config.tracks)
  }
  return result;
}
function processSections(config: customSection[]) {
  return [
    ...DEFAULT_CUSTOM_SECTION_CONFIG,
    ...config
  ];
}
export function processMediaBrowserConfig(config: MediaBrowserConfig) {
  config = {
    ...DEFAULT_MEDIA_BROWSER_CONFIG,
    ...config
  }
  const result: MediaBrowserConfig = {
    enabled: config?.enabled ?? true,
    favorites: processFavorites(config.favorites),
    sections: processSections(config.sections)
  }
  return result;
}