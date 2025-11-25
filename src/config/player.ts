import { hiddenElementsConfigItem } from "../utils/config.js";
import { Config } from "./config";

export interface PlayerConfig {
  enabled: boolean;
  hide: PlayerHiddenElementsConfig;
  layout: PlayerLayoutConfig;
}

export interface PlayerControlsHiddenElementsConfig {
  power: boolean;
  repeat: boolean;
  shuffle: boolean;
  favorite: boolean;
}

export interface PlayerHiddenElementsConfig
  extends PlayerControlsHiddenElementsConfig {
  mute: boolean;
  player_selector: boolean;
  volume: boolean;
  group_volume: boolean;
}

export interface PlayerLayoutConfig {
  controls_layout: PlayerControlsLayout;
  hide_labels: boolean;
  icons: PlayerIcons;
  artwork_size: ArtworkSize;
}
export enum PlayerControlsLayout {
  COMPACT = "compact",
  SPACED = "spaced",
}
export interface PlayerIcons {
  shuffle: PlayerIcon;
  previous: PlayerIcon;
  play_pause: PlayerIcon;
  next: PlayerIcon;
  repeat: PlayerIcon;
  power: PlayerIcon;
  favorite: PlayerIcon;
}
export interface PlayerIcon {
  size: PlayerIconSize;
  box_shadow: boolean;
  label: boolean;
}
export enum ArtworkSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export enum PlayerIconSize {
  SMALL = "small",
  LARGE = "large",
}

export const DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG: PlayerHiddenElementsConfig =
  {
    favorite: false,
    mute: false,
    player_selector: false,
    power: false,
    repeat: false,
    shuffle: false,
    volume: false,
    group_volume: false,
  };
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
  power: {
    size: PlayerIconSize.SMALL,
    box_shadow: false,
    label: true,
  },
  favorite: {
    size: PlayerIconSize.SMALL,
    box_shadow: false,
    label: true,
  },
};
export const DEFAULT_PLAYER_LAYOUT_CONFIG: PlayerLayoutConfig = {
  controls_layout: PlayerControlsLayout.COMPACT,
  icons: DEFAULT_PLAYER_ICON_CONFIG,
  hide_labels: false,
  artwork_size: ArtworkSize.LARGE,
};
export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
  enabled: true,
  hide: DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
  layout: DEFAULT_PLAYER_LAYOUT_CONFIG,
};

const PLAYER_HIDDEN_ITEMS = [
  "favorite",
  "mute",
  "player_selector",
  "power",
  "repeat",
  "shuffle",
  "volume",
  "group_volume",
];

function iconConfigForm(icon_name: string) {
  return {
    name: icon_name,
    type: "expandable",
    schema: [
      {
        name: "label",
        selector: {
          boolean: {}
        },
        default: true,
        description: {
          suffix: `Show/hide the label for ${icon_name}`,
        }
      }
    ],
  }
}

function iconsConfigForm() {
  return {
    name: "icons",
    type: "expandable",
    schema: [
      iconConfigForm("power"),
      iconConfigForm("shuffle"),
      iconConfigForm("repeat"),
      iconConfigForm("favorite"),
    ]
  }
}

function artworkSizeConfigForm() {
  return {
    name: "artwork_size",
    selector: {
      select: {
        multiple: false,
        custom_value: true,
        mode: "dropdown",
        options: [
          {
            "label": "Small (14em, Apx < 200px)",
            "value": "small",
            "description": "14em, apx 200px"
          },
          {
            "label": "Medium",
            "value": "medium",
            "description": "22em, apx 300px"
          },
          {
            "label": "Large",
            "value": "large",
            "description": "Full Card"
          }
        ]
      },
      default: "large",
      description: {
        suffix: `Set the size of the artwork in the card`,
      }
    }
  }
}

function layoutConfigForm() {
  return { 
    name: "layout",
    type: "expandable",
    schema: [
     artworkSizeConfigForm(), 
     { name: "hide_labels", selector: { boolean: {} }, default: false },
     iconsConfigForm(),
    ]
  }
}

export function playerConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} }, default: true },
    hiddenElementsConfigItem(PLAYER_HIDDEN_ITEMS),
    layoutConfigForm(),
  ];
}

function processPlayerIconsConfig(config: PlayerConfig): PlayerConfig {
  const layout_config = config.layout;
  const d = DEFAULT_PLAYER_ICON_CONFIG;
  const icons_config = layout_config.icons;

  let i: PlayerIcons = {
    ...d,
    ...icons_config,
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
    },
    power: {
      ...d.power,
      ...i.power,
    },
    favorite: {
      ...d.favorite,
      ...i.favorite,
    },
  };
  const result = {
    ...config,
    layout: {
      ...layout_config,
      icons: i,
    },
  };
  return result;
}

function processLayoutConfig(config: PlayerConfig): PlayerConfig {
  config = processPlayerIconsConfig(config);
  const layout_config = config.layout;
  return {
    ...config,
    layout: {
      ...DEFAULT_PLAYER_LAYOUT_CONFIG,
      ...layout_config,
    },
  };
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
  player_config = processLayoutConfig(player_config);
  return {
    ...config,
    player: player_config,
  };
}
