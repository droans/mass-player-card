import { MediaCardData } from "./types";

export enum EnqueueOptions {
  PLAY_NOW = "play",
  PLAY_NOW_CLEAR_QUEUE = "replace",
  PLAY_NEXT = "next",
  PLAY_NEXT_CLEAR_QUEUE = "replace_next",
  ADD_TO_QUEUE = "add",
  RADIO = "radio",
}

export type QueueService = (queue_item_id: string) => void;
export type QueueItemSelectedService = (queue_item_id: string) => void;

export type PlayerSelectedService = (player_entity: string) => void;

export type PlayerJoinService = (group_member: string) => Promise<void>;

export type PlayerUnjoinService = (player_entity: string) => Promise<void>;

export type PlayerTransferService = (target_player: string) => void;

export type BrowserItemSelectedService = (
  content_id: string,
  content_type: string,
) => void;

export type CardSelectedService = (
  data: MediaCardData,
) => void;

export type CardEnqueueService = (
  data: MediaCardData,
  enqueue: EnqueueOptions,
) => void;
