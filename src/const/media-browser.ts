import { TemplateResult } from "lit";
import {  Icons, MediaTypes } from "./common";


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
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type MediaCardData = Record<string, any>
export interface MediaCardItem {
  title: string,
  icon: string,
  fallback: Icons,
  data: MediaCardData,
  background?: TemplateResult
}
export interface MediaBrowserItemsConfig {
  main: MediaCardItem[],
  [str: string]: MediaCardItem[]
}

export const MediaTypeIcons = {
  'album': Icons.DISC,
  'artist': Icons.MICROPHONE,
  'audiobook': Icons.BOOK,
  'playlist': Icons.PLAYLIST,
  'podcast': Icons.MICROPHONE_MAGIC,
  'track': Icons.CLEFT,
  'radio': Icons.RADIO,
}