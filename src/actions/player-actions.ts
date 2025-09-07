import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { RepeatMode } from "../const/common";

/* eslint-disable no-console */
export default class PlayerActions {
  private hass: HomeAssistant;
  constructor(hass: HomeAssistant) {
    this.hass = hass;
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
    const mute = !entity.attributes.is_volume_muted;
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
      console.error(`Error calling repeat`, e)
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
}
/* eslint-enable no-console */