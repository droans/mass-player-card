import { getArtistTracksServiceData } from "mass-queue-types/packages/mass_queue/actions/get_artist_tracks";
import {
  Album,
  Artist,
} from "mass-queue-types/packages/mass_queue/types/media-items";
import {
  baseMassQueueServiceSchema,
  baseMassQueueServiceWithResponseSchema,
  Track,
} from "mass-queue-types/packages/mass_queue/utils";
import { EnqueueOptions } from "./enums";
import { mediaCardData } from "./types";
import { getPlaylistTracksServiceData } from "mass-queue-types/packages/mass_queue/actions/get_playlist_tracks";
import { getPlaylistServiceData } from "mass-queue-types/packages/mass_queue/actions/get_playlist";

export type QueueService = (queue_item_id: string) => void;
export type QueueItemSelectedService = (queue_item_id: string) => void;

export type PlayerSelectedService = (player_entity: string) => void;

export type PlayerJoinService = (group_member: string[]) => Promise<void>;

export type PlayerUnjoinService = (player_entity: string[]) => Promise<void>;

export type PlayerTransferService = (target_player: string) => void;

export type BrowserItemSelectedService = (
  content_id: string,
  content_type: string,
) => void;

export type CardSelectedService = (
  data: mediaCardData,
  target: HTMLElement,
) => void;

export type CardEnqueueService = (
  data: mediaCardData,
  enqueue: EnqueueOptions,
) => void;
export type SimilarTracksEnqueueService = (
  contentIds: string | string[],
  enqueue: EnqueueOptions,
) => void;

export interface skipServiceData {
  entity: string;
  skip_seconds: number;
}

export interface getSimilarServiceData {
  config_entry_id: string;
  uri: string;
}

export interface getArtistAlbumsServiceData {
  config_entry_id: string;
  uri: string;
}

export interface setCrossfadeServiceData {
  entity: string;
  enabled: boolean;
}

export type setAutoplayServiceData = setCrossfadeServiceData;

export interface setCrossfadeServiceSchema extends baseMassQueueServiceSchema {
  service: "set_crossfade";
  service_data: setCrossfadeServiceData;
}

export interface setAutoplayServiceSchema extends baseMassQueueServiceSchema {
  service: "set_autoplay";
  service_data: setAutoplayServiceData;
}

export interface skipServiceSchema extends baseMassQueueServiceSchema {
  service: "skip";
  service_data: skipServiceData;
}
export interface getDynamicPlaylistTracksServiceSchema extends baseMassQueueServiceWithResponseSchema {
  service: "get_dynamic_playlist_tracks";
  service_data: getPlaylistTracksServiceData;
}

export interface getDynamicPlaylistServiceSchema extends baseMassQueueServiceWithResponseSchema {
  service: "get_dynamic_playlist";
  service_data: getPlaylistServiceData;
}

export interface getSimilarArtistsServiceSchema extends baseMassQueueServiceWithResponseSchema {
  service: "get_similar_artists";
  service_data: getSimilarServiceData;
}
export interface getSimilarTracksServiceSchema extends baseMassQueueServiceWithResponseSchema {
  service: "get_similar_tracks";
  service_data: getSimilarServiceData;
}
export interface getArtistAlbumsServiceSchema extends baseMassQueueServiceWithResponseSchema {
  service: "get_artist_albums";
  service_data: getSimilarServiceData;
}

export interface getArtistTopTracksServiceSchema extends baseMassQueueServiceWithResponseSchema {
  service: "get_artist_top_tracks";
  service_data: getArtistTracksServiceData;
}

export interface getArtistAlbumsServiceResponse {
  response: { albums: Album[] };
}

export interface getSimilarArtistsServiceResponse {
  response: { artists: Artist[] };
}

export interface getSimilarTracksServiceResponse {
  response: { artists: Track[] };
}

export interface getQueueInfoWSServiceSchema {
  type: "mass_queue/get_queue_info";
  entity_id: string;
}

export interface getQueueInfoWSServiceResponseSchema {
  autoplay_enabled: boolean;
  crossfade_enabled: boolean;
  display_name: string;
  ended: boolean;
  flow_mode: boolean;
  playback_speed: number;
  smart_fades_active: boolean;
  smart_shuffle_active: boolean;
}
