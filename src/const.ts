import { MediaBrowserConfig, PlayerConfig, PlayersConfig, QueueConfig } from "./types"

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

export const DEFAULT_MEDIA_BROWSER_CONFIG: MediaBrowserConfig = {
  enabled: true,
  favorites: {
    enabled: true,
    albums: {
      enabled: true
    },
    artists: {
      enabled: true
    },
    audiobooks: {
      enabled: true
    },
    playlists: {
      enabled: true
    },
    podcasts: {
      enabled: true
    },
    radios: {
      enabled: true
    },
    tracks: {
      enabled: true
    },
  }
}
export const DEFAULT_CONFIG = {
  queue: DEFAULT_QUEUE_CONFIG,
  player: DEFAULT_PLAYER_CONFIG,
  players: DEFAULT_PLAYERS_CONFIG,
  media_browser: DEFAULT_MEDIA_BROWSER_CONFIG
}

export enum Sections {
  QUEUE = "queue",
  MUSIC_PLAYER = "music-player",
  PLAYERS = "players",
  MEDIA_BROWSER = "media-browser"
}
export enum RepeatMode {
  OFF = 'off',
  ONCE = 'one',
  ALL = 'all'
}
export enum MediaTypes {
  ALBUM = 'album',
  ARTIST = 'artist',
  AUDIOBOOK = 'audiobook',
  PLAYLIST = 'playlist',
  PODCAST = 'podcast',
  TRACK = 'track',
  RADIO = 'radio'
}
export const DEFAULT_CARD: Sections = Sections.MUSIC_PLAYER