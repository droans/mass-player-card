import { Thumbnail, MediaTypes, EnqueueOptions } from "./enums";
import { Icons } from "./icons";
import { getTranslation } from "../utils/translations";
import {
  EnqueueConfigOptions,
  MediaBrowserConfig,
} from "../config/media-browser";
import { ExtendedHass, ListItems } from "./types";

export const MediaTypeThumbnails = {
  album: Thumbnail.DISC,
  artist: Thumbnail.PERSON,
  audiobook: Thumbnail.BOOK,
  playlist: Thumbnail.PLAYLIST,
  podcast: Thumbnail.MICROPHONE_MAGIC,
  track: Thumbnail.CLEFT,
  radio: Thumbnail.RADIO,
};

export function getEnqueueButtons(icons: Icons, hass: ExtendedHass): ListItems {
  return [
    {
      option: EnqueueOptions.PLAY_NOW,
      icon: icons.PLAY_CIRCLE_OUTLINE,
      title: getTranslation("browser.enqueue.play", hass) as string,
    },
    {
      option: EnqueueOptions.PLAY_NEXT,
      icon: icons.SKIP_NEXT_CIRCLE_OUTLINED,
      title: getTranslation("browser.enqueue.next", hass) as string,
    },
    {
      option: EnqueueOptions.PLAY_NOW_CLEAR_QUEUE,
      icon: icons.PLAY_CIRCLE,
      title: getTranslation("browser.enqueue.play_clear", hass) as string,
    },
    {
      option: EnqueueOptions.PLAY_NEXT_CLEAR_QUEUE,
      icon: icons.SKIP_NEXT_CIRCLE,
      title: getTranslation("browser.enqueue.next_clear", hass) as string,
    },
    {
      option: EnqueueOptions.ADD_TO_QUEUE,
      icon: icons.PLAYLIST_PLUS,
      title: getTranslation("browser.enqueue.queue", hass) as string,
    },
    {
      option: EnqueueOptions.RADIO,
      icon: icons.RADIO,
      title: getTranslation("browser.enqueue.radio", hass) as string,
    },
  ];
}
export function getSearchMediaButtons(
  icons: Icons,
  hass: ExtendedHass,
): ListItems {
  return [
    {
      option: MediaTypes.ALBUM,
      icon: icons.ALBUM,
      title: getTranslation("browser.sections.album", hass) as string,
    },
    {
      option: MediaTypes.ARTIST,
      icon: icons.ARTIST,
      title: getTranslation("browser.sections.artist", hass) as string,
    },
    {
      option: MediaTypes.AUDIOBOOK,
      icon: icons.BOOK,
      title: getTranslation("browser.sections.audiobook", hass) as string,
    },
    {
      option: MediaTypes.PLAYLIST,
      icon: icons.PLAYLIST,
      title: getTranslation("browser.sections.playlist", hass) as string,
    },
    {
      option: MediaTypes.PODCAST,
      icon: icons.PODCAST,
      title: getTranslation("browser.sections.podcast", hass) as string,
    },
    {
      option: MediaTypes.RADIO,
      icon: icons.RADIO,
      title: getTranslation("browser.sections.radio", hass) as string,
    },
    {
      option: MediaTypes.TRACK,
      icon: icons.MUSIC,
      title: getTranslation("browser.sections.track", hass) as string,
    },
  ];
}
export function getFilterButtons(
  icons: Icons,
  hass: ExtendedHass,
  config: MediaBrowserConfig,
): ListItems {
  const result: ListItems = [];
  if (config.favorites.enabled) {
    result.push({
      option: "favorites",
      icon: icons.HEART,
      title: getTranslation("browser.card.favorites", hass) as string,
    });
  }
  if (config.recents.enabled) {
    result.push({
      option: "recents",
      icon: icons.RECENTS,
      title: getTranslation("browser.card.recents", hass) as string,
    });
  }
  if (config.recommendations.enabled) {
    result.push({
      option: "recommendations",
      icon: icons.SUGGESTIONS,
      title: getTranslation("browser.card.recommendations", hass) as string,
    });
  }
  return result;
}

export const SEARCH_UPDATE_DELAY = 1000;
export const DEFAULT_SEARCH_LIMIT = 20;
export const SEARCH_TERM_MIN_LENGTH = 3;

export const DEFAULT_ACTIVE_SECTION = "favorites";
export const DEFAULT_ACTIVE_SUBSECTION = "main";

export const EnqueueConfigMap: Record<EnqueueConfigOptions, EnqueueOptions> = {
  add_to_queue: EnqueueOptions.ADD_TO_QUEUE,
  play_next: EnqueueOptions.PLAY_NEXT,
  play_next_clear_queue: EnqueueOptions.PLAY_NEXT_CLEAR_QUEUE,
  play_now: EnqueueOptions.PLAY_NOW,
  play_now_clear_queue: EnqueueOptions.PLAY_NOW_CLEAR_QUEUE,
  radio: EnqueueOptions.RADIO,
};
