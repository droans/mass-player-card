
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
  Thumbnail,
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
  thumbnail: string,
  fallback: Thumbnail,
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
  thumbnail: string,
  title: string
}

export type ListItems = ListItemData[];

export const ENQUEUE_BUTTONS: ListItems = [
  {
    option: EnqueueOptions.PLAY_NOW,
    thumbnail: mdiPlayCircleOutline,
    title: "Play Now"
  },
  {
    option: EnqueueOptions.PLAY_NEXT,
    thumbnail: mdiSkipNextCircleOutline,
    title: "Play Next"
  },
  {
    option: EnqueueOptions.PLAY_NOW_CLEAR_QUEUE,
    thumbnail: mdiPlayCircle,
    title: "Play Now & Clear Queue"
  },
  {
    option: EnqueueOptions.PLAY_NEXT_CLEAR_QUEUE,
    thumbnail: mdiSkipNextCircle,
    title: "Play Next & Clear Queue"
  },
  {
    option: EnqueueOptions.ADD_TO_QUEUE,
    thumbnail: mdiPlaylistPlus,
    title: "Add to Queue"
  },
]

export const SEARCH_MEDIA_TYPE_BUTTONS: ListItems = [
  {
    option: MediaTypes.ALBUM,
    thumbnail: mdiAlbum,
    title: 'Albums'
  },
  {
    option: MediaTypes.ARTIST,
    thumbnail: mdiAccountMusic,
    title: 'Artists'
  },
  {
    option: MediaTypes.AUDIOBOOK,
    thumbnail: mdiBook,
    title: 'Audiobooks'
  },
  {
    option: MediaTypes.PLAYLIST,
    thumbnail: mdiPlaylistMusic,
    title: 'Playlists'
  },
  {
    option: MediaTypes.PODCAST,
    thumbnail: mdiPodcast,
    title: 'Podcasts'
  },
  {
    option: MediaTypes.RADIO,
    thumbnail: mdiRadio,
    title: 'Radio'
  },
  {
    option: MediaTypes.TRACK,
    thumbnail: mdiMusic,
    title: 'Tracks'
  },

]

export const SEARCH_UPDATE_DELAY = 1000;
export const DEFAULT_SEARCH_LIMIT = 20;
export const SEARCH_TERM_MIN_LENGTH = 3;