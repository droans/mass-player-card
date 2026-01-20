/* eslint-disable no-console */
import { HassEntity } from "home-assistant-js-websocket";
import { RepeatMode } from "../const/enums";
import { ExtendedHass, ExtendedHassEntity, QueueItem } from "../const/types";
import {
  getQueueItemsServiceResponse,
  getQueueItemsServiceSchema,
} from "mass-queue-types/packages/mass_queue/actions/get_queue_items";
import {
  getInfoWSResponseSchema,
  getInfoWSServiceSchema,
} from "mass-queue-types/packages/mass_queue/ws/get_info";

export default class PlayerActions {
  private _hass!: ExtendedHass;
  constructor(hass: ExtendedHass) {
    this.hass = hass;
  }
  public set hass(hass: ExtendedHass) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (hass) {
      this._hass = hass;
    }
  }
  public get hass() {
    return this._hass;
  }

  async actionPlayPause(entity: HassEntity) {
    try {
      await this.hass.callService("media_player", "media_play_pause", {
        entity_id: entity.entity_id,
      });
    } catch (error) {
      console.error(`Error calling play/pause`, error);
    }
  }
  async actionMuteToggle(entity: HassEntity) {
    // Assume that entity might not be updated
    const ent = this.hass.states[entity.entity_id] as ExtendedHassEntity;
    const is_muted = ent.attributes.is_volume_muted;
    const mute = !is_muted;
    try {
      await this.hass.callService("media_player", "volume_mute", {
        entity_id: entity.entity_id,
        is_volume_muted: mute,
      });
    } catch (error) {
      console.error(`Error calling mute`, error);
    }
  }
  async actionNext(entity: HassEntity) {
    try {
      await this.hass.callService("media_player", "media_next_track", {
        entity_id: entity.entity_id,
      });
    } catch (error) {
      console.error(`Error calling play next`, error);
    }
  }
  async actionPrevious(entity: HassEntity) {
    try {
      await this.hass.callService("media_player", "media_previous_track", {
        entity_id: entity.entity_id,
      });
    } catch (error) {
      console.error(`Error calling play previous`, error);
    }
  }
  async actionShuffleToggle(entity: HassEntity) {
    const shuffle = !entity.attributes.shuffle;
    try {
      await this.hass.callService("media_player", "shuffle_set", {
        entity_id: entity.entity_id,
        shuffle,
      });
    } catch (error) {
      console.error(`Error calling shuffle`, error);
    }
  }
  async actionRepeatSet(entity: HassEntity, repeatMode: RepeatMode) {
    try {
      await this.hass.callService("media_player", "repeat_set", {
        entity_id: entity.entity_id,
        repeat: repeatMode,
      });
    } catch (error) {
      console.error(`Error calling repeat`, error);
    }
  }
  async actionSetVolume(entity: HassEntity, volume: number) {
    try {
      await this.hass.callService("media_player", "volume_set", {
        entity_id: entity.entity_id,
        volume_level: volume,
      });
    } catch (error) {
      console.error(`Error setting volume`, error);
    }
  }
  async actionSeek(entity: HassEntity, position: number) {
    try {
      await this.hass.callService("media_player", "media_seek", {
        entity_id: entity.entity_id,
        seek_position: position,
      });
    } catch (error) {
      console.error(`Error calling repeat`, error);
    }
  }
  async actionTogglePlayer(entity: HassEntity) {
    try {
      await this.hass.callService("media_player", "toggle", {
        entity_id: entity.entity_id,
      });
    } catch (error) {
      console.error(`Error calling repeat`, error);
    }
  }
  async actionGetCurrentItem(
    entity: ExtendedHassEntity,
  ): Promise<QueueItem | undefined> {
    const data: getQueueItemsServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "get_queue_items",
      service_data: {
        entity: entity.entity_id,
        limit_before: 1,
        limit_after: 1,
      },
      return_response: true,
    };
    const returnValue =
      await this.hass.callWS<getQueueItemsServiceResponse>(data);
    const result: QueueItem | undefined = returnValue.response[
      entity.entity_id
    ].find((item) => {
      return item.media_content_id == entity.attributes.media_content_id;
    });
    return result ?? undefined;
  }
  async actionAddFavorite(entity: HassEntity) {
    const development_id = this.hass.entities[entity.entity_id].device_id;
    try {
      await this.hass.callService("button", "press", {
        device_id: development_id,
      });
    } catch (error) {
      console.error(`Error setting favorite`, error);
    }
  }
  async actionRemoveFavorite(entity: HassEntity) {
    try {
      await this.hass.callService("mass_queue", "unfavorite_current_item", {
        entity: entity.entity_id,
      });
    } catch (error) {
      console.error(`Error unfavoriting item for entity.`, error);
    }
  }
  async actionUnjoinPlayers(player_entity: string) {
    try {
      await this.hass.callService("media_player", "unjoin", {
        entity_id: player_entity,
      });
    } catch (error) {
      console.error(`Error unjoining players`, error);
    }
  }
  async actionAddToPlaylist(
    media_uri: string,
    playlist_uri: string,
    entity: ExtendedHassEntity,
  ): Promise<void> {
    const player_info = await this.actionGetPlayerInfo(entity);
    const mass_entry = player_info?.entries.mass_queue;
    const playlist_uri_split = playlist_uri.split("/");
    const playlist_id = playlist_uri_split[playlist_uri_split.length - 1];
    const data = {
      type: "call_service",
      domain: "mass_queue",
      service: "send_command",
      service_data: {
        command: "music/playlists/add_playlist_tracks",
        config_entry_id: mass_entry,
        data: {
          db_playlist_id: playlist_id,
          uris: [media_uri],
        },
      },
    };
    await this.hass.callWS(data);
  }
  async actionGetPlayerInfo(
    entity: ExtendedHassEntity,
  ): Promise<getInfoWSResponseSchema | null> {
    const data: getInfoWSServiceSchema = {
      type: "mass_queue/get_info",
      entity_id: entity.entity_id,
    };
    return await this.hass.callWS(data);
  }
}
