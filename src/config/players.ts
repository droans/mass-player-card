import { hiddenElementsConfigItem } from "../utils/config";
import { BaseHiddenElementsConfig, Config } from "./config";

export interface PlayersConfig {
  enabled: boolean;
  hide: PlayersHiddenElementsConfig;
}
export interface PlayersHiddenElementsConfig extends BaseHiddenElementsConfig {
  header: boolean;
  header_title: boolean;
  action_buttons: boolean;
  transfer_button: boolean;
}

export const DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG: PlayersHiddenElementsConfig =
  {
    action_buttons: false,
    transfer_button: false,
    header_title: false,
    header: false,
  };

export const DEFAULT_PLAYERS_CONFIG: PlayersConfig = {
  enabled: true,
  hide: DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG,
};

const PLAYERS_HIDDEN_ITEMS = [
  "action_buttons",
  "transfer_button",
  "header",
  "header_title",
];

export function playersConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} }, default: true },
    hiddenElementsConfigItem(PLAYERS_HIDDEN_ITEMS),
  ];
}

function processHiddenElementsConfig(config: PlayersConfig): PlayersConfig {
  const hiddenElementsConfig = config.hide;
  return {
    ...config,
    hide: {
      ...DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG,
      ...hiddenElementsConfig,
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
  let playersConfig = config.players;
  playersConfig = processDefaults(playersConfig);
  playersConfig = processHiddenElementsConfig(playersConfig);
  return {
    ...config,
    players: playersConfig,
  };
}
