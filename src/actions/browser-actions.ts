import { HomeAssistant } from "custom-card-helpers";
import { MediaTypes } from "../const/common";

export default class BrowserActions {
    private hass: HomeAssistant;

    constructor(hass: HomeAssistant) {
      this.hass = hass;
    }
    
    async actionPlayMedia(entity_id: string, content_id: string, content_type: string) {
      await this.hass.callService(
        'media_player', 'play_media',
        {
          entity_id: entity_id,
          media_content_id: content_id,
          media_content_type: content_type
        }
      )
    }
    async actionPlayMediaFromService(service: string, player_entity_id: string) {
      const action = service.split('.');
      await this.hass.callService(
        action[0], action[1],
        { entity_id: player_entity_id }
      )
    }
    async actionGetFavorites(player_entity_id: string, media_type: MediaTypes, limit = 25) {
      const config_id = await this.getPlayerConfigEntry(player_entity_id);
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any, */
      const response = await this.hass.callWS<any>( 
        {
            type: 'call_service', 
            domain: 'music_assistant', 
            service: 'get_library', 
            service_data: {
                favorite: true, 
                limit: limit, 
                config_entry_id: config_id, 
                media_type: media_type
            },
            return_response: true
        }
      )
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-return, */
      return response.response.items;
    }
    private async getPlayerConfigEntry(entity_id: string) {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any, */
      const entry = await this.hass.callWS<any>(
        {
          type: 'config/entity_registry/get',
          entity_id: entity_id
        }
      );
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any, */
      const result: any = entry.config_entry_id;
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-return, */
      return result;
    }

}