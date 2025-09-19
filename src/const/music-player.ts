import { RepeatMode } from "./common";

export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
  enabled: true
}
export interface PlayerConfig {
  enabled: boolean;
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

export const SWIPE_MIN_X = 100;
export const DEFAULT_MAX_VOLUME = 100;
export const MARQUEE_DELAY_MS = 2000;