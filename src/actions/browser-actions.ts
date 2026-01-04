import { EnqueueOptions } from "../const/enums";
import { MediaTypes } from "../const/enums";
import {
  DEFAULT_SEARCH_LIMIT,
} from "../const/media-browser";
import { getRecommendationsServiceSchema } from "mass-queue-types/packages/mass_queue/actions/get_recommendations";
import { getLibraryServiceResponse, getLibraryServiceSchema } from "mass-queue-types/packages/music_assistant/actions/get_library"
import { searchServiceResponse, searchServiceSchema } from "mass-queue-types/packages/music_assistant/actions/search"
import { getAlbumTracksServiceResponse, getAlbumTracksServiceSchema } from "mass-queue-types/packages/mass_queue/actions/get_album_tracks";
import { getArtistTracksServiceResponse, getArtistTracksServiceSchema } from "mass-queue-types/packages/mass_queue/actions/get_artist_tracks"
import { getPlaylistTracksServiceResponse, getPlaylistTracksServiceSchema } from "mass-queue-types/packages/mass_queue/actions/get_playlist_tracks"
import { getPlaylistServiceSchema, getPlaylistServiceResponse } from "mass-queue-types/packages/mass_queue/actions/get_playlist"
import { ExtendedHass, MediaLibraryItem, RecommendationResponse } from "../const/types";
import { getInfoWSResponseSchema, getInfoWSServiceSchema } from "mass-queue-types/packages/mass_queue/ws/get_info.js";
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
    favorite: boolean | null = true,
  ): Promise<MediaLibraryItem[]> {
    const config_id = await this.getPlayerConfigEntry(player_entity_id);
    const favorite_data = typeof(favorite) == 'boolean' ? {favorite: favorite} : {}
     const data: getLibraryServiceSchema = {
      type: "call_service",
      domain: "music_assistant",
      service: "get_library",
      service_data: {
        ...favorite_data,
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
  async actionGetPlaylistTracks(
    playlist_uri: string, 
    entity_id_or_config_entry_id: string,
  ): Promise<getPlaylistTracksServiceResponse> {
    let config_entry = '';
    if (entity_id_or_config_entry_id.includes('.')) {
      const info = await this.actionGetPlayerInfo(entity_id_or_config_entry_id);
      if (!info) {
        throw Error(`Received nothing back when getting tracks for playlist ${playlist_uri}!`)
      }
      config_entry = info.entries.mass_queue;
    } else {
      config_entry = entity_id_or_config_entry_id
    }
    const data: getPlaylistTracksServiceSchema = {
      type: 'call_service',
      domain: 'mass_queue',
      service: 'get_playlist_tracks',
      service_data: {
        uri: playlist_uri,
        config_entry_id: config_entry
      },
      return_response: true
    }
    return await this.hass.callWS(data)
  }
  async actionGetAlbumTracks(
    playlist_uri: string, 
    entity_id_or_config_entry_id: string,
  ): Promise<getAlbumTracksServiceResponse> {
    let config_entry = '';
    if (entity_id_or_config_entry_id.includes('.')) {
      const info = await this.actionGetPlayerInfo(entity_id_or_config_entry_id);
      if (!info) {
        throw Error(`Received nothing back when getting tracks for playlist ${playlist_uri}!`)
      }
      config_entry = info.entries.mass_queue;
    } else {
      config_entry = entity_id_or_config_entry_id
    }
    const data: getAlbumTracksServiceSchema = {
      type: 'call_service',
      domain: 'mass_queue',
      service: 'get_album_tracks',
      service_data: {
        uri: playlist_uri,
        config_entry_id: config_entry
      },
      return_response: true
    }
    return await this.hass.callWS(data)
  }
  async actionGetArtistTracks(
    playlist_uri: string, 
    entity_id_or_config_entry_id: string,
  ): Promise<getArtistTracksServiceResponse> {
    let config_entry = '';
    if (entity_id_or_config_entry_id.includes('.')) {
      const info = await this.actionGetPlayerInfo(entity_id_or_config_entry_id);
      if (!info) {
        throw Error(`Received nothing back when getting tracks for playlist ${playlist_uri}!`)
      }
      config_entry = info.entries.mass_queue;
    } else {
      config_entry = entity_id_or_config_entry_id
    }
    const data: getArtistTracksServiceSchema = {
      type: 'call_service',
      domain: 'mass_queue',
      service: 'get_artist_tracks',
      service_data: {
        uri: playlist_uri,
        config_entry_id: config_entry
      },
      return_response: true
    }
    return await this.hass.callWS(data)
  }
  async actionGetPlaylistData (
    playlist_uri: string,
    entity_id_or_config_entry_id: string,
  ): Promise<getPlaylistServiceResponse> {
    let config_entry = '';
    if (entity_id_or_config_entry_id.includes('.')) {
      const info = await this.actionGetPlayerInfo(entity_id_or_config_entry_id);
      if (!info) {
        throw Error(`Received nothing back when getting tracks for playlist ${playlist_uri}!`)
      }
      config_entry = info.entries.mass_queue;
    } else {
      config_entry = entity_id_or_config_entry_id
    }
    const data: getPlaylistServiceSchema = {
      type: 'call_service',
      domain: 'mass_queue',
      service: 'get_playlist',
      service_data: {
        uri: playlist_uri,
        config_entry_id: config_entry
      },
      return_response: true
    }
    return await this.hass.callWS(data);
  }
  private async getPlayerConfigEntry(entity_id: string): Promise<string> {
    const entry = await this.hass.callWS<{config_entry_id: string}>({
      type: "config/entity_registry/get",
      entity_id: entity_id,
    });
    const result = entry.config_entry_id;
    return result;
  }
  private async actionGetPlayerInfo(
    entity_id: string,
  ): Promise<getInfoWSResponseSchema | null> {
    const data: getInfoWSServiceSchema = {
      type: "mass_queue/get_info",
      entity_id: entity_id
    };
    return await this.hass.callWS(data);
  }

}
