import { EnqueueOptions } from "./enums";
import { MediaCardData } from "./types";


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
