import { EnqueueOptions } from "../const/actions";
import { ExtendedHass, MediaTypes } from "../const/common";
import { DEFAULT_SEARCH_LIMIT, MediaLibraryItem, RecommendationResponse } from "../const/media-browser";

export default class BrowserActions {
    private _hass!: ExtendedHass;

    constructor(hass: ExtendedHass) {
      this.hass = hass;
    }
    public set hass(hass: ExtendedHass) {
      this._hass = hass;
    }
    public get hass() {
      return this._hass;
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
    async actionGetLibraryRecents(player_entity_id: string, media_type: MediaTypes, limit = 25): Promise<MediaLibraryItem[]> {
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
                limit: limit,
                config_entry_id: config_id,
                media_type: media_type,
                order_by: 'last_played_desc'
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
    async actionGetLibrary(player_entity_id: string, media_type: MediaTypes, limit = 25, favorite=true): Promise<MediaLibraryItem[]> {
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
                favorite: favorite,
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
    async actionSearchMedia(
      player_entity_id: string,
      search_term: string,
      media_type: MediaTypes,
      library_only = false,
      limit: number = DEFAULT_SEARCH_LIMIT
    ): Promise<MediaLibraryItem[]> {
      const config_id = await this.getPlayerConfigEntry(player_entity_id);
      const args = {
        limit: limit,
        library_only: library_only,
        config_entry_id: config_id,
        name: search_term,
        media_type: [media_type]
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const response = await this.hass.callWS<any>(
        {
            type: 'call_service',
            domain: 'music_assistant',
            service: 'search',
            service_data: args,
            return_response: true
        }
      );
      const response_media_type = `${media_type}s`
      /* eslint-disable-next-line
      @typescript-eslint/no-unsafe-member-access,
      @typescript-eslint/no-unsafe-return,
      */
      return response.response[response_media_type];
    }
  async actionGetRecommendations(
    player_entity_id: string,
    providers: string | null
  ): Promise<RecommendationResponse> {
    const _providers = providers ? {providers: providers} : {};
    const data = {
      type: 'call_service',
      domain: 'mass_queue',
      service: 'get_recommendations',
      service_data: {
        entity: player_entity_id,
        ..._providers
      },
      return_response: true
    }
      /* eslint-disable-next-line
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-return,
      */
    return await this.hass.callWS<any>(
      data
    )
  }
  async actionPlayRadio(entity_id: string, content_id: string, content_type: string) {
    await this.hass.callService(
      'music_assistant', 'play_media',
      {
        entity_id: entity_id,
        media_id: content_id,
        media_type: content_type,
        radio_mode: true
      }
    )
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