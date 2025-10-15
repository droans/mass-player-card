/* eslint-disable no-console */
import { QueueItems } from "../const/player-queue";
import { ExtendedHass } from "../const/common";

export default class QueueActions {
  private _hass!: ExtendedHass;
  public _player_entity!: string;

  constructor(hass: ExtendedHass, player_entity: string) {
    this.hass = hass;
    this.player_entity = player_entity;
  }
  public set hass(hass: ExtendedHass) {
    this._hass = hass;
  }
  public get hass() {
    return this._hass;
  }
  public set player_entity(entity: string) {
    this._player_entity = entity;
  }
  public get player_entity() {
    return this._player_entity;
  }

  async getQueue(limit_before: number, limit_after: number): Promise<QueueItems|null> {
    try {
      /* eslint-disable
        @typescript-eslint/no-explicit-any,
        @typescript-eslint/no-unsafe-assignment,
      */
      const ret = await this.hass.callWS<any>({
        type: 'call_service',
        domain: 'mass_queue',
        service: 'get_queue_items',
        service_data: {
          entity: this.player_entity,
          limit_before: limit_before,
          limit_after: limit_after,
        },
        return_response: true
      });
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */
      const result: QueueItems = ret.response[this.player_entity];
      return result;
      /* eslint-enable
        @typescript-eslint/no-explicit-any,
        @typescript-eslint/no-unsafe-assignment,
      */
    } catch (e) {
      console.error('Error getting queue', e);
      return null;
    }
  }
  async playQueueItem(queue_item_id: string) {
    try {
      await this.hass.callService(
        'mass_queue', 'play_queue_item',
        {
          entity: this.player_entity,
          queue_item_id: queue_item_id
        }
      )
    } catch (e) {
      console.error('Error selecting queue item', e)
    }
  }
  async removeQueueItem(queue_item_id: string) {
    try {
      await this.hass.callService(
        'mass_queue', 'remove_queue_item',
        {
          entity: this.player_entity,
          queue_item_id: queue_item_id
        }
      )
    } catch (e) {
      console.error('Error removing queue item', e)
    }
  }
  async MoveQueueItemNext(queue_item_id: string) {
    try {
      await this.hass.callService(
        'mass_queue', 'move_queue_item_next',
        {
          entity: this.player_entity,
          queue_item_id: queue_item_id
        }
      )
    } catch (e) {
      console.error('Error moving queue item next', e)
    }
  }
  async MoveQueueItemUp(queue_item_id: string) {
    try {
      await this.hass.callService(
        'mass_queue', 'move_queue_item_up',
        {
          entity: this.player_entity,
          queue_item_id: queue_item_id
        }
      )
    } catch (e) {
      console.error('Error moving queue item up', e)
    }
  }
  async MoveQueueItemDown(queue_item_id: string) {
    try {
      await this.hass.callService(
        'mass_queue', 'move_queue_item_down',
        {
          entity: this.player_entity,
          queue_item_id: queue_item_id
        }
      )
    } catch (e) {
      console.error('Error moving queue item down', e)
    }
  }
  async getLocalImage(url: string) {
    try {
      const result = await this.hass.callWS(
        {
          type: 'mass_queue/download_and_encode_image',
          url: url
        }
      )
      return result;
    } catch (e) {
      console.error('Error getting image', e)
      return '';
    } 
  }
}