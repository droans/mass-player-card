import { baseMassQueueServiceSchema } from "mass-queue-types/packages/mass_queue/utils";
import { EnqueueOptions } from "./enums";
import { mediaCardData } from "./types";

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

export interface skipServiceData {
  entity: string;
  skip_seconds: number;
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
