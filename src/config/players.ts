import { hiddenElementsConfigItem } from "../utils/config.js";
import { Config } from "./config";

export interface PlayersConfig {
  enabled: boolean;
  hide: PlayersHiddenElementsConfig;
}
export interface PlayersHiddenElementsConfig {
  action_buttons: boolean;
  join_button: boolean;
  transfer_button: boolean;
}

export const DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG: PlayersHiddenElementsConfig =
  {
    action_buttons: false,
    join_button: false,
    transfer_button: false,
  };

export const DEFAULT_PLAYERS_CONFIG: PlayersConfig = {
  enabled: true,
  hide: DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG,
};

const PLAYERS_HIDDEN_ITEMS = [
  "action_buttons",
  "join_button",
  "transfer_button",
];

export function playersConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} }, default: true },
    hiddenElementsConfigItem(PLAYERS_HIDDEN_ITEMS),
  ];
}

function processHiddenElementsConfig(config: PlayersConfig): PlayersConfig {
  const hidden_elements_config = config.hide;
  return {
    ...config,
    hide: {
      ...DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG,
      ...hidden_elements_config,
    },
  };
}
function processDefaults(config: PlayersConfig): PlayersConfig {
  return {
    ...DEFAULT_PLAYERS_CONFIG,
    ...config,
  };
}
export function processPlayersConfig(config: Config): Config {
  let players_config = config.players;
  players_config = processDefaults(players_config);
  players_config = processHiddenElementsConfig(players_config);
  return {
    ...config,
    players: players_config,
  };
}
