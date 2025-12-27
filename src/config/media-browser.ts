import { mdiCreation, mdiHeart, mdiHistory } from "@mdi/js";

import { Config } from "./config";
import { hiddenElementsConfigItem } from "../utils/config";

export interface MediaBrowserConfig {
  enabled: boolean;
  favorites: FavoritesConfig;
  recents: FavoritesConfig;
  recommendations: RecommendationsConfig;
  sections: customSection[];
  hide: MediaBrowserHiddenElementsConfig;
  columns: number;
}

export interface FavoritesConfig {
  enabled: boolean;
  albums: FavoriteItemConfig;
  artists: FavoriteItemConfig;
  audiobooks: FavoriteItemConfig;
  playlists: FavoriteItemConfig;
  podcasts: FavoriteItemConfig;
  radios: FavoriteItemConfig;
  tracks: FavoriteItemConfig;
}
export interface FavoriteItemConfig {
  enabled: boolean;
  limit: number;
  favorites_only: boolean;
  items: customItem[];
}
export interface customItem {
  name: string;
  image: string;
  media_content_id: never;
  media_content_type: never;
  service: never;
}

export interface RecommendationsConfig {
  enabled: boolean;
  providers?: string[];
}

export interface customSection {
  name: string;
  image: string;
  items: customItem[];
}

export interface MediaBrowserHiddenElementsConfig {
  back_button: boolean;
  search: boolean;
  recents: boolean;
  titles: boolean;
  enqueue_menu: boolean;
  add_to_queue_button: boolean;
  play_next_button: boolean;
  play_next_clear_queue_button: boolean;
  play_now_button: boolean;
  play_now_clear_queue_button: boolean;
}

export const DEFAULT_FAVORITE_ITEM_CONFIG: FavoriteItemConfig = {
  enabled: true,
  limit: 25,
  items: [],
  favorites_only: true,
};

const DEFAULT_FAVORITES_CONFIG: FavoritesConfig = {
  enabled: true,
  albums: DEFAULT_FAVORITE_ITEM_CONFIG,
  artists: DEFAULT_FAVORITE_ITEM_CONFIG,
  audiobooks: DEFAULT_FAVORITE_ITEM_CONFIG,
  playlists: DEFAULT_FAVORITE_ITEM_CONFIG,
  podcasts: DEFAULT_FAVORITE_ITEM_CONFIG,
  radios: DEFAULT_FAVORITE_ITEM_CONFIG,
  tracks: DEFAULT_FAVORITE_ITEM_CONFIG,
};

export const DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG: MediaBrowserHiddenElementsConfig =
  {
    back_button: false,
    search: false,
    recents: false,
    titles: false,
    enqueue_menu: false,
    add_to_queue_button: false,
    play_next_button: false,
    play_next_clear_queue_button: false,
    play_now_button: false,
    play_now_clear_queue_button: false,
  };

export const HIDDEN_BUTTON_VALUE = {
  add: "add_to_queue_button",
  play: "play_now_button",
  next: "play_next_button",
  replace: "play_now_clear_queue_button",
  replace_next: "play_next_clear_queue_button",
};

const DEFAULT_CUSTOM_SECTION_CONFIG = [];

const DEFAULT_RECOMMENDATIONS_CONFIG: RecommendationsConfig = {
  enabled: true,
};

export const DEFAULT_MEDIA_BROWSER_CONFIG: MediaBrowserConfig = {
  enabled: true,
  favorites: DEFAULT_FAVORITES_CONFIG,
  recents: DEFAULT_FAVORITES_CONFIG,
  recommendations: DEFAULT_RECOMMENDATIONS_CONFIG,
  sections: DEFAULT_CUSTOM_SECTION_CONFIG,
  hide: DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG,
  columns: 2,
};

const MEDIA_BROWSER_HIDDEN_ITEMS = [
  "back_button",
  "search",
  "titles",
  "enqueue_menu",
  "add_to_queue_button",
  "play_now_button",
  "play_now_clear_queue_button",
  "play_next_button",
  "play_next_clear_queue_button",
];

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
          {
            name: "limit",
            selector: { number: { min: 0, max: 500, mode: "box" } },
          },
        ],
      },
    ],
  };
}

function recommendationsConfigForm() {
  return {
    name: "recommendations",
    type: "expandable",
    iconPath: mdiCreation,
    schema: [
      {
        name: "enabled",
        selector: { boolean: {} },
        default: true,
      },
      {
        name: "providers",
        selector: { text: { multiple: true } },
      },
    ],
  };
}

export function mediaBrowserConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} }, default: true },
    { name: "columns", selector: { number: { min: 1, max: 10, mode: "box" } } },
    {
      name: "favorites",
      type: "expandable",
      iconPath: mdiHeart,
      schema: [
        favoritesConfigForm("albums"),
        favoritesConfigForm("artists"),
        favoritesConfigForm("audiobooks"),
        favoritesConfigForm("playlists"),
        favoritesConfigForm("podcasts"),
        favoritesConfigForm("radios"),
        favoritesConfigForm("tracks"),
      ],
    },
    {
      name: "recents",
      type: "expandable",
      iconPath: mdiHistory,
      schema: [
        favoritesConfigForm("album"),
        favoritesConfigForm("artists"),
        favoritesConfigForm("audiobooks"),
        favoritesConfigForm("playlists"),
        favoritesConfigForm("podcasts"),
        favoritesConfigForm("radios"),
        favoritesConfigForm("tracks"),
      ],
    },
    recommendationsConfigForm(),
    hiddenElementsConfigItem(MEDIA_BROWSER_HIDDEN_ITEMS),
  ];
}

function processRecommendations(
  config: MediaBrowserConfig,
): MediaBrowserConfig {
  const recommendations_config = config.recommendations;
  return {
    ...config,
    recommendations: {
      ...DEFAULT_RECOMMENDATIONS_CONFIG,
      ...recommendations_config,
    },
  };
}

function processHiddenElementsConfig(
  config: MediaBrowserConfig,
): MediaBrowserConfig {
  const hidden_elements_config = config.hide;
  return {
    ...config,
    hide: {
      ...DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG,
      ...hidden_elements_config,
    },
  };
}

function processFavoriteItemConfig(config: FavoriteItemConfig) {
  const default_favorites_config = DEFAULT_FAVORITE_ITEM_CONFIG;
  return {
    ...default_favorites_config,
    ...config,
  };
}

function processFavorites(config: MediaBrowserConfig): MediaBrowserConfig {
  let favorites_config = config.favorites;
  favorites_config = {
    ...DEFAULT_FAVORITES_CONFIG,
    ...favorites_config,
  };
  favorites_config = {
    ...favorites_config,
    albums: processFavoriteItemConfig(favorites_config.albums),
    artists: processFavoriteItemConfig(favorites_config.artists),
    audiobooks: processFavoriteItemConfig(favorites_config.audiobooks),
    playlists: processFavoriteItemConfig(favorites_config.playlists),
    podcasts: processFavoriteItemConfig(favorites_config.podcasts),
    radios: processFavoriteItemConfig(favorites_config.radios),
    tracks: processFavoriteItemConfig(favorites_config.tracks),
  };
  return {
    ...config,
    favorites: favorites_config,
  };
}
function processSections(config: MediaBrowserConfig): MediaBrowserConfig {
  let section_config = config.sections;
  section_config = [...DEFAULT_CUSTOM_SECTION_CONFIG, ...section_config];
  return {
    ...config,
    sections: section_config,
  };
}
function processDefaults(config: MediaBrowserConfig) {
  return {
    ...DEFAULT_MEDIA_BROWSER_CONFIG,
    ...config,
  };
}
export function processMediaBrowserConfig(config: Config): Config {
  let browser_config = config.media_browser;
  browser_config = processDefaults(browser_config);
  browser_config = processFavorites(browser_config);
  browser_config = processSections(browser_config);
  browser_config = processRecommendations(browser_config);
  browser_config = processHiddenElementsConfig(browser_config);
  return {
    ...config,
    media_browser: browser_config,
  };
}
