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