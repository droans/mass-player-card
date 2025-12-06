import { ExtendedHass } from "./common";
import { QueueConfig } from "../config/player-queue";
import { queueItem } from "mass-queue-types/packages/mass_queue/actions/get_queue_items";

export { getQueueItemsServiceResponse } from "mass-queue-types/packages/mass_queue/actions/get_queue_items";

export interface QueueItem extends queueItem {
  playing: boolean;
  show_action_buttons: boolean;
  show_artist_name: boolean;
  show_move_up_next: boolean;
}

export interface QueueSection {
  active_player_entity: string;
  config: QueueConfig;
  hass: ExtendedHass;
}

export type QueueItems = QueueItem[];

export const MAX_GET_QUEUE_FAILURES = 6;
export const MUSIC_ASSISTANT_APP_NAME = "music_assistant";
export const TIMED_LISTENER_DELAY_MS = 10000;
