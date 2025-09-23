
import {
  mdiAccountMusic,
  mdiAlbum,
  mdiBook,
  mdiMusic,
  mdiPlayCircle,
  mdiPlayCircleOutline,
  mdiPlaylistMusic,
  mdiPlaylistPlus,
  mdiPodcast,
  mdiRadio,
  mdiSkipNextCircle,
  mdiSkipNextCircleOutline
} from "@mdi/js";
import { TemplateResult } from "lit";

import { EnqueueOptions } from "./actions";
import {
  Icon,
  MediaTypes
} from "./common";

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
  icon: string,
  fallback: Icon,
  data: MediaCardData,
  background?: TemplateResult
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

export const MediaTypeIcons = {
  'album': Icon.DISC,
  'artist': Icon.PERSON,
  'audiobook': Icon.BOOK,
  'playlist': Icon.PLAYLIST,
  'podcast': Icon.MICROPHONE_MAGIC,
  'track': Icon.CLEFT,
  'radio': Icon.RADIO,
}

export interface ListItemData {
  option: string,
  icon: string,
  title: string
}

export type ListItems = ListItemData[];

export const ENQUEUE_BUTTONS: ListItems = [
  {
    option: EnqueueOptions.PLAY_NOW,
    icon: mdiPlayCircleOutline,
    title: "Play Now"
  },
  {
    option: EnqueueOptions.PLAY_NEXT,
    icon: mdiSkipNextCircleOutline,
    title: "Play Next"
  },
  {
    option: EnqueueOptions.PLAY_NOW_CLEAR_QUEUE,
    icon: mdiPlayCircle,
    title: "Play Now & Clear Queue"
  },
  {
    option: EnqueueOptions.PLAY_NEXT_CLEAR_QUEUE,
    icon: mdiSkipNextCircle,
    title: "Play Next & Clear Queue"
  },
  {
    option: EnqueueOptions.ADD_TO_QUEUE,
    icon: mdiPlaylistPlus,
    title: "Add to Queue"
  },
]

export const SEARCH_MEDIA_TYPE_BUTTONS: ListItems = [
  {
    option: MediaTypes.ALBUM,
    icon: mdiAlbum,
    title: 'Albums'
  },
  {
    option: MediaTypes.ARTIST,
    icon: mdiAccountMusic,
    title: 'Artists'
  },
  {
    option: MediaTypes.AUDIOBOOK,
    icon: mdiBook,
    title: 'Audiobooks'
  },
  {
    option: MediaTypes.PLAYLIST,
    icon: mdiPlaylistMusic,
    title: 'Playlists'
  },
  {
    option: MediaTypes.PODCAST,
    icon: mdiPodcast,
    title: 'Podcasts'
  },
  {
    option: MediaTypes.RADIO,
    icon: mdiRadio,
    title: 'Radio'
  },
  {
    option: MediaTypes.TRACK,
    icon: mdiMusic,
    title: 'Tracks'
  },

]

export const SEARCH_UPDATE_DELAY = 1000;
export const DEFAULT_SEARCH_LIMIT = 20;
export const SEARCH_TERM_MIN_LENGTH = 3;