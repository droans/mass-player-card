/* eslint-disable no-console */
import { HassEntity } from "home-assistant-js-websocket";
import {
  ExtendedHass,
  ExtendedHassEntity,
  RepeatMode
} from "../const/common";
import { QueueItem } from "../const/player-queue";

export default class PlayerActions {
  private _hass!: ExtendedHass;
  constructor(hass: ExtendedHass) {
    this.hass = hass;
  }
  public set hass(hass: ExtendedHass) {
    if (hass) {
      this._hass = hass;
    }
  }
  public get hass() {
    return this._hass;
  }

  async actionPlayPause(entity: HassEntity) {
    try {
      await this.hass.callService(
        'media_player', 'media_play_pause',
        {
          'entity_id': entity.entity_id
        }
      )
    } catch (e) {
      console.error(`Error calling play/pause`, e)
    }
  }
  async actionMuteToggle(entity: HassEntity) {
    // Assume that entity might not be updated
    const e = this.hass.states[entity.entity_id];
    const is_muted = e.attributes.is_volume_muted;
    const mute = !is_muted;
    try {
      await this.hass.callService(
        'media_player', 'volume_mute',
        {
          'entity_id': entity.entity_id,
          'is_volume_muted': mute
        }
      )
    } catch (e) {
      console.error(`Error calling mute`, e)
    }
  }
  async actionNext(entity: HassEntity) {
    try {
      await this.hass.callService(
        'media_player', 'media_next_track',
        {
          'entity_id': entity.entity_id
        }
      )
    } catch (e) {
      console.error(`Error calling play next`, e)
    }
  }
  async actionPrevious(entity: HassEntity) {
    try {
      await this.hass.callService(
        'media_player', 'media_previous_track',
        {
          'entity_id': entity.entity_id
        }
      )
    } catch (e) {
      console.error(`Error calling play previous`, e)
    }
  }
  async actionShuffleToggle(entity: HassEntity) {
    const shuffle = !entity.attributes.shuffle;
    try {
      await this.hass.callService(
        'media_player', 'shuffle_set',
        {
          'entity_id': entity.entity_id,
          'shuffle': shuffle
        }
      )
    } catch (e) {
      console.error(`Error calling shuffle`, e)
    }
  }
  async actionRepeatSet(entity: HassEntity, repeatMode: RepeatMode) {
    try {
      await this.hass.callService(
        'media_player', 'repeat_set',
        {
          'entity_id': entity.entity_id,
          'repeat': repeatMode
        }
      )
    } catch (e) {
      console.error(`Error calling repeat`, e)
    }
  }
  async actionSetVolume(entity: HassEntity, volume: number) {
    try {
      await this.hass.callService(
        'media_player', 'volume_set',
        {
          'entity_id': entity.entity_id,
          'volume_level': volume
        }
      )
    } catch (e) {
      console.error(`Error setting volume`, e)
    }
  }
  async actionSeek(entity: HassEntity, position: number) {
    try {
      await this.hass.callService(
        'media_player', 'media_seek',
        {
          'entity_id': entity.entity_id,
          'seek_position': position
        }
      )
    } catch (e) {
      console.error(`Error calling repeat`, e)
    }
  }
  async actionTogglePlayer(entity: HassEntity) {
    try {
      await this.hass.callService(
        'media_player', 'toggle',
        {
          'entity_id': entity.entity_id
        }
      )
    } catch (e) {
      console.error(`Error calling repeat`, e)
    }
  }
  async actionGetCurrentItem(entity: ExtendedHassEntity): Promise<QueueItem|null> {
      /* eslint-disable
        @typescript-eslint/no-explicit-any,
        @typescript-eslint/no-unsafe-assignment,
        @typescript-eslint/no-unsafe-member-access
      */
      const ret = await this.hass.callWS<any>({
        type: 'call_service',
        domain: 'mass_queue',
        service: 'get_queue_items',
        service_data: {
          entity: entity.entity_id,
          limit_before: 1,
          limit_after: 1,
        },
        return_response: true
      });
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-call */
      const result: QueueItem = ret.response[entity.entity_id].find(
        (item: QueueItem) => {
          return item.media_content_id == entity.attributes.media_content_id;
        }
      )
      return result;
      /* eslint-enable
        @typescript-eslint/no-explicit-any,
        @typescript-eslint/no-unsafe-assignment,
        @typescript-eslint/no-unsafe-member-access
      */
  }
  async actionAddFavorite(entity: HassEntity) {
    const dev_id = this.hass.entities[entity.entity_id].device_id;
    try {
      await this.hass.callService(
        'button', 'press',
        {
          'device_id': dev_id
        }
      )
    } catch (e) {
      console.error(`Error setting favorite`, e)
    }
  }
  async actionRemoveFavorite(entity: HassEntity) {
    try {
      await this.hass.callService(
        'mass_queue', 'unfavorite_current_item',
        {
          'entity': entity.entity_id
        }
      )
    } catch (e) {
      console.error(`Error unfavoriting item for entity.`, e)
    }
  }
  async actionUnjoinPlayers(player_entity: string) {
    try {
      await this.hass.callService(
        'media_player', 'unjoin',
        {
          'entity_id': player_entity
        }
      )
    } catch (e) {
      console.error(`Error unjoining players`, e)
    }
  }
}