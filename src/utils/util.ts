import { Config, EntityConfig } from "../config/config";
import { DEFAULT_SECTION_PRIORITY } from "../const/card";
import {
  MAX_ACTIVE_LAST_ACTIVE_DURATION,
} from "../const/common";
import { Sections, Thumbnail } from "../const/enums";
import { MUSIC_ASSISTANT_APP_NAME } from "../const/player-queue";
import { ExtendedHass, ExtendedHassEntity, QueueItem } from "../const/types";
import { getThumbnail } from "./thumbnails.js";

export function testMixedContent(url: string) {
  try {
    if (window.location.protocol == "http") {
      return true;
    }
    return isHttpsOrRelative(url);
  } catch {
    return false;
  }
}

export function isHttpsOrRelative(url: string) {
  try {
    return !url.startsWith("http:");
  } catch {
    return false;
  }
}

export function getDefaultSection(config: Config) {
  const defaults = DEFAULT_SECTION_PRIORITY;
  const sections_conf: Record<string, boolean> = {
    [Sections.MUSIC_PLAYER]: config.player.enabled,
    [Sections.QUEUE]: config.queue.enabled,
    [Sections.PLAYERS]: config.players.enabled,
    [Sections.MEDIA_BROWSER]: config.media_browser.enabled,
  };
  const filtered = Object.entries(sections_conf)
    .filter((item) => item[1])
    .map((item) => item[0]);
  const enabled_defaults = defaults.filter((item) => filtered.includes(item));
  return enabled_defaults[0];
}

export function secondsToTime(seconds: number) {
  if (isNaN(seconds)) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString()}:${secs < 10 ? "0" : ""}${secs.toString()}`;
}
export function playerHasUpdated(
  old_player: ExtendedHassEntity,
  new_player: ExtendedHassEntity,
): boolean {
  const old_attrs = old_player?.attributes;
  const new_attrs = new_player?.attributes;
  const attrs = [
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
  const old_state = old_player?.state;
  const new_state = new_player?.state;
  const changed_attrs = attrs.filter((attr) => {
    try {
      return old_attrs[attr] !== new_attrs[attr];
    } catch {
      return true;
    }
  });
  const state_changed = old_state != new_state;
  const attrs_changed = changed_attrs.length > 0;
  return state_changed || attrs_changed;
}

export function queueItemhasUpdated(
  old_item: QueueItem,
  new_item: QueueItem,
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
  hass: ExtendedHass,
  entity: ExtendedHassEntity,
  entity_config: EntityConfig,
): boolean {
  if (!entity || !hass) {
    return false
  }
  const inactive_states = entity_config.inactive_when_idle
    ? ["off", "idle"]
    : ["off"];
  const not_off = !inactive_states.includes(entity?.state);
  const has_item = !!entity?.attributes?.media_content_id;
  const is_mass = entity?.attributes?.app_id == MUSIC_ASSISTANT_APP_NAME;
  const has_queue = !!entity?.attributes?.active_queue;
  const connected = hass.connected;
  const updated_ms = new Date(entity?.last_updated).getTime();
  const now_ms = new Date().getTime();
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

export async function tryPrefetchImage(image_url: string): Promise<string | boolean> {
  if (!image_url?.length || image_url.length < 10) {
    return false;
  }
  try {
    const hdrs = {
      method: 'GET',
      headers: {
        Accept: 'image',
      }
    }
    const response = await fetch(image_url, hdrs)
    if (!response.ok) {
      return false
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return false
  }
}

export function ensureThumbnail(img: string, hass: ExtendedHass): string {
  // Returns a URL encodable image
  // If `img` is a Thumbnail enum, returns the image related to the enum.
  // Otherwise, returns `img`
  if (Object.values(Thumbnail).includes(img as Thumbnail)) {
    return getThumbnail(hass, img as Thumbnail)
  }
  return img
}

export async function tryPrefetchImageWithFallbacks(
  img_url: string,
  fallbacks: string[],
  hass: ExtendedHass,
  returnElement = false,
): Promise<string | HTMLImageElement | false> {
  const imgs = [
    img_url,
    ...fallbacks
  ];
  const img = await findFirstAccessibleImage(imgs, hass, returnElement);
  return img;
}

function findFirstAccessibleImage(
  urls: string[],
  hass: ExtendedHass,
  returnElement: boolean = false,
): Promise<string | HTMLImageElement | false> {
  return new Promise(
    (resolve) => {
      let index = 0;
      
      function tryNextImage() {
        if (index >= urls.length) {
          resolve(false);
        }
        const img = new Image();
        const url = ensureThumbnail(urls[index], hass)
        
        img.onload = () => {
          if (returnElement) {
            resolve(img)
          }
          resolve(url);
        };
        
        img.onerror = () => {
          index++;
          tryNextImage();
        };
        img.src = url;
      }
      tryNextImage();
    }
  )
}