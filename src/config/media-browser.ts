export interface MediaBrowserConfig {
  enabled: boolean,
  favorites: FavoritesConfig;
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
}

export const DEFAULT_MEDIA_BROWSER_CONFIG: MediaBrowserConfig = {
  enabled: true,
  favorites: {
    enabled: true,
    albums: DEFAULT_FAVORITE_ITEM_CONFIG,
    artists: DEFAULT_FAVORITE_ITEM_CONFIG,
    audiobooks: DEFAULT_FAVORITE_ITEM_CONFIG,
    playlists: DEFAULT_FAVORITE_ITEM_CONFIG,
    podcasts: DEFAULT_FAVORITE_ITEM_CONFIG,
    radios: DEFAULT_FAVORITE_ITEM_CONFIG,
    tracks: DEFAULT_FAVORITE_ITEM_CONFIG,
  }
}

function favoritesConfigForm(section: string) {
  return {
    name: section,
    type: "expandable",
    schema: [ { name: "enabled", description: { suffix: section}, selector: { boolean: {} }, default: true } ]
  }
}
export function mediaBrowserConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} } },
    favoritesConfigForm("album"),
    favoritesConfigForm("artists"),
    favoritesConfigForm("audiobooks"),
    favoritesConfigForm("playlists"),
    favoritesConfigForm("podcasts"),
    favoritesConfigForm("radios"),
    favoritesConfigForm("tracks"),

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
export function processMediaBrowserConfig(config: MediaBrowserConfig) {
  const result: MediaBrowserConfig = {
    enabled: config?.enabled ?? true,
    favorites: processFavorites(config.favorites)
  }
  return result;
}