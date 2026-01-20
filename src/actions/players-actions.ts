/* eslint-disable no-console */
import { ExtendedHass, ExtendedHassEntity } from "../const/types";

export default class PlayersActions {
  private _hass!: ExtendedHass;
  constructor(hass: ExtendedHass) {
    this.hass = hass;
  }
  public set hass(hass: ExtendedHass) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
        source_player,
      });
    } catch (error) {
      console.error(`Error calling transfer player`, error);
    }
  }
  async actionJoinPlayers(target_player: string, group_members: string[]) {
    const ent = this.hass.states[target_player] as ExtendedHassEntity;
    const current_members = ent.attributes.group_members?.filter((player) => {
      return player != target_player;
    });
    const members = current_members?.concat(group_members);
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
