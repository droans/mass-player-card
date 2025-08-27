import { HassEntity } from "home-assistant-js-websocket";
import { HomeAssistant } from "custom-card-helpers";
import { MediaTypes } from "../const";

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
    async actionGetFavorites(player_entity_id: string, media_type: MediaTypes, limit: number = 25) {
      const config_id = await this.getPlayerConfigEntry(player_entity_id);
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
      return response.response.items;
    }
    private async getPlayerConfigEntry(entity_id: string) {
      const entry = await this.hass.callWS<any>(
        {
          type: 'config/entity_registry/get',
          entity_id: entity_id
        }
      );
      const result: any = entry.config_entry_id;
      return result;
    }

}