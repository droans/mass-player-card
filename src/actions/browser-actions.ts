import { EnqueueOptions } from "../const/actions";
import { ExtendedHass, MediaTypes } from "../const/common";
import {
  DEFAULT_SEARCH_LIMIT,
  MediaLibraryItem,
  RecommendationResponse,
} from "../const/media-browser";
import { getRecommendationsServiceSchema } from "mass-queue-types/packages/mass_queue/actions/get_recommendations";
import { getLibraryServiceResponse, getLibraryServiceSchema } from "mass-queue-types/packages/music_assistant/actions/get_library"
import { searchServiceResponse, searchServiceSchema } from "mass-queue-types/packages/music_assistant/actions/search"
export default class BrowserActions {
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

  async actionPlayMedia(
    entity_id: string,
    content_id: string,
    content_type: string,
  ) {
    await this.hass.callService("media_player", "play_media", {
      entity_id: entity_id,
      media_content_id: content_id,
      media_content_type: content_type,
    });
  }
  async actionPlayMediaFromService(service: string, player_entity_id: string) {
    const action = service.split(".");
    await this.hass.callService(action[0], action[1], {
      entity_id: player_entity_id,
    });
  }
  async actionEnqueueMedia(
    entity_id: string,
    content_id: string,
    content_type: string,
    enqueue: EnqueueOptions,
  ) {
    const args = {
      entity_id: entity_id,
      media_id: content_id,
      media_type: content_type,
      enqueue: enqueue,
    };
    await this.hass.callService("music_assistant", "play_media", args);
  }
  async actionGetLibraryRecents(
    player_entity_id: string,
    media_type: MediaTypes,
    limit = 25,
  ): Promise<MediaLibraryItem[]> {
    const config_id = await this.getPlayerConfigEntry(player_entity_id);
     const data: getLibraryServiceSchema = {
        type: "call_service",
        domain: "music_assistant",
        service: "get_library",
        service_data: {
          limit: limit,
          config_entry_id: config_id,
          media_type: media_type,
          order_by: "last_played_desc",
        },
        return_response: true,
      }
    const response = await this.hass.callWS<getLibraryServiceResponse>(data);
    return response.response.items;
  }
  async actionGetLibrary(
    player_entity_id: string,
    media_type: MediaTypes,
    limit = 25,
    favorite = true,
  ): Promise<MediaLibraryItem[]> {
    const config_id = await this.getPlayerConfigEntry(player_entity_id);
     const data: getLibraryServiceSchema = {
      type: "call_service",
      domain: "music_assistant",
      service: "get_library",
      service_data: {
        favorite: favorite,
        limit: limit,
        config_entry_id: config_id,
        media_type: media_type,
      },
      return_response: true,
    }
    const response = await this.hass.callWS<getLibraryServiceResponse>(data);
    return response.response.items;
  }
  async actionSearchMedia(
    player_entity_id: string,
    search_term: string,
    media_type: MediaTypes,
    library_only = false,
    limit: number = DEFAULT_SEARCH_LIMIT,
  ): Promise<MediaLibraryItem[]> {
    const config_id = await this.getPlayerConfigEntry(player_entity_id);
    const args = {
      limit: limit,
      library_only: library_only,
      config_entry_id: config_id,
      name: search_term,
      media_type: [media_type],
    };
    const data: searchServiceSchema = {
      type: "call_service",
      domain: "music_assistant",
      service: "search",
      service_data: args,
      return_response: true,
    }
    const response = await this.hass.callWS<searchServiceResponse>(data);
    const response_media_type = media_type == MediaTypes.RADIO ? `radio` : `${media_type}s`;
    return (response.response[response_media_type] ?? []) as MediaLibraryItem[];
  }
  async actionGetRecommendations(
    player_entity_id: string,
    providers: string[] | null,
  ): Promise<RecommendationResponse> {
    const _providers = providers ? { providers: providers } : {};
    const data: getRecommendationsServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "get_recommendations",
      service_data: {
        entity: player_entity_id,
        ..._providers,
      },
      return_response: true,
    };
    return await this.hass.callWS<RecommendationResponse>(data);
  }
  async actionPlayRadio(
    entity_id: string,
    content_id: string,
    content_type: string,
  ) {
    await this.hass.callService("music_assistant", "play_media", {
      entity_id: entity_id,
      media_id: content_id,
      media_type: content_type,
      radio_mode: true,
    });
  }
  private async getPlayerConfigEntry(entity_id: string): Promise<string> {
    const entry = await this.hass.callWS<{config_entry_id: string}>({
      type: "config/entity_registry/get",
      entity_id: entity_id,
    });
    const result = entry.config_entry_id;
    return result;
  }
}
