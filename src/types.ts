import { HomeAssistant } from "custom-card-helpers";
import { MediaTypes, RepeatMode } from "./const";

export interface Config {
  entities: string[];
  queue: QueueConfig;
  player: PlayerConfig;
  media_browser: MediaBrowserConfig;
  players: PlayersConfig;
}

export interface QueueConfig {
  enabled: boolean;
  limit_before: number;
  limit_after: number;
  show_album_covers: boolean;
  show_artist_names: boolean;
}

export interface MediaBrowserConfig {
  enabled: boolean,
  favorites: FavoritesConfig;
}

export interface PlayersConfig {
  enabled: boolean,
}

interface FavoritesConfig {
  enabled: boolean,
  albums: FavoriteItemConfig,
  artists: FavoriteItemConfig,
  audiobooks: FavoriteItemConfig,
  playlists: FavoriteItemConfig,
  podcasts: FavoriteItemConfig,
  radios: FavoriteItemConfig
  tracks: FavoriteItemConfig,
}

interface FavoriteItemConfig {
  enabled: boolean
}

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
  volume: number;
  
}

export type QueueService = (
  queue_item_id: string
) => void;
export type QueueItemSelectedService = (
  queue_item_id: string, 
  media_content_id: string
) => void;

export type PlayerSelectedService = (
  player_entity: string
) => void

export type PlayerJoinService = (
  group_member: string
) => void

export type PlayerUnjoinService = (
  player_entity: string
) => void

export type PlayerTransferService = (
  target_player: string
) => void

export type BrowserItemSelectedService = (
  content_id: string,
  content_type: string
) => void