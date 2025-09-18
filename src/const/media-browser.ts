import { TemplateResult } from "lit";
import {  Icon, MediaTypes } from "./common";


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