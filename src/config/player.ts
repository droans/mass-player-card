import { Config } from "./config";

export interface PlayerHiddenElementsConfig {
  favorite: boolean,
  mute: boolean,
  player_selector: boolean,
  power: boolean,
  repeat: boolean,
  shuffle: boolean,
  volume: boolean,
  group_volume: boolean,
}
export const DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG: PlayerHiddenElementsConfig = {
  favorite: false,
  mute: false,
  player_selector: false,
  power: false,
  repeat: false,
  shuffle: false,
  volume: false,
  group_volume: false,
}
export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
  enabled: true,
  hide: DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG
}
export interface PlayerConfig {
  enabled: boolean;
  hide: PlayerHiddenElementsConfig
}

export function playerConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} } },
  ]
}

function processHiddenElementsConfig(config: PlayerConfig): PlayerConfig {
  const hidden_elements_config = config.hide;
  return {
    ...config,
    hide: {
      ...DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
      ...hidden_elements_config
    }
  }
}

function processDefaults(config: PlayerConfig): PlayerConfig {
  return {
    ...DEFAULT_PLAYER_CONFIG,
    ...config
  }
}

export function processPlayerConfig(config: Config): Config {
  let player_config = config.player;
  player_config = processDefaults(player_config);
  player_config = processHiddenElementsConfig(player_config);
  return {
    ...config,
    player: player_config
  }
}