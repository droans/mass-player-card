import { HomeAssistant } from "custom-card-helpers";
import { RepeatMode } from "./const";

export interface Config {
  entities: Array<string>;
  queue: QueueConfig;
  player: PlayerConfig;
}

export interface QueueConfig {
  enabled: boolean;
  limit_before: number;
  limit_after: number;
  show_album_covers: boolean;
  show_artist_names: boolean;
}

export interface PlayerConfig {
  enabled: boolean;
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
}

export interface QueueSection {
  active_player_entity: string;
  config: QueueConfig;
  hass: HomeAssistant;
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
  
}

export type QueueService = (
  queue_item_id: string
) => void;
export type ItemSelectedService = (
  queue_item_id: string, 
  media_content_id: string
) => void;

export type PlayerSelectedService = (
  player_entity: string
) => void