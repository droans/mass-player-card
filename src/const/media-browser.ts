import { TemplateResult } from "lit";

import { EnqueueOptions } from "./actions";
import {
  Thumbnail,
  MediaTypes
} from "./common";
import { Icons } from "./icons.js";

export interface MediaBrowserItem {
  name: string,
  media_content_id: string,
  media_content_type: MediaTypes,
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
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type MediaCardData = Record<string, any>
export interface MediaCardItem {
  title: string,
  thumbnail: string,
  fallback: Thumbnail,
  data: MediaCardData,
  background?: TemplateResult
}

export interface mediaBrowserSectionConfig {
  main: MediaCardItem[],
  [str: string]: MediaCardItem[],
}
export interface newMediaBrowserItemsConfig {
  favorites: mediaBrowserSectionConfig,
  recents: mediaBrowserSectionConfig,
  recommendations: mediaBrowserSectionConfig,
  search: MediaCardItem[],
}
export interface MediaBrowserItemsConfig {
  main: MediaCardItem[],
  [str: string]: MediaCardItem[]
}
export interface MediaLibraryItem {
  name: string,
  image: string,
  uri: string,
  media_type: string
}

export const MediaTypeThumbnails = {
  'album': Thumbnail.DISC,
  'artist': Thumbnail.PERSON,
  'audiobook': Thumbnail.BOOK,
  'playlist': Thumbnail.PLAYLIST,
  'podcast': Thumbnail.MICROPHONE_MAGIC,
  'track': Thumbnail.CLEFT,
  'radio': Thumbnail.RADIO,
}

export interface ListItemData {
  option: string,
  icon: string,
  title: string
}

export interface RecommendationItem {
  item_id: string;
  name: string;
  sort_name: string;
  uri: string;
  media_type: string;
  image: string
}
export type RecommendationItems = RecommendationItem[]
export interface RecommendationSection {
  item_id: string;
  provider: string;
  sort_name: string;
  name: string;
  uri: string;
  icon: string;
  image: string | null;
  items: RecommendationItems;
}
export interface RecommendationResponse {
  response: {response: RecommendationSection[]}
}

export type ListItems = ListItemData[];

export function getEnqueueButtons(icons: Icons): ListItems {
  return [
    {
      option: EnqueueOptions.PLAY_NOW,
      icon: icons.PLAY_CIRCLE_OUTLINE,
      title: "Play Now"
    },
    {
      option: EnqueueOptions.PLAY_NEXT,
      icon: icons.SKIP_NEXT_CIRCLE_OUTLINED,
      title: "Play Next"
    },
    {
      option: EnqueueOptions.PLAY_NOW_CLEAR_QUEUE,
      icon: icons.PLAY_CIRCLE,
      title: "Play Now & Clear Queue"
    },
    {
      option: EnqueueOptions.PLAY_NEXT_CLEAR_QUEUE,
      icon: icons.SKIP_NEXT_CIRCLE,
      title: "Play Next & Clear Queue"
    },
    {
      option: EnqueueOptions.ADD_TO_QUEUE,
      icon: icons.PLAYLIST_PLUS,
      title: "Add to Queue"
    },
    {
      option: EnqueueOptions.RADIO,
      icon: icons.RADIO,
      title: "Play Radio"
    }
  ]
}
export function getSearchMediaButtons(icons: Icons): ListItems {
  return [
    {
      option: MediaTypes.ALBUM,
      icon: icons.ALBUM,
      title: 'Albums'
    },
    {
      option: MediaTypes.ARTIST,
      icon: icons.ARTIST,
      title: 'Artists'
    },
    {
      option: MediaTypes.AUDIOBOOK,
      icon: icons.BOOK,
      title: 'Audiobooks'
    },
    {
      option: MediaTypes.PLAYLIST,
      icon: icons.PLAYLIST,
      title: 'Playlists'
    },
    {
      option: MediaTypes.PODCAST,
      icon: icons.PODCAST,
      title: 'Podcasts'
    },
    {
      option: MediaTypes.RADIO,
      icon: icons.RADIO,
      title: 'Radio'
    },
    {
      option: MediaTypes.TRACK,
      icon: icons.MUSIC,
      title: 'Tracks'
    },

  ]
}
export function getFilterButtons(icons: Icons): ListItems {
  return [
    {
      option: "favorites",
      icon: icons.HEART,
      title: "Favorites"
    },{
      option: "recents",
      icon: icons.RECENTS,
      title: "Recents"
    },{
      option: "recommendations",
      icon: icons.SUGGESTIONS,
      title: "Recommendations"
    },
  ]
}

export const SEARCH_UPDATE_DELAY = 1000;
export const DEFAULT_SEARCH_LIMIT = 20;
export const SEARCH_TERM_MIN_LENGTH = 3;