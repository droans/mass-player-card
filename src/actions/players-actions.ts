import { HomeAssistant } from "custom-card-helpers";

export default class PlayersActions {
  private hass: HomeAssistant;
  constructor(hass: HomeAssistant) {
    this.hass = hass;
  }

  async actionTransferQueue(source_player: string, target_players: string) {
    try {
      await this.hass.callService(
        'music_assistant', 'transfer_queue',
        {
          'entity_id': target_players,
          'source_player': source_player
        }
      )
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error(`Error calling transfer player`, e)
    }
  }
  async actionJoinPlayers(target_player: string, group_members: string) {
    try {
      await this.hass.callService(
        'media_player', 'join',
        {
          'entity_id': target_player,
          'group_members': group_members
        }
      )
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error(`Error joining players`, e)
    }
  }
  async actionUnjoinPlayers(player_entity: string) {
    try {
      await this.hass.callService(
        'media_player', 'unjoin',
        {
          'entity_id': player_entity
        }
      )
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error(`Error unjoining players`, e)
    }
  }
}