import { Config, ConfigSections, EntityConfig } from "../config/config";
import { DEFAULT_SECTION_PRIORITY } from "../const/card";
import { MAX_ACTIVE_LAST_ACTIVE_DURATION } from "../const/common";
import { Sections, Thumbnail } from "../const/enums";
import { MUSIC_ASSISTANT_APP_NAME } from "../const/player-queue";
import { ExtendedHass, ExtendedHassEntity, QueueItem } from "../const/types";
import { getThumbnail } from "./thumbnails";

const ConfigSectionMap: Record<ConfigSections, Sections> = {
  music_player: Sections.MUSIC_PLAYER,
  queue: Sections.QUEUE,
  media_browser: Sections.MEDIA_BROWSER,
  players: Sections.PLAYERS,
};

export function getDefaultSection(config: Config) {
  const defaults = DEFAULT_SECTION_PRIORITY;
  if (config.default_section) {
    return ConfigSectionMap[config.default_section];
  }
  const sections_config: Record<string, boolean> = {
    [Sections.MUSIC_PLAYER]: config.player.enabled,
    [Sections.QUEUE]: config.queue.enabled,
    [Sections.PLAYERS]: config.players.enabled,
    [Sections.MEDIA_BROWSER]: config.media_browser.enabled,
  };
  const filtered = Object.entries(sections_config)
    .filter((item) => item[1])
    .map((item) => item[0]);
  const enabled_default = defaults.find((item) => filtered.includes(item));
  return enabled_default;
}

export function secondsToTime(seconds: number) {
  if (Number.isNaN(seconds)) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString()}:${secs < 10 ? "0" : ""}${secs.toString()}`;
}
export function playerHasUpdated(
  old_player: ExtendedHassEntity | undefined,
  new_player: ExtendedHassEntity | undefined,
): boolean {
  if (!new_player && !old_player) {
    return false;
  }
  if (!new_player || !old_player) {
    return true;
  }
  const old_attributes = old_player.attributes;
  const new_attributes = new_player.attributes;
  const attributes = [
    "active_queue",
    "app_id",
    "entity_picture_local",
    "is_volume_muted",
    "media_album_name",
    "media_artist",
    "media_content_id",
    "media_content_type",
    "media_duration",
    "media_position",
    "media_title",
    "repeat",
    "shuffle",
    "volume_level",
  ];
  const old_state = old_player.state;
  const new_state = new_player.state;
  const changed_attributes = attributes.filter((attribute) => {
    try {
      return old_attributes[attribute] !== new_attributes[attribute];
    } catch {
      return true;
    }
  });
  const state_changed = old_state != new_state;
  const attributes_changed = changed_attributes.length > 0;
  return state_changed || attributes_changed;
}

export function queueItemhasUpdated(
  old_item: QueueItem | undefined,
  new_item: QueueItem | undefined,
): boolean {
  return (
    old_item?.media_content_id !== new_item?.media_content_id ||
    old_item?.playing !== new_item?.playing ||
    old_item?.queue_item_id !== new_item?.queue_item_id ||
    old_item?.show_action_buttons !== new_item?.show_action_buttons ||
    old_item?.show_artist_name !== new_item?.show_artist_name ||
    old_item?.show_move_up_next !== new_item?.show_move_up_next
  );
}
export function isActive(
  hass: ExtendedHass | undefined,
  entity: ExtendedHassEntity | undefined,
  entity_config: EntityConfig,
): boolean {
  if (!entity || !hass) {
    return false;
  }
  const inactive_states = entity_config.inactive_when_idle
    ? ["off", "idle"]
    : ["off"];
  const not_off = !inactive_states.includes(entity.state);
  const has_item = !!entity.attributes.media_content_id;
  const is_mass = entity.attributes.app_id == MUSIC_ASSISTANT_APP_NAME;
  const has_queue = !!entity.attributes.active_queue;
  const connected = hass.connected;
  const updated_ms = new Date(entity.last_updated).getTime();
  const now_ms = Date.now();
  const updated_recently =
    now_ms - updated_ms <= MAX_ACTIVE_LAST_ACTIVE_DURATION;
  return (
    not_off && is_mass && has_queue && connected && updated_recently && has_item
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function jsonMatch(objectA: any, objectB: any): boolean {
  const jsonA = JSON.stringify(objectA);
  const jsonB = JSON.stringify(objectB);
  return jsonA == jsonB;
}

export function ensureThumbnail(img: string, hass: ExtendedHass): string {
  // Returns a URL encodable image
  // If `img` is a Thumbnail enum, returns the image related to the enum.
  // Otherwise, returns `img`
  if (Object.values(Thumbnail).includes(img as Thumbnail)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return getThumbnail(hass, img as Thumbnail)!;
  }
  return img;
}

export async function tryPrefetchImageWithFallbacks(
  img_url: string,
  fallbacks: string[],
  hass: ExtendedHass,
  returnElement = false,
): Promise<string | HTMLImageElement | false> {
  const imgs = [img_url, ...fallbacks];
  const img = await findFirstAccessibleImage(imgs, hass, returnElement);
  return img;
}

function findFirstAccessibleImage(
  urls: string[],
  hass: ExtendedHass,
  returnElement = false,
): Promise<string | HTMLImageElement | false> {
  return new Promise((resolve) => {
    let index = 0;
    function tryNextImage() {
      if (index >= urls.length) {
        resolve(false);
        return;
      }
      const img = new Image();
      const url = ensureThumbnail(urls[index], hass);

      // eslint-disable-next-line unicorn/prefer-add-event-listener
      img.onload = () => {
        if (returnElement) {
          resolve(img);
        }
        resolve(url);
        return;
      };

      // eslint-disable-next-line unicorn/prefer-add-event-listener
      img.onerror = () => {
        index++;
        tryNextImage();
      };
      img.src = url;
    }
    tryNextImage();
  });
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function uuid4() {
  return "10000000-1000-4000-8000-100000000000".replaceAll(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16),
  );
}

export function formatDuration(dur: number | undefined) {
  if (!dur) {
    return `0 minutes`;
  }
  let _dur = dur;
  const days_s = 86_400;
  const hr_s = 3600;
  const min_s = 60;
  const days = Math.floor(_dur / days_s);
  _dur = _dur % days_s;
  const hrs = Math.floor(_dur / hr_s);
  _dur = _dur % hr_s;
  const mins = Math.floor(_dur / min_s);
  if (days) {
    return `${days.toString()} days, ${hrs.toString()} hours, ${mins.toString()} minutes`;
  }
  if (hrs) {
    return `${hrs.toString()} hours, ${mins.toString()} minutes`;
  }
  return `${mins.toString()} minutes`;
}
