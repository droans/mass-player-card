import { hiddenElementsConfigItem } from "../utils/config";
import { BaseHiddenElementsConfig, Config } from "./config";

export interface PlayerConfig {
  enabled: boolean;
  hide: PlayerHiddenElementsConfig;
  skip_forward_seconds: number;
  skip_backwards_seconds: number;
}

export interface PlayerControlsHiddenElementsConfig extends BaseHiddenElementsConfig {
  power_button: boolean;
  repeat_button: boolean;
  shuffle_button: boolean;
  favorite_button: boolean;
  skip_forward_button: boolean;
  skip_backwards_button: boolean;
}
export interface PlayerHiddenElementsConfig extends PlayerControlsHiddenElementsConfig {
  header: boolean;
  player_selector: boolean;
  group_selector: boolean;
  player_name: boolean;
  track_title: boolean;
  track_album: boolean;
  track_artist: boolean;
  track_progress_time: boolean;
  track_progress_bar: boolean;
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
    header: false,
    menu: false,
    crossfade_button: false,
    autoplay_button: false,
    skip_backwards_button: false,
    skip_forward_button: false,
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
  "crossfade_button",
  "autoplay_button",
  "skip_forward_button",
  "skip_backwards_button",
  "volume",
  "track_title",
  "track_album",
  "track_artist",
  "track_progress_time",
  "track_progress_bar",
  "player_name",
  "header",
  "player_selector",
  "group_selector",
  "menu",
];

export function playerConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} }, default: true },
    hiddenElementsConfigItem(PLAYER_HIDDEN_ITEMS),
  ];
}

function processHiddenElementsConfig(config: PlayerConfig): PlayerConfig {
  const hiddenElementsConfig = config.hide;
  return {
    ...config,
    hide: {
      ...DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
      ...hiddenElementsConfig,
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
  let playerConfig = config.player;
  playerConfig = processDefaults(playerConfig);
  playerConfig = processHiddenElementsConfig(playerConfig);
  return {
    ...config,
    player: playerConfig,
  };
}
