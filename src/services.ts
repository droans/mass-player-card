import { HomeAssistant } from "custom-card-helpers";
import { Config, QueueItem } from "./types";

export default class HassService {
  private hass: HomeAssistant;
  private config: Config

  constructor(hass: HomeAssistant, config: Config) {
    this.hass = hass;
    this.config = config;
  }

  async getQueue(limit_before: number, limit_after: number): Promise<QueueItem[]> {
    try {
      /* eslint-disable 
        @typescript-eslint/no-explicit-any
      */
      const ret = await this.hass.callWS<any>({
        type: 'call_service',
        domain: 'mass_queue',
        service: 'get_queue_items',
        service_data: {
          entity: this.config.entity,
          limit_before: limit_before,
          limit_after: limit_after,
        },
        return_response: true
      });
      const result: QueueItem[] = ret.response[this.config.entity];
      return result;
      /* eslint-enable */
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error('Error getting queue', e);
      return [];
    }
  }
  async playQueueItem(queue_item_id: string) {
    try {
      await this.hass.callService(
        'mass_queue', 'play_queue_item',
        {
          entity: this.config.entity,
          queue_item_id: queue_item_id
        }
      )
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error('Error selecting queue item', e)
    }
  }
  async removeQueueItem(queue_item_id: string) {
    try {
      await this.hass.callService(
        'mass_queue', 'remove_queue_item',
        {
          entity: this.config.entity,
          queue_item_id: queue_item_id
        }
      )
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error('Error removing queue item', e)
    }
  }
  async MoveQueueItemNext(queue_item_id: string) {
    try {
      await this.hass.callService(
        'mass_queue', 'move_queue_item_next',
        {
          entity: this.config.entity,
          queue_item_id: queue_item_id
        }
      )
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error('Error moving queue item next', e)
    }
  }
  async MoveQueueItemUp(queue_item_id: string) {
    try {
      await this.hass.callService(
        'mass_queue', 'move_queue_item_up',
        {
          entity: this.config.entity,
          queue_item_id: queue_item_id
        }
      )
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error('Error moving queue item up', e)
    }
  }
  async MoveQueueItemDown(queue_item_id: string) {
    try {
      await this.hass.callService(
        'mass_queue', 'move_queue_item_down',
        {
          entity: this.config.entity,
          queue_item_id: queue_item_id
        }
      )
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error('Error moving queue item down', e)
    }
  }
}