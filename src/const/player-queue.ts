import { ExtendedHass } from "./common";

export interface QueueConfig {
  enabled: boolean;
  limit_before: number;
  limit_after: number;
  show_album_covers: boolean;
  show_artist_names: boolean;
}
export const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  enabled: true,
  limit_before: 5,
  limit_after: 100,
  show_album_covers: true,
  show_artist_names: true
}
export interface QueueItem {
  media_title: string;
  media_album_name: string;
  media_artist: string;
  media_content_id: string;
  playing: boolean;
  queue_item_id: string;
  media_image: string;
  show_action_buttons: boolean;
  show_artist_name: boolean
  show_move_up_next: boolean;
  favorite: boolean;
}
export interface QueueSection {
  active_player_entity: string;
  config: QueueConfig;
  hass: ExtendedHass;
}

export interface MassQueueEvent {
  data: {
    type: string,
    data: {
      queue_id: string
    }
  }
}