import {Config } from "../config/config";
import {
  DEFAULT_SECTION_PRIORITY,
  Sections
} from "../const/card";
import { ExtendedHassEntity } from "../const/common.js";
import { QueueItem } from "../const/player-queue.js";

export function testMixedContent(url: string) {
  try {
    if (window.location.protocol == 'http') {
      return true;
    }
    return isHttpsOrRelative(url);
  } catch {
    return false;
  }
}

export function isHttpsOrRelative(url: string) {
  try {
    return !url.startsWith('http:');
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
    [Sections.MEDIA_BROWSER]: config.media_browser.enabled
  }
  const filtered = Object.entries(sections_conf).filter(
    (item) => item[1]
  ).map(
    (item) => item[0]
  )
  const enabled_defaults = defaults.filter(
    (item) => filtered.includes(item)
  );
  return enabled_defaults[0];
}

export function secondsToTime(seconds: number) {
    if (isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60
    return `${mins.toString()}:${secs < 10 ? "0" : ""}${secs.toString()}`  
}
export function playerHasUpdated(old_player: ExtendedHassEntity, new_player: ExtendedHassEntity): boolean {
  const old_attrs = old_player?.attributes;
  const new_attrs = new_player?.attributes;
  const attrs = [
    'active_queue',
    'app_id',
    'entity_picture_local',
    'is_volume_muted',
    'media_album_name',
    'media_artist',
    'media_content_id',
    'media_content_type',
    'media_duration',
    'media_position',
    'media_title',
    'repeat',
    'shuffle',
    'volume_level',
  ]
  const old_state = old_player?.state;
  const new_state = new_player?.state;
  const changed_attrs = attrs.filter(
    (attr) => {
      return old_attrs[attr] !== new_attrs[attr];
    }
  )
  const state_changed = old_state != new_state;
  const attrs_changed = changed_attrs.length > 0;
  return state_changed || attrs_changed;
}

export function queueItemhasUpdated(old_item: QueueItem, new_item: QueueItem): boolean {
  return (
    old_item?.media_content_id !== new_item?.media_content_id
      || old_item?.playing !== new_item?.playing
      || old_item?.queue_item_id !== new_item?.queue_item_id
      || old_item?.show_action_buttons !== new_item?.show_action_buttons
      || old_item?.show_artist_name !== new_item?.show_artist_name
      || old_item?.show_move_up_next !== new_item?.show_move_up_next
  )
}