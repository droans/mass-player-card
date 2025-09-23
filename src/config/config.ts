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
  MediaBrowserConfig,
  mediaBrowserConfigForm,
  processMediaBrowserConfig
} from "./media-browser";
import {
  DEFAULT_PLAYER_CONFIG,
  PlayerConfig,
  playerConfigForm
} from "./player";
import {
  DEFAULT_PLAYERS_CONFIG,
  PlayersConfig,
  playersConfigForm
} from "./players";
import {
  DEFAULT_QUEUE_CONFIG,
  QueueConfig,
  queueConfigForm
} from "./player-queue";

export interface EntityConfig {
  entity_id: string;
  volume_entity_id: string;
  max_volume: number;
  name: string;
}

export interface Config {
  entities: EntityConfig[];
  queue: QueueConfig;
  player: PlayerConfig;
  media_browser: MediaBrowserConfig;
  players: PlayersConfig;
}

export const DEFAULT_CONFIG = {
  queue: DEFAULT_QUEUE_CONFIG,
  player: DEFAULT_PLAYER_CONFIG,
  players: DEFAULT_PLAYERS_CONFIG,
  media_browser: DEFAULT_MEDIA_BROWSER_CONFIG
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
      {
        name: "player",
        type: "expandable",
        iconPath: mdiMusic,
        schema: playerConfigForm()
      },
    ]
  }
}

function entityConfigFromEntityID(entity_id: string): EntityConfig {
  return {
    entity_id: entity_id,
    volume_entity_id: entity_id,
    name: "",
    max_volume: DEFAULT_MAX_VOLUME,
  }
}

function processEntityConfig(config: string|EntityConfig): EntityConfig {
  if (typeof(config) == "string") {
    return entityConfigFromEntityID(config)
  }
  return {
    entity_id: config.entity_id,
    volume_entity_id: config?.volume_entity_id ?? config.entity_id,
    name: config?.name ?? "",
    max_volume: config?.max_volume ?? DEFAULT_MAX_VOLUME,
  }
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
  return config;
}