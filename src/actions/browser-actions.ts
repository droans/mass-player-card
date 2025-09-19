import { EnqueueOptions } from "../const/actions";
import { ExtendedHass, MediaTypes } from "../const/common";
import { MediaLibraryItem } from "../const/media-browser";

export default class BrowserActions {
    private hass: ExtendedHass;

    constructor(hass: ExtendedHass) {
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
    async actionEnqueueMedia(entity_id: string, content_id: string, content_type: string, enqueue: EnqueueOptions) {
      const args = {
        entity_id: entity_id,
        media_id: content_id,
        media_type: content_type,
        enqueue: enqueue
      }
      await this.hass.callService(
        'music_assistant', 'play_media',
        args
      )
    }
    async actionGetFavorites(player_entity_id: string, media_type: MediaTypes, limit = 25): Promise<MediaLibraryItem[]> {
      const config_id = await this.getPlayerConfigEntry(player_entity_id);
      /* eslint-disable-next-line 
        @typescript-eslint/no-explicit-any, 
        @typescript-eslint/no-unsafe-assignment, 
      */
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
      /* eslint-disable-next-line 
        @typescript-eslint/no-unsafe-return, 
        @typescript-eslint/no-unsafe-member-access
      */
      return response.response.items;
    }
    private async getPlayerConfigEntry(entity_id: string): Promise<string> {
      /* eslint-disable
        @typescript-eslint/no-explicit-any, 
        @typescript-eslint/no-unsafe-assignment, 
        @typescript-eslint/no-unsafe-member-access 
      */
      const entry = await this.hass.callWS<any>(
        {
          type: 'config/entity_registry/get',
          entity_id: entity_id
        }
      );
      const result: any = entry.config_entry_id;
      /* eslint-enable */
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-return, */
      return result;
    }

}