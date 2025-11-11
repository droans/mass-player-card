export enum Sections {
  QUEUE = "queue",
  MUSIC_PLAYER = "music-player",
  PLAYERS = "players",
  MEDIA_BROWSER = "media-browser",
}

export const DEFAULT_SECTION_PRIORITY = [
  Sections.MUSIC_PLAYER,
  Sections.QUEUE,
  Sections.PLAYERS,
  Sections.MEDIA_BROWSER,
]
