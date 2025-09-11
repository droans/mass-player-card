import { HomeAssistant } from "custom-card-helpers";
import { mdiAlbum, mdiMusic, mdiPlaylistMusic, mdiSpeakerMultiple } from "@mdi/js";
import { queueConfigForm } from "./player-queue";
import { mediaBrowserConfigForm } from "./media-browser";
import { playersConfigForm } from "./players";
import { playerConfigForm } from "./player";

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
