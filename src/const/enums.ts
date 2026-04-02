export enum ButtonColorRole {
  Filled = "filled",
  FilledVariant = "filled-variant",
  Plain = "plain",
  Standard = "standard",
  Tonal = "tonal",
  Variant = "variant",
}

export enum EnqueueOptions {
  PLAY_NOW = "play",
  PLAY_NOW_CLEAR_QUEUE = "replace",
  PLAY_NEXT = "next",
  PLAY_NEXT_CLEAR_QUEUE = "replace_next",
  ADD_TO_QUEUE = "add",
  RADIO = "radio",
}

export enum MediaTypes {
  ALBUM = "album",
  ARTIST = "artist",
  AUDIOBOOK = "audiobook",
  PLAYLIST = "playlist",
  PODCAST = "podcast",
  TRACK = "track",
  RADIO = "radio",
}

export enum RepeatMode {
  OFF = "off",
  ONCE = "one",
  ALL = "all",
}

export enum Sections {
  QUEUE = "queue",
  MUSIC_PLAYER = "music-player",
  PLAYERS = "players",
  MEDIA_BROWSER = "media-browser",
}

export enum Thumbnail {
  BOOK = "book",
  CLEFT = "cleft",
  DISC = "disc",
  HEADPHONES = "headphones",
  MICROPHONE = "microphone",
  MICROPHONE_MAGIC = "microphone_magic",
  PERSON = "person",
  PLAYLIST = "playlist",
  RADIO = "radio",
}

export enum VibrateDuration {
  CLICK = 5,
  VERY_SHORT = 25,
  SHORT = 75,
  MEDIUM = 150,
  LONG = 300,
  VERY_LONG = 500,
}

export enum PlayerSupportedFeatures {
  PAUSE = -1,
  SEEK = -2,
  VOLUME_SET = -3,
  VOLUME_MUTE = -4,
  PREVIOUS_TRACK = -5,
  NEXT_TRACK = -6,
  TURN_ON = -8,
  TURN_OFF = -9,
  PLAY_MEDIA = -10,
  VOLUME_STEP = -11,
  SELECT_SOURCE = -12,
  STOP = -13,
  CLEAR_PLAYLIST = -14,
  PLAY = -15,
  SHUFFLE_SET = -16,
  SELECT_SOUND_MODE = -17,
  BROWSE_MEDIA = -18,
  REPEAT_SET = -19,
  GROUPING = -20,
  MEDIA_ANNOUNCE = -21,
  MEDIA_ENQUEUE = -22,
  SEARCH_MEDIA = -23,
}
