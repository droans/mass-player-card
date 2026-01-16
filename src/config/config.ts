/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
  mdiAlbum,
  mdiMusic,
  mdiPlaylistMusic,
  mdiSpeakerMultiple,
} from "@mdi/js";

import { DEFAULT_MAX_VOLUME } from "../const/music-player";
import { ExtendedHass } from "../const/types";

import {
  DEFAULT_MEDIA_BROWSER_CONFIG,
  DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG,
  MediaBrowserConfig,
  mediaBrowserConfigForm,
  MediaBrowserHiddenElementsConfig,
  processMediaBrowserConfig,
} from "./media-browser";
import {
  DEFAULT_PLAYER_CONFIG,
  DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
  PlayerConfig,
  playerConfigForm,
  PlayerHiddenElementsConfig,
  processPlayerConfig,
} from "./player";
import {
  DEFAULT_PLAYERS_CONFIG,
  DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG,
  PlayersConfig,
  playersConfigForm,
  PlayersHiddenElementsConfig,
  processPlayersConfig,
} from "./players";
import {
  DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG,
  DEFAULT_QUEUE_CONFIG,
  PlayerQueueHiddenElementsConfig,
  processQueueConfig,
  QueueConfig,
  queueConfigForm,
} from "./player-queue";

export interface Config {
  entities: EntityConfig[];
  queue: QueueConfig;
  player: PlayerConfig;
  media_browser: MediaBrowserConfig;
  players: PlayersConfig;
  expressive: boolean;
  expressive_scheme: ExpressiveScheme;
  download_local: boolean;
  panel: boolean;
  default_section: ConfigSections | undefined;
}

export type ConfigSections =
  | "music_player"
  | "queue"
  | "media_browser"
  | "players";

export interface HiddenElementsConfig {
  player: PlayerHiddenElementsConfig;
  queue: PlayerQueueHiddenElementsConfig;
  media_browser: MediaBrowserHiddenElementsConfig;
  players: PlayersHiddenElementsConfig;
}

export type BaseHiddenElementsConfig = Record<string, boolean>;

export interface EntityConfig {
  entity_id: string;
  volume_entity_id: string;
  max_volume: number;
  name: string;
  hide: HiddenElementsConfig;
  inactive_when_idle: boolean;
}

export type ExpressiveScheme =
  | "content"
  | "expressive"
  | "fidelity"
  | "fruit_salad"
  | "monochrome"
  | "neutral"
  | "rainbow"
  | "tonal_spot"
  | "vibrant";

export const DEFAULT_CONFIG: Config = {
  queue: DEFAULT_QUEUE_CONFIG,
  player: DEFAULT_PLAYER_CONFIG,
  players: DEFAULT_PLAYERS_CONFIG,
  media_browser: DEFAULT_MEDIA_BROWSER_CONFIG,
  expressive: true,
  expressive_scheme: "expressive",
  entities: [],
  download_local: false,
  panel: false,
  default_section: undefined,
};

const ENTITY_DEFAULT_HIDDEN_ITEM_CONFIG: HiddenElementsConfig = {
  player: DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
  queue: DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG,
  media_browser: DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG,
  players: DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG,
};

export function createStubConfig(hass: ExtendedHass, entities: string[]) {
  const media_players = entities.filter((ent) => {
    return ent.split(".")[0] == "media_player";
  });
  const mass_player = media_players.find((ent) => {
    return hass.states[ent]?.attributes.mass_player_type;
  });
  return {
    entities: [mass_player],
  };
}

function createDefaultSectionConfigForm() {
  return {
    name: "default_section",
    required: false,
    selector: {
      select: {
        multiple: false,
        mode: "dropdown",
        options: [
          {
            value: "music_player",
            label: "Music Player",
          },
          {
            value: "queue",
            label: "Player Queue",
          },
          {
            value: "media_browser",
            label: "Media Browser",
          },
          {
            value: "players",
            label: "Players",
          },
        ],
      },
    },
  };
}

function createExpressiveSchemeConfigForm() {
  return {
    name: "expressive_scheme",
    required: false,
    selector: {
      select: {
        multiple: false,
        mode: "dropdown",
        options: [
          {
            value: "content",
            label: "Content",
          },
          {
            value: "expressive",
            label: "Expressive",
          },
          {
            value: "fidelity",
            label: "Fidelity",
          },
          {
            value: "fruit_salad",
            label: "Fruit Salad",
          },
          {
            value: "monochrome",
            label: "Monochrome",
          },
          {
            value: "neutral",
            label: "Neutral",
          },
          {
            value: "rainbow",
            label: "Rainbow",
          },
          {
            value: "tonal_spot",
            label: "Tonal Spot",
          },
          {
            value: "vibrant",
            label: "Vibrant",
          },
        ],
      },
    },
  };
}

export function createConfigForm() {
  return {
    schema: [
      {
        name: "entities",
        required: true,
        selector: {
          entity: {
            multiple: true,
            integration: "music_assistant",
            domain: "media_player",
          },
        },
      },
      {
        name: "expressive",
        required: false,
        selector: { boolean: {}, default: true },
      },
      createExpressiveSchemeConfigForm(),
      createDefaultSectionConfigForm(),
      {
        name: "download_local",
        required: false,
        selector: { boolean: {}, default: false },
      },
      {
        name: "panel",
        required: false,
        selector: { boolean: {}, default: false },
      },
      {
        name: "player",
        type: "expandable",
        iconPath: mdiMusic,
        schema: playerConfigForm(),
      },
      {
        name: "queue",
        type: "expandable",
        iconPath: mdiPlaylistMusic,
        schema: queueConfigForm(),
      },
      {
        name: "media_browser",
        type: "expandable",
        iconPath: mdiAlbum,
        schema: mediaBrowserConfigForm(),
      },
      {
        name: "players",
        type: "expandable",
        iconPath: mdiSpeakerMultiple,
        schema: playersConfigForm(),
      },
    ],
  };
}

function processEntityHiddenItemConfig(
  config: EntityConfig,
): HiddenElementsConfig {
  const used_hide = config?.hide;
  const hide: HiddenElementsConfig = {
    ...ENTITY_DEFAULT_HIDDEN_ITEM_CONFIG,
    ...used_hide,
  };
  hide.player = {
    ...DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
    ...hide?.player,
  };

  return hide;
}

function entityConfigFromEntityID(entity_id: string): EntityConfig {
  return {
    entity_id,
    volume_entity_id: entity_id,
    name: "",
    max_volume: DEFAULT_MAX_VOLUME,
    hide: ENTITY_DEFAULT_HIDDEN_ITEM_CONFIG,
    inactive_when_idle: false,
  };
}

function processEntityConfig(config: string | EntityConfig): EntityConfig {
  if (typeof config == "string") {
    return entityConfigFromEntityID(config);
  }
  const HIDDEN_ELEMENTS = processEntityHiddenItemConfig(config);
  const r = {
    entity_id: config.entity_id,
    volume_entity_id: config?.volume_entity_id ?? config.entity_id,
    name: config?.name ?? "",
    max_volume: config?.max_volume ?? DEFAULT_MAX_VOLUME,
    hide: HIDDEN_ELEMENTS,
    inactive_when_idle: config?.inactive_when_idle ?? false,
  };
  return r;
}

function mergeDefaultConfig(config: Config): Config {
  return {
    ...DEFAULT_CONFIG,
    ...config,
  };
}

function processEntitiesConfig(config: Config): Config {
  const entity_config = config.entities;
  const result: EntityConfig[] = [];
  entity_config.forEach((entity: string | EntityConfig) => {
    result.push(processEntityConfig(entity));
  });
  return {
    ...config,
    entities: result,
  };
}

export function processConfig(config: Config): Config {
  config = mergeDefaultConfig(config);
  config = processEntitiesConfig(config);
  config = processMediaBrowserConfig(config);
  config = processPlayerConfig(config);
  config = processQueueConfig(config);
  config = processPlayersConfig(config);
  return config;
}
