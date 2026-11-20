import { Config, ConfigSections, EntityConfig } from "../config/config";
import { DEFAULT_SECTION_PRIORITY } from "../const/card";
import { MAX_ACTIVE_LAST_ACTIVE_DURATION } from "../const/common";
import { PlayerSupportedFeatures, Sections, Thumbnail } from "../const/enums";
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
  const sectionsConfig: Record<string, boolean> = {
    [Sections.MUSIC_PLAYER]: config.player.enabled,
    [Sections.QUEUE]: config.queue.enabled,
    [Sections.PLAYERS]: config.players.enabled,
    [Sections.MEDIA_BROWSER]: config.media_browser.enabled,
  };
  const filtered = Object.entries(sectionsConfig)
    .filter((item) => item[1])
    .map((item) => item[0]);
  const enabledDefault = defaults.find((item) => filtered.includes(item));
  return enabledDefault;
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
  oldPlayer: ExtendedHassEntity | undefined,
  newPlayer: ExtendedHassEntity | undefined,
): boolean {
  if (!newPlayer && !oldPlayer) {
    return false;
  }
  if (!newPlayer || !oldPlayer) {
    return true;
  }
  const oldAttributes = oldPlayer.attributes;
  const newAttributes = newPlayer.attributes;
  const attributes = [
    "active_queue",
    "app_id",
    "entity_picture",
    "entity_picture_local",
    "group_members",
    "is_volume_muted",
    "mass_player_type",
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
  const oldState = oldPlayer.state;
  const newState = newPlayer.state;
  const changedAttributes = attributes.filter((attribute) => {
    try {
      return oldAttributes[attribute] !== newAttributes[attribute];
    } catch {
      return true;
    }
  });
  const stateChanged = oldState != newState;
  const attributesChanged = changedAttributes.length > 0;
  return stateChanged || attributesChanged;
}

export function queueItemhasUpdated(
  oldItem: QueueItem | undefined,
  newItem: QueueItem | undefined,
): boolean {
  return (
    oldItem?.media_content_id !== newItem?.media_content_id ||
    oldItem?.playing !== newItem?.playing ||
    oldItem?.queue_item_id !== newItem?.queue_item_id ||
    oldItem?.show_action_buttons !== newItem?.show_action_buttons ||
    oldItem?.show_artist_name !== newItem?.show_artist_name ||
    oldItem?.show_move_up_next !== newItem?.show_move_up_next
  );
}
export function isActive(
  hass: ExtendedHass | undefined,
  entity: ExtendedHassEntity | undefined,
  entityConfig: EntityConfig,
): boolean {
  if (!entity || !hass) {
    return false;
  }
  const inactiveStates = entityConfig.inactive_when_idle
    ? ["off", "idle"]
    : ["off"];
  const notOff = !inactiveStates.includes(entity.state);
  const hasItem = !!entity.attributes.media_content_id;
  const isMass = entity.attributes.app_id == MUSIC_ASSISTANT_APP_NAME;
  const hasQueue = !!entity.attributes.active_queue;
  const connected = hass.connected;
  const updatedMs = new Date(entity.last_updated).getTime();
  const nowMs = Date.now();
  const updatedRecently =
    nowMs - updatedMs <= MAX_ACTIVE_LAST_ACTIVE_DURATION ||
    !entityConfig.inactive_when_not_updated;
  return (
    notOff && isMass && hasQueue && connected && updatedRecently && hasItem
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
  imgUrl: string,
  fallbacks: string[],
  hass: ExtendedHass,
  returnElement = false,
): Promise<string | HTMLImageElement | false> {
  const imgs = [imgUrl, ...fallbacks];
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
  const daysSeconds = 86_400;
  const hourSeconds = 3600;
  const minuteSeconds = 60;
  const days = Math.floor(_dur / daysSeconds);
  _dur = _dur % daysSeconds;
  const hrs = Math.floor(_dur / hourSeconds);
  _dur = _dur % hourSeconds;
  const mins = Math.floor(_dur / minuteSeconds);
  if (days) {
    return `${days.toString()} days, ${hrs.toString()} hours, ${mins.toString()} minutes`;
  }
  if (hrs) {
    return `${hrs.toString()} hours, ${mins.toString()} minutes`;
  }
  return `${mins.toString()} minutes`;
}

export function playerIsAvailable(
  hass: ExtendedHass | undefined,
  entityId: string,
): boolean {
  if (typeof entityId != "string" || !entityId.startsWith("media_player")) {
    return false;
  }
  if (!hass?.states) {
    return false;
  }
  const entity = hass.states[entityId];
  if (!entity) {
    return false;
  }
  const state = entity.state;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const hasQueue = (entity?.attributes?.active_queue ?? null) != "";
  return !["unknown", "unavailable"].includes(state) && hasQueue;
}

export function playerSupportsFeature(
  playerSupportedFeatures: number,
  feature: PlayerSupportedFeatures,
): boolean {
  const feats = (playerSupportedFeatures >>> 0).toString(2);
  return feats.at(feature) == "1";
}

export function stopEventPropagation(event_: Event) {
  event_.stopPropagation();
}
