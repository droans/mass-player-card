import { PlayerConfig, PlayersConfig, QueueConfig } from "./types"

export const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  enabled: true,
  limit_before: 5,
  limit_after: 100,
  show_album_covers: true,
  show_artist_names: true
}
export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
  enabled: true
}

export const DEFAULT_PLAYERS_CONFIG: PlayersConfig = {
  enabled: true
}
export const DEFAULT_CONFIG = {
  queue: DEFAULT_QUEUE_CONFIG,
  player: DEFAULT_PLAYER_CONFIG,
  players: DEFAULT_PLAYERS_CONFIG,
}

export enum Sections {
  QUEUE = "queue",
  MUSIC_PLAYER = "music-player",
  PLAYERS = "players",
}
export enum RepeatMode {
  OFF = 'off',
  ONCE = 'one',
  ALL = 'all'
}
export const DEFAULT_CARD: Sections = Sections.MUSIC_PLAYER