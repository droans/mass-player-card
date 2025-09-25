import { Config } from "./config";

export interface PlayerQueueHiddenElementsConfig {
  action_buttons: boolean;
  move_down_button: boolean;
  move_next_button: boolean;
  move_up_button: boolean;
  remove_button: boolean;
  album_covers: boolean;
  artist_names: boolean;
}
export const DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG: PlayerQueueHiddenElementsConfig = {
  action_buttons: false,
  move_down_button: false,
  move_next_button: false,
  move_up_button: false,
  remove_button: false,
  album_covers: false,
  artist_names: false
}
export interface QueueConfig {
  enabled: boolean;
  limit_before: number;
  limit_after: number;
  show_album_covers: boolean;
  show_artist_names: boolean;
  hide: PlayerQueueHiddenElementsConfig;
}
export const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  enabled: true,
  limit_before: 5,
  limit_after: 100,
  show_album_covers: true,
  show_artist_names: true,
  hide: DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG,
}

export function queueConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} } },
    {
      name: "",
      type: "grid",
      schema: [
        { name: "limit_before", selector: { number: { min: 0, max: 500, mode: "box"}}},
        { name: "limit_after", selector: { number: { min: 0, max: 500, mode: "box"}}},
        { name: "show_album_covers", selector: { boolean: {} } },
        { name: "show_artist_names", selector: { boolean: {} } },
      ]
    }
  ]
}

export enum QueueConfigErrors {
  CONFIG_MISSING = 'Invalid configuration.',
  NO_ENTITY = 'You need to define entity.',
  ENTITY_TYPE = 'Entity must be a string!',
  MISSING_ENTITY = 'Entity does not exist!',
  OK = 'ok'
}

function processHiddenElementsConfig(config: QueueConfig): QueueConfig {
  let hidden_elements_config = config.hide;
  return {
    ...config,
    hide: {
      ...DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG,
      ...hidden_elements_config
    }
  }
}
function processDefaults(config: QueueConfig): QueueConfig {
  return {
    ...DEFAULT_QUEUE_CONFIG,
    ...config
  }
}

export function processQueueConfig(config: Config): Config {
  let queue_config = config.queue;
  queue_config = processDefaults(queue_config);
  queue_config = processHiddenElementsConfig(queue_config);
  return {
    ...config,
    queue: queue_config
  }
}