import { hiddenElementsConfigItem } from "../utils/config";
import { BaseHiddenElementsConfig, Config } from "./config";

export interface QueueConfig {
  enabled: boolean;
  show_album_covers: boolean;
  show_artist_names: boolean;
  hide: PlayerQueueHiddenElementsConfig;
}

export interface PlayerQueueHiddenElementsConfig extends BaseHiddenElementsConfig {
  header: boolean;
  header_title: boolean;
  clear_queue_button: boolean;
  artist_names: boolean;
  album_covers: boolean;
  action_buttons: boolean;
  move_down_button: boolean;
  move_next_button: boolean;
  move_up_button: boolean;
  remove_button: boolean;
}

export const DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG: PlayerQueueHiddenElementsConfig =
  {
    action_buttons: false,
    move_down_button: false,
    move_next_button: false,
    move_up_button: false,
    remove_button: false,
    album_covers: false,
    artist_names: false,
    clear_queue_button: false,
    header_title: false,
    header: false,
  };
export const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  enabled: true,
  show_album_covers: true,
  show_artist_names: true,
  hide: DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG,
};

const PLAYER_QUEUE_HIDDEN_ITEMS = [
  "action_buttons",
  "move_down_button",
  "move_next_button",
  "move_up_button",
  "remove_button",
  "album_covers",
  "artist_names",
  "clear_queue_button",
];
export function queueConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} }, default: true },
    {
      name: "",
      type: "grid",
      schema: [
        { name: "show_album_covers", selector: { boolean: {} } },
        { name: "show_artist_names", selector: { boolean: {} } },
      ],
    },
    hiddenElementsConfigItem(PLAYER_QUEUE_HIDDEN_ITEMS),
  ];
}

export enum QueueConfigErrors {
  CONFIG_MISSING = "Invalid configuration.",
  NO_ENTITY = "You need to define entity.",
  ENTITY_TYPE = "Entity must be a string!",
  MISSING_ENTITY = "Entity does not exist!",
  OK = "ok",
}

function processHiddenElementsConfig(config: QueueConfig): QueueConfig {
  const hidden_elements_config = config.hide;
  return {
    ...config,
    hide: {
      ...DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG,
      ...hidden_elements_config,
    },
  };
}
function processDefaults(config: QueueConfig): QueueConfig {
  return {
    ...DEFAULT_QUEUE_CONFIG,
    ...config,
  };
}

export function processQueueConfig(config: Config): Config {
  let queue_config = config.queue;
  queue_config = processDefaults(queue_config);
  queue_config = processHiddenElementsConfig(queue_config);
  return {
    ...config,
    queue: queue_config,
  };
}
