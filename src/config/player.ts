import { hiddenElementsConfigItem } from "../utils/config";
import { BaseHiddenElementsConfig, Config } from "./config";

export interface PlayerConfig {
  enabled: boolean;
  hide: PlayerHiddenElementsConfig;
}

export interface PlayerControlsHiddenElementsConfig extends BaseHiddenElementsConfig {
  power_button: boolean;
  repeat_button: boolean;
  shuffle_button: boolean;
  favorite_button: boolean;
}
export interface PlayerHiddenElementsConfig extends BaseHiddenElementsConfig {
  header: boolean;
  header_title: boolean;
  player_selector: boolean;
  group_selector: boolean;
  player_name: boolean;
  track_title: boolean;
  track_album: boolean;
  track_artist: boolean;
  track_progress_time: boolean;
  track_progress_bar: boolean;
  power_button: boolean;
  repeat_button: boolean;
  shuffle_button: boolean;
  favorite_button: boolean;
  volume: boolean;
  mute_button: boolean;
  menu: boolean;
  crossfade_button: boolean;
  autoplay_button: boolean;
}

export const DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG: PlayerHiddenElementsConfig =
  {
    favorite_button: false,
    mute_button: false,
    player_selector: false,
    power_button: false,
    repeat_button: false,
    shuffle_button: false,
    volume: false,
    group_selector: false,
    player_name: false,
    track_album: false,
    track_artist: false,
    track_progress_bar: false,
    track_progress_time: false,
    track_title: false,
    header_title: false,
    header: false,
    menu: false,
    crossfade_button: false,
    autoplay_button: false,
  };
export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
  enabled: true,
  hide: DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
  skip_backwards_seconds: 30,
  skip_forward_seconds: 30,
};

const PLAYER_HIDDEN_ITEMS = [
  "shuffle_button",
  "repeat_button",
  "power_button",
  "favorite_button",
  "mute_button",
  "volume",
  "track_title",
  "track_album",
  "track_artist",
  "track_progress_time",
  "track_progress_bar",
  "player_name",
  "header",
  "header_title",
  "player_selector",
  "group_selector",
];

export function playerConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} }, default: true },
    hiddenElementsConfigItem(PLAYER_HIDDEN_ITEMS),
  ];
}

function processHiddenElementsConfig(config: PlayerConfig): PlayerConfig {
  const hidden_elements_config = config.hide;
  return {
    ...config,
    hide: {
      ...DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
      ...hidden_elements_config,
    },
  };
}

function processDefaults(config: PlayerConfig): PlayerConfig {
  return {
    ...DEFAULT_PLAYER_CONFIG,
    ...config,
  };
}

export function processPlayerConfig(config: Config): Config {
  let player_config = config.player;
  player_config = processDefaults(player_config);
  player_config = processHiddenElementsConfig(player_config);
  return {
    ...config,
    player: player_config,
  };
}
