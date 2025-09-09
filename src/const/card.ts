import { DEFAULT_MEDIA_BROWSER_CONFIG, MediaBrowserConfig } from "./media-browser";
import { DEFAULT_PLAYER_CONFIG, PlayerConfig } from "./music-player";
import { DEFAULT_QUEUE_CONFIG, QueueConfig } from "./player-queue";
import { DEFAULT_PLAYERS_CONFIG, PlayersConfig } from "./players";

export interface Config {
  entities: string[];
  queue: QueueConfig;
  player: PlayerConfig;
  media_browser: MediaBrowserConfig;
  players: PlayersConfig;
}

export const DEFAULT_CONFIG = {
  queue: DEFAULT_QUEUE_CONFIG,
  player: DEFAULT_PLAYER_CONFIG,
  players: DEFAULT_PLAYERS_CONFIG,
  media_browser: DEFAULT_MEDIA_BROWSER_CONFIG
}

export enum QueueConfigErrors {
  CONFIG_MISSING = 'Invalid configuration.',
  NO_ENTITY = 'You need to define entity.',
  ENTITY_TYPE = 'Entity must be a string!',
  MISSING_ENTITY = 'Entity does not exist!',
  OK = 'ok'
}

export enum Sections {
  QUEUE = "queue",
  MUSIC_PLAYER = "music-player",
  PLAYERS = "players",
  MEDIA_BROWSER = "media-browser"
}

export const DEFAULT_CARD: Sections = Sections.MUSIC_PLAYER
