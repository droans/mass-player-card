import { SlCarouselItem } from "@shoelace-style/shoelace";
import { RepeatMode } from "./common";
import { ImageURLWithFallback } from "../utils/thumbnails.js";

export interface ForceUpdatePlayerDataEvent extends CustomEvent {
  detail: ForceUpdatePlayerDataEventData;
}
export interface ForceUpdatePlayerDataEventData {
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,
  value: any;
}
export interface PlayerData {
  playing: boolean;
  muted: boolean;
  track_title: string;
  track_artist: string;
  track_album: string;
  track_artwork: string;
  shuffle: boolean;
  repeat: RepeatMode;
  player_name: string;
  volume: number;
  favorite: boolean;
}

export interface SLSwipeEvent {
  detail: {
    index: number;
    slide: SlCarouselItem;
  };
  timeStamp: number;
  stopPropagation(): void;
}

export interface PlaylistDialogItem {
  image: ImageURLWithFallback;
  name: string;
  uri: string;
}

export interface MassGetQueueServiceDataSchema {
      type: "call_service",
      domain: "music_assistant",
      service: "get_queue",
      service_data: {
        entity_id: string,
      },
      return_response: true,
}

interface massQueueItem {
  elapsed_time: number,
  current_item: {
    duration: number,
    media_item: {
      favorite: boolean;
    }
  }
}

export interface MassGetQueueServiceResponseSchema {
  response: Record<string, massQueueItem>
}

export const SWIPE_MIN_X = 100;
export const DEFAULT_MAX_VOLUME = 100;
export const MARQUEE_DELAY_MS = 2000;
export const SWIPE_MIN_DELAY = 300;
export const PLAYLIST_DIALOG_MAX_ITEMS = 20;