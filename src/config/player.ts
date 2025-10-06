import { hiddenElementsConfigItem } from "../utils/config.js";
import { Config } from "./config";

export enum PlayerControlsLayout {
  COMPACT = "compact",
  SPACED = "spaced"
}

export enum PlayerIconSize {
  SMALL = "small",
  LARGE = "large"
}

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

export const DEFAULT_PLAYER_ICON_CONFIG: PlayerIcons = {
  shuffle: {
    size: PlayerIconSize.SMALL,
    box_shadow: false,
    label: true,
  },
  previous: {
    size: PlayerIconSize.SMALL,
    box_shadow: false,
    label: false,
  },
  play_pause: {
    size: PlayerIconSize.LARGE,
    box_shadow: true,
    label: false,
  },
  next: {
    size: PlayerIconSize.SMALL,
    box_shadow: false,
    label: false,
  },
  repeat: {
    size: PlayerIconSize.SMALL,
    box_shadow: false,
    label: true,
  },
}

export const DEFAULT_PLAYER_LAYOUT_CONFIG: PlayerLayoutConfig = {
  controls_layout: PlayerControlsLayout.COMPACT,
  icons: DEFAULT_PLAYER_ICON_CONFIG
}
export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
  enabled: true,
  hide: DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
  layout: DEFAULT_PLAYER_LAYOUT_CONFIG,
}

export interface PlayerIcon {
  size: PlayerIconSize;
  box_shadow: boolean;
  label: boolean;
}

export interface PlayerIcons {
  shuffle: PlayerIcon;
  previous: PlayerIcon;
  play_pause: PlayerIcon;
  next: PlayerIcon;
  repeat: PlayerIcon;
}

export interface PlayerLayoutConfig {
  controls_layout: PlayerControlsLayout
  icons: PlayerIcons
}

export interface PlayerConfig {
  enabled: boolean;
  hide: PlayerHiddenElementsConfig;
  layout: PlayerLayoutConfig;
}
const PLAYER_HIDDEN_ITEMS = [
  'favorite',
  'mute',
  'player_selector',
  'power',
  'repeat',
  'shuffle',
  'volume',
  'group_volume',
]

export function playerConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} }, default: true },
    hiddenElementsConfigItem(PLAYER_HIDDEN_ITEMS),
  ]
}

function processPlayerIconsConfig(config: PlayerConfig): PlayerConfig {
  const layout_config = config.layout;
  const d = DEFAULT_PLAYER_ICON_CONFIG;
  const icons_config = layout_config.icons;

  let i: PlayerIcons = {
    ...d,
    ...icons_config
  };
  i = {
    shuffle: {
      ...d.shuffle,
      ...i.shuffle,
    },
    previous: {
      ...d.previous,
      ...i.previous,
    },
    play_pause: {
      ...d.play_pause,
      ...i.play_pause,
    },
    next: {
      ...d.next,
      ...i.next,
    },
    repeat: {
      ...d.repeat,
      ...i.repeat,
    }
  }
  const result = {
    ...config,
    layout: {
      ...layout_config,
      icons: i
    }
  }
  return result;

}

function processLayoutConfig(config: PlayerConfig): PlayerConfig {
  config = processPlayerIconsConfig(config);
  const layout_config = config.layout;
  return {
    ...config,
    layout: {
      ...DEFAULT_PLAYER_LAYOUT_CONFIG,
      ...layout_config
    }
  }
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
  player_config = processLayoutConfig(player_config);
  return {
    ...config,
    player: player_config
  }
}