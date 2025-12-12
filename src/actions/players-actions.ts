/* eslint-disable no-console */
import { ExtendedHass } from "../const/types";

export default class PlayersActions {
  private _hass!: ExtendedHass;
  constructor(hass: ExtendedHass) {
    this.hass = hass;
  }
  public set hass(hass: ExtendedHass) {
    if (hass) {
      this._hass = hass;
    }
  }
  public get hass() {
    return this._hass;
  }

  async actionTransferQueue(source_player: string, target_players: string) {
    try {
      await this.hass.callService("music_assistant", "transfer_queue", {
        entity_id: target_players,
        source_player: source_player,
      });
    } catch (e) {
      console.error(`Error calling transfer player`, e);
    }
  }
  async actionJoinPlayers(target_player: string, group_members: string[]) {
    const cur_members = this.hass.states[target_player].attributes.group_members.filter(
      (player) => {
        return player != target_player
      }
    )
    const members = cur_members.concat (group_members);    
    await this.hass.callService("media_player", "join", {
      entity_id: target_player,
      group_members: members,
    });
  }
  async actionUnjoinPlayers(player_entity: string[]) {
    await this.hass.callService("media_player", "unjoin", {
      entity_id: player_entity,
    });
  }
}
