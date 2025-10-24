import {
  mdiAlbum,
  mdiMusic,
  mdiPlaylistMusic,
  mdiSpeakerMultiple
} from "@mdi/js";


import {
  DEFAULT_MAX_VOLUME
} from "../const/music-player";
import { ExtendedHass } from "../const/common";

import {
  DEFAULT_MEDIA_BROWSER_CONFIG,
  DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG,
  MediaBrowserConfig,
  mediaBrowserConfigForm,
  MediaBrowserHiddenElementsConfig,
  processMediaBrowserConfig
} from "./media-browser";
import {
  DEFAULT_PLAYER_CONFIG,
  DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
  PlayerConfig,
  playerConfigForm,
  PlayerHiddenElementsConfig,
  processPlayerConfig
} from "./player";
import {
  DEFAULT_PLAYERS_CONFIG,
  DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG,
  PlayersConfig,
  playersConfigForm,
  PlayersHiddenElementsConfig,
  processPlayersConfig
} from "./players";
import {
  DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG,
  DEFAULT_QUEUE_CONFIG,
  PlayerQueueHiddenElementsConfig,
  processQueueConfig,
  QueueConfig,
  queueConfigForm
} from "./player-queue";

export interface Config {
  entities: EntityConfig[];
  queue: QueueConfig;
  player: PlayerConfig;
  media_browser: MediaBrowserConfig;
  players: PlayersConfig;
  expressive: boolean;
  download_local: boolean;
}

interface HiddenElementsConfig {
  player: PlayerHiddenElementsConfig;
  queue: PlayerQueueHiddenElementsConfig;
  media_browser: MediaBrowserHiddenElementsConfig;
  players: PlayersHiddenElementsConfig
};

export interface EntityConfig {
  entity_id: string;
  volume_entity_id: string;
  max_volume: number;
  name: string;
  hide: HiddenElementsConfig;
  inactive_when_idle: boolean;
}

export const DEFAULT_CONFIG: Config = {
  queue: DEFAULT_QUEUE_CONFIG,
  player: DEFAULT_PLAYER_CONFIG,
  players: DEFAULT_PLAYERS_CONFIG,
  media_browser: DEFAULT_MEDIA_BROWSER_CONFIG,
  expressive: true,
  entities: [],
  download_local: false,
}

const ENTITY_DEFAULT_HIDDEN_ITEM_CONFIG: HiddenElementsConfig = {
  player: DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
  queue: DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG,
  media_browser: DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG,
  players: DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG,
}

export function createStubConfig(hass: ExtendedHass, entities: string[]) {
  const media_players = entities.filter(
    (ent) => {
      return ent.split(".")[0] == "media_player";
    }
  )
  const mass_players = media_players.filter(
    (ent) => {
      return hass.states[ent]?.attributes?.mass_player_type;
    }
  )
  return {
    entities: [mass_players[0]]
  }
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
            domain: "media_player"
          }
        },
      },
      {
        "name": "expressive",
        required: false,
        selector: { boolean: {}, default: true }
      },
      {
        "name": "download_local",
        required: false,
        selector: { boolean: {}, default: false }
      },
      {
        name: "player",
        type: "expandable",
        iconPath: mdiMusic,
        schema: playerConfigForm()
      },
      {
        name: "queue",
        type: "expandable",
        iconPath: mdiPlaylistMusic,
        schema: queueConfigForm()
      },
      {
        name: "media_browser",
        type: "expandable",
        iconPath: mdiAlbum,
        schema: mediaBrowserConfigForm()
      },
      {
        name: "players",
        type: "expandable",
        iconPath: mdiSpeakerMultiple,
        schema: playersConfigForm()
      },
    ]
  }
}

function processEntityHiddenItemConfig(config: EntityConfig): HiddenElementsConfig {
  const used_hide = config?.hide;
  const hide: HiddenElementsConfig = {
    ...ENTITY_DEFAULT_HIDDEN_ITEM_CONFIG,
    ...used_hide,
  }
  hide.player = {
    ...DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
    ...hide?.player,
  }
  
  return hide;
}

function entityConfigFromEntityID(entity_id: string): EntityConfig {
  return {
    entity_id: entity_id,
    volume_entity_id: entity_id,
    name: "",
    max_volume: DEFAULT_MAX_VOLUME,
    hide: ENTITY_DEFAULT_HIDDEN_ITEM_CONFIG,
    inactive_when_idle: false
  }
}

function processEntityConfig(config: string|EntityConfig): EntityConfig {
  if (typeof(config) == "string") {
    return entityConfigFromEntityID(config)
  }
  const HIDDEN_ELEMENTS = processEntityHiddenItemConfig(config);
  const r = {
    entity_id: config.entity_id,
    volume_entity_id: config?.volume_entity_id ?? config.entity_id,
    name: config?.name ?? "",
    max_volume: config?.max_volume ?? DEFAULT_MAX_VOLUME,
    hide: HIDDEN_ELEMENTS,
    inactive_when_idle: config?.inactive_when_idle ?? false,
  }
  return r;
}

function mergeDefaultConfig(config: Config): Config {
  return {
    ...DEFAULT_CONFIG,
    ...config
  }
}

function processEntitiesConfig(config: Config): Config {
  const entity_config = config.entities;
  const result: EntityConfig[] = [];
  entity_config.forEach(
    (entity: string|EntityConfig) => {
      result.push(processEntityConfig(entity))
    }
  )
  return {
    ...config,
    entities: result
  }
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