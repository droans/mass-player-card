import { HomeAssistant } from "custom-card-helpers";

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