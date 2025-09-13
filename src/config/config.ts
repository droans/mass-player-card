import { HomeAssistant } from "custom-card-helpers";
import { mdiAlbum, mdiMusic, mdiPlaylistMusic, mdiSpeakerMultiple } from "@mdi/js";
import { queueConfigForm } from "./player-queue";
import { mediaBrowserConfigForm } from "./media-browser";
import { playersConfigForm } from "./players";
import { playerConfigForm } from "./player";
export interface EntityConfig {
  entity_id: string;
  volume_entity_id: string;
  name: string;
}

export interface Config {
  entities: EntityConfig[];
  queue: QueueConfig;
  player: PlayerConfig;
  media_browser: MediaBrowserConfig;
  players: PlayersConfig;
}

export function createStubConfig(hass: HomeAssistant, entities: string[]) {
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
  }
}

export function processEntitiesConfig(config: string[]|EntityConfig[]): EntityConfig[] {
  const result: EntityConfig[] = [];
  config.forEach(
    (entity: string|EntityConfig) => {
        result.push(processEntityConfig(entity))
    }
  )
  return result;
}