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

  async actionTransferQueue(sourcePlayer: string, targetPlayers: string) {
    try {
      await this.hass.callService("music_assistant", "transfer_queue", {
        entity_id: targetPlayers,
        source_player: sourcePlayer,
      });
    } catch (error) {
      console.error(`Error calling transfer player`, error);
    }
  }
  async actionJoinPlayers(targetPlayer: string, groupMembers: string[]) {
    const ent = this.hass.states[targetPlayer] as ExtendedHassEntity;
    const currentMembers = ent.attributes.group_members?.filter((player) => {
      return player != targetPlayer;
    });
    const members = currentMembers?.concat(groupMembers);
    await this.hass.callService("media_player", "join", {
      entity_id: targetPlayer,
      group_members: members,
    });
  }
  async actionUnjoinPlayers(playerEntity: string[]) {
    await this.hass.callService("media_player", "unjoin", {
      entity_id: playerEntity,
    });
  }
}
