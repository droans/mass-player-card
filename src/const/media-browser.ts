import { TemplateResult } from "lit";

import { EnqueueOptions } from "./actions";
import { Thumbnail, MediaTypes, ExtendedHass } from "./common";
import { Icons } from "./icons.js";
import { getTranslation } from "../utils/translations.js";
import { MediaBrowserConfig } from "../config/media-browser.js";
import {
  getRecommendationsServiceResponse,
  recommendationItem,
  recommendationItems,
  recommendationSection,
} from "mass-queue-types/packages/actions/get_recommendations";

export interface MediaBrowserItem {
  name: string;
  media_content_id: string;
  media_content_type: MediaTypes;
  image: string;
}
export interface FavoriteItems {
  albums: MediaBrowserItem[];
  artists: MediaBrowserItem[];
  audiobooks: MediaBrowserItem[];
  playlists: MediaBrowserItem[];
  podcasts: MediaBrowserItem[];
  radios: MediaBrowserItem[];
  tracks: MediaBrowserItem[];
}
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type MediaCardData = Record<string, any>;
export interface MediaCardItem {
  title: string;
  thumbnail: string;
  fallback: Thumbnail;
  data: MediaCardData;
  background?: TemplateResult;
}

export interface mediaBrowserSectionConfig {
  main: MediaCardItem[];
  [str: string]: MediaCardItem[];
}
export interface newMediaBrowserItemsConfig {
  favorites: mediaBrowserSectionConfig;
  recents: mediaBrowserSectionConfig;
  recommendations: mediaBrowserSectionConfig;
  search: MediaCardItem[];
}
export interface MediaBrowserItemsConfig {
  main: MediaCardItem[];
  [str: string]: MediaCardItem[];
}
export interface MediaLibraryItem {
  name: string;
  image: string;
  uri: string;
  media_type: string;
}

export const MediaTypeThumbnails = {
  album: Thumbnail.DISC,
  artist: Thumbnail.PERSON,
  audiobook: Thumbnail.BOOK,
  playlist: Thumbnail.PLAYLIST,
  podcast: Thumbnail.MICROPHONE_MAGIC,
  track: Thumbnail.CLEFT,
  radio: Thumbnail.RADIO,
};

export interface ListItemData {
  option: string;
  icon: string;
  title: string;
}

export type RecommendationItem = recommendationItem;
export type RecommendationItems = recommendationItems;
export type RecommendationSection = recommendationSection;

export type RecommendationResponse = getRecommendationsServiceResponse;

export type ListItems = ListItemData[];
/* eslint-disable
  @typescript-eslint/no-unsafe-assignment
*/
export function getEnqueueButtons(icons: Icons, hass: ExtendedHass): ListItems {
  return [
    {
      option: EnqueueOptions.PLAY_NOW,
      icon: icons.PLAY_CIRCLE_OUTLINE,
      title: getTranslation("browser.enqueue.play", hass),
    },
    {
      option: EnqueueOptions.PLAY_NEXT,
      icon: icons.SKIP_NEXT_CIRCLE_OUTLINED,
      title: getTranslation("browser.enqueue.next", hass),
    },
    {
      option: EnqueueOptions.PLAY_NOW_CLEAR_QUEUE,
      icon: icons.PLAY_CIRCLE,
      title: getTranslation("browser.enqueue.play_clear", hass),
    },
    {
      option: EnqueueOptions.PLAY_NEXT_CLEAR_QUEUE,
      icon: icons.SKIP_NEXT_CIRCLE,
      title: getTranslation("browser.enqueue.next_clear", hass),
    },
    {
      option: EnqueueOptions.ADD_TO_QUEUE,
      icon: icons.PLAYLIST_PLUS,
      title: getTranslation("browser.enqueue.queue", hass),
    },
    {
      option: EnqueueOptions.RADIO,
      icon: icons.RADIO,
      title: getTranslation("browser.enqueue.radio", hass),
    },
  ];
}
export function getSearchMediaButtons(
  icons: Icons,
  hass: ExtendedHass,
): ListItems {
  return [
    {
      option: MediaTypes.ALBUM,
      icon: icons.ALBUM,
      title: getTranslation("browser.sections.album", hass),
    },
    {
      option: MediaTypes.ARTIST,
      icon: icons.ARTIST,
      title: getTranslation("browser.sections.artist", hass),
    },
    {
      option: MediaTypes.AUDIOBOOK,
      icon: icons.BOOK,
      title: getTranslation("browser.sections.audiobook", hass),
    },
    {
      option: MediaTypes.PLAYLIST,
      icon: icons.PLAYLIST,
      title: getTranslation("browser.sections.playlist", hass),
    },
    {
      option: MediaTypes.PODCAST,
      icon: icons.PODCAST,
      title: getTranslation("browser.sections.podcast", hass),
    },
    {
      option: MediaTypes.RADIO,
      icon: icons.RADIO,
      title: getTranslation("browser.sections.radio", hass),
    },
    {
      option: MediaTypes.TRACK,
      icon: icons.MUSIC,
      title: getTranslation("browser.sections.track", hass),
    },
  ];
}
export function getFilterButtons(
  icons: Icons,
  hass: ExtendedHass,
  config: MediaBrowserConfig,
): ListItems {
  const result: ListItems = [];
  if (config.favorites.enabled) {
    result.push({
      option: "favorites",
      icon: icons.HEART,
      title: getTranslation("browser.card.favorites", hass),
    });
  }
  if (config.recents.enabled) {
    result.push({
      option: "recents",
      icon: icons.RECENTS,
      title: getTranslation("browser.card.recents", hass),
    });
  }
  if (config.recommendations.enabled) {
    result.push({
      option: "recommendations",
      icon: icons.SUGGESTIONS,
      title: getTranslation("browser.card.recommendations", hass),
    });
  }
  return result;
}
/* eslint-enable
  @typescript-eslint/no-unsafe-assignment
*/

export const SEARCH_UPDATE_DELAY = 1000;
export const DEFAULT_SEARCH_LIMIT = 20;
export const SEARCH_TERM_MIN_LENGTH = 3;

export const DEFAULT_ACTIVE_SECTION = "favorites";
export const DEFAULT_ACTIVE_SUBSECTION = "main";
