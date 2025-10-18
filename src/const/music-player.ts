import { SlCarouselItem } from "@shoelace-style/shoelace";
import { RepeatMode } from "./common";


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
    index: number,
    slide: SlCarouselItem
  },
  timeStamp: number
}

export const SWIPE_MIN_X = 100;
export const DEFAULT_MAX_VOLUME = 100;
export const MARQUEE_DELAY_MS = 2000;
export const SWIPE_MIN_DELAY = 300;

export const INACTIVE_MESSAGES = [
  `Except the sound of silence.`,
  `It's just so quiet in here.`,
  `Are you seeing other players?`,
  `Please don't leave me alone with my thoughts.`,
  `I hope you don't have tinnitus.`,
  `Why not do something productive instead?`,
  `Let's use our imagination instead.`
]