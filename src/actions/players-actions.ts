/* eslint-disable no-console */
import { ExtendedHass } from "../const/common"

export default class PlayersActions {
  private _hass!: ExtendedHass
  constructor(hass: ExtendedHass) {
    this.hass = hass
  }
  public set hass(hass: ExtendedHass) {
    if (hass) {
      this._hass = hass
    }
  }
  public get hass() {
    return this._hass
  }

  async actionTransferQueue(source_player: string, target_players: string) {
    try {
      await this.hass.callService("music_assistant", "transfer_queue", {
        entity_id: target_players,
        source_player: source_player,
      })
    } catch (e) {
      console.error(`Error calling transfer player`, e)
    }
  }
  async actionJoinPlayers(target_player: string, group_members: string) {
    try {
      await this.hass.callService("media_player", "join", {
        entity_id: target_player,
        group_members: group_members,
      })
    } catch (e) {
      console.error(`Error joining players`, e)
    }
  }
  async actionUnjoinPlayers(player_entity: string) {
    try {
      await this.hass.callService("media_player", "unjoin", {
        entity_id: player_entity,
      })
    } catch (e) {
      console.error(`Error unjoining players`, e)
    }
  }
}
