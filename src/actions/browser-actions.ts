import { EnqueueOptions, MediaTypes } from "../const/enums";
import { DEFAULT_SEARCH_LIMIT } from "../const/media-browser";
import { getRecommendationsServiceSchema } from "mass-queue-types/packages/mass_queue/actions/get_recommendations";
import {
  getLibraryServiceResponse,
  getLibraryServiceSchema,
} from "mass-queue-types/packages/music_assistant/actions/get_library";
import {
  searchPartialServiceResponse,
  searchServiceData,
  searchServiceResponse,
  searchServiceSchema,
} from "mass-queue-types/packages/music_assistant/actions/search";
import {
  getAlbumTracksServiceResponse,
  getAlbumTracksServiceSchema,
} from "mass-queue-types/packages/mass_queue/actions/get_album_tracks";
import {
  getArtistTracksServiceResponse,
  getArtistTracksServiceSchema,
} from "mass-queue-types/packages/mass_queue/actions/get_artist_tracks";
import {
  getPlaylistTracksServiceResponse,
  getPlaylistTracksServiceSchema,
} from "mass-queue-types/packages/mass_queue/actions/get_playlist_tracks";
import {
  getPodcastEpisodesServiceRespnse,
  getPodcastEpisodeServiceSchema,
} from "mass-queue-types/packages/mass_queue/actions/get_podcast_episodes";
import {
  getPlaylistServiceSchema,
  getPlaylistServiceResponse,
} from "mass-queue-types/packages/mass_queue/actions/get_playlist";
import {
  ExtendedHass,
  MediaLibraryItem,
  RecommendationResponse,
} from "../const/types";
import {
  getInfoWSResponseSchema,
  getInfoWSServiceSchema,
} from "mass-queue-types/packages/mass_queue/ws/get_info";
import {
  getAlbumServiceResponse,
  getAlbumServiceSchema,
} from "mass-queue-types/packages/mass_queue/actions/get_album";
import {
  getArtistServiceResponse,
  getArtistServiceSchema,
} from "mass-queue-types/packages/mass_queue/actions/get_artist";
import {
  getPodcastServiceResponse,
  getPodcastServiceSchema,
} from "mass-queue-types/packages/mass_queue/actions/get_podcast";
import { removePlaylistTracksServiceSchema } from "mass-queue-types/packages/mass_queue/actions/remove_playlist_tracks";
import { GetLibrarySortOrders } from "../config/media-browser";
export default class BrowserActions {
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

  async actionPlayMedia(
    entityId: string,
    contentId: string,
    contentType: string,
    userId: string | null = null,
  ) {
    const userParameter = userId ? { username: userId } : {};
    await this.hass.callService("music_assistant", "play_media", {
      entity_id: entityId,
      content_id: contentId,
      content_type: contentType,
      ...userParameter,
    });
  }
  async actionPlayMediaFromService(service: string, playerEntityId: string) {
    const action = service.split(".");
    await this.hass.callService(action[0], action[1], {
      entity_id: playerEntityId,
    });
  }
  async actionEnqueueMedia(
    entityId: string,
    contentId: string,
    contentType: string,
    enqueue: EnqueueOptions,
    userId: string | null = null,
  ) {
    const userParameter = userId ? { username: userId } : {};
    const baseArguments_ = {
      entity_id: entityId,
      media_id: contentId,
      media_type: contentType,
      ...userParameter,
    };
    const arguments_ =
      enqueue == EnqueueOptions.RADIO
        ? { ...baseArguments_, radio_mode: true }
        : { ...baseArguments_, enqueue };
    await this.hass.callService("music_assistant", "play_media", arguments_);
  }
  async actionGetLibraryRecents(
    playerEntityId: string,
    mediaType: MediaTypes,
    limit = 25,
    sortOrder: GetLibrarySortOrders | null = "last_played_desc",
    userId: string | null = null,
  ): Promise<MediaLibraryItem[]> {
    const configId = await this.getPlayerConfigEntry(playerEntityId);
    const sort: GetLibrarySortOrders = sortOrder ?? "last_played_desc";
    const userParameter = userId ? { username: userId } : {};
    const data: getLibraryServiceSchema = {
      type: "call_service",
      domain: "music_assistant",
      service: "get_library",
      service_data: {
        limit,
        config_entry_id: configId,
        media_type: mediaType,
        order_by: sort,
        ...userParameter,
      },
      return_response: true,
    };
    const response = await this.hass.callWS<getLibraryServiceResponse>(data);
    return response.response.items;
  }
  async actionGetLibrary(
    playerEntityId: string,
    mediaType: MediaTypes,
    limit = 25,
    favorite: boolean | null = true,
    sortOrder: GetLibrarySortOrders | null = null,
    userId: string | null = null,
  ): Promise<MediaLibraryItem[]> {
    const configId = await this.getPlayerConfigEntry(playerEntityId);
    const favoriteData = typeof favorite == "boolean" ? { favorite } : {};
    const sort = sortOrder ? { order_by: sortOrder } : {};
    const userParameter = userId ? { username: userId } : {};
    const data: getLibraryServiceSchema = {
      type: "call_service",
      domain: "music_assistant",
      service: "get_library",
      service_data: {
        ...favoriteData,
        limit,
        config_entry_id: configId,
        media_type: mediaType,
        ...sort,
        ...userParameter,
      },
      return_response: true,
    };
    const response = await this.hass.callWS<getLibraryServiceResponse>(data);
    return response.response.items;
  }
  async actionSearchMedia(
    playerEntityId: string,
    searchTerm: string,
    libraryOnly = false,
    limit: number = DEFAULT_SEARCH_LIMIT,
    userId: string | null = null,
    mediaType?: MediaTypes,
  ): Promise<searchPartialServiceResponse> {
    const configId = await this.getPlayerConfigEntry(playerEntityId);
    const userParameter = userId ? { username: userId } : {};
    const arguments_: searchServiceData = {
      limit,
      library_only: libraryOnly,
      config_entry_id: configId,
      name: searchTerm,
      ...userParameter,
    };
    if (mediaType) {
      arguments_.media_type = [mediaType];
    }
    const data: searchServiceSchema = {
      type: "call_service",
      domain: "music_assistant",
      service: "search",
      service_data: arguments_,
      return_response: true,
    };
    const response = await this.hass.callWS<searchServiceResponse>(data);
    return response.response;
  }
  async actionGetRecommendations(
    playerEntityId: string,
    providers: string[] | null,
  ): Promise<RecommendationResponse> {
    const _providers = providers ? { providers } : {};
    const data: getRecommendationsServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "get_recommendations",
      service_data: {
        entity: playerEntityId,
        ..._providers,
      },
      return_response: true,
    };
    return await this.hass.callWS<RecommendationResponse>(data);
  }
  async actionPlayRadio(
    entityId: string,
    contentId: string,
    contentType: string,
    userId: string | null = null,
  ) {
    const userParameter = userId ? { username: userId } : {};
    await this.hass.callService("music_assistant", "play_media", {
      entity_id: entityId,
      media_id: contentId,
      media_type: contentType,
      radio_mode: true,
      ...userParameter,
    });
  }
  async actionGetPlaylistTracks(
    playlistUri: string,
    entityIdOrConfigEntryId: string,
  ): Promise<getPlaylistTracksServiceResponse> {
    let configEntry: string;
    if (entityIdOrConfigEntryId.includes(".")) {
      const info = await this.actionGetPlayerInfo(entityIdOrConfigEntryId);
      if (!info) {
        throw new Error(
          `Received nothing back when getting tracks for playlist ${playlistUri}!`,
        );
      }
      configEntry = info.entries.mass_queue;
    } else {
      configEntry = entityIdOrConfigEntryId;
    }
    const data: getPlaylistTracksServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "get_playlist_tracks",
      service_data: {
        uri: playlistUri,
        config_entry_id: configEntry,
      },
      return_response: true,
    };
    return await this.hass.callWS(data);
  }
  async actionGetAlbumTracks(
    playlistUri: string,
    entityIdOrConfigEntryId: string,
  ): Promise<getAlbumTracksServiceResponse> {
    let configEntry: string;
    if (entityIdOrConfigEntryId.includes(".")) {
      const info = await this.actionGetPlayerInfo(entityIdOrConfigEntryId);
      if (!info) {
        throw new Error(
          `Received nothing back when getting tracks for playlist ${playlistUri}!`,
        );
      }
      configEntry = info.entries.mass_queue;
    } else {
      configEntry = entityIdOrConfigEntryId;
    }
    const data: getAlbumTracksServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "get_album_tracks",
      service_data: {
        uri: playlistUri,
        config_entry_id: configEntry,
      },
      return_response: true,
    };
    return await this.hass.callWS(data);
  }
  async actionGetArtistTracks(
    playlistUri: string,
    entityIdOrConfigEntryId: string,
  ): Promise<getArtistTracksServiceResponse> {
    let configEntry: string;
    if (entityIdOrConfigEntryId.includes(".")) {
      const info = await this.actionGetPlayerInfo(entityIdOrConfigEntryId);
      if (!info) {
        throw new Error(
          `Received nothing back when getting tracks for playlist ${playlistUri}!`,
        );
      }
      configEntry = info.entries.mass_queue;
    } else {
      configEntry = entityIdOrConfigEntryId;
    }
    const data: getArtistTracksServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "get_artist_tracks",
      service_data: {
        uri: playlistUri,
        config_entry_id: configEntry,
      },
      return_response: true,
    };
    return await this.hass.callWS(data);
  }
  async actionGetPodcastEpisodes(
    podcastUri: string,
    entityIdOrConfigEntryId: string,
  ): Promise<getPodcastEpisodesServiceRespnse> {
    let configEntry: string;
    if (entityIdOrConfigEntryId.includes(".")) {
      const info = await this.actionGetPlayerInfo(entityIdOrConfigEntryId);
      if (!info) {
        throw new Error(
          `Received nothing back when getting tracks for playlist ${podcastUri}!`,
        );
      }
      configEntry = info.entries.mass_queue;
    } else {
      configEntry = entityIdOrConfigEntryId;
    }
    const data: getPodcastEpisodeServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "get_podcast_episodes",
      service_data: {
        uri: podcastUri,
        config_entry_id: configEntry,
      },
      return_response: true,
    };
    return await this.hass.callWS(data);
  }
  async actionGetPlaylistData(
    playlistUri: string,
    entityIdOrConfigEntryId: string,
  ): Promise<getPlaylistServiceResponse> {
    let configEntry: string;
    if (entityIdOrConfigEntryId.includes(".")) {
      const info = await this.actionGetPlayerInfo(entityIdOrConfigEntryId);
      if (!info) {
        throw new Error(
          `Received nothing back when getting tracks for playlist ${playlistUri}!`,
        );
      }
      configEntry = info.entries.mass_queue;
    } else {
      configEntry = entityIdOrConfigEntryId;
    }
    const data: getPlaylistServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "get_playlist",
      service_data: {
        uri: playlistUri,
        config_entry_id: configEntry,
      },
      return_response: true,
    };
    return await this.hass.callWS(data);
  }
  async actionGetAlbumData(
    albumUri: string,
    entityIdOrConfigEntryId: string,
  ): Promise<getAlbumServiceResponse> {
    let configEntry: string;
    if (entityIdOrConfigEntryId.includes(".")) {
      const info = await this.actionGetPlayerInfo(entityIdOrConfigEntryId);
      if (!info) {
        throw new Error(
          `Received nothing back when getting tracks for album ${albumUri}!`,
        );
      }
      configEntry = info.entries.mass_queue;
    } else {
      configEntry = entityIdOrConfigEntryId;
    }
    const data: getAlbumServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "get_album",
      service_data: {
        uri: albumUri,
        config_entry_id: configEntry,
      },
      return_response: true,
    };
    return await this.hass.callWS(data);
  }
  async actionGetArtistData(
    albumUri: string,
    entityIdOrConfigEntryId: string,
  ): Promise<getArtistServiceResponse> {
    let configEntry: string;
    if (entityIdOrConfigEntryId.includes(".")) {
      const info = await this.actionGetPlayerInfo(entityIdOrConfigEntryId);
      if (!info) {
        throw new Error(
          `Received nothing back when getting tracks for album ${albumUri}!`,
        );
      }
      configEntry = info.entries.mass_queue;
    } else {
      configEntry = entityIdOrConfigEntryId;
    }
    const data: getArtistServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "get_artist",
      service_data: {
        uri: albumUri,
        config_entry_id: configEntry,
      },
      return_response: true,
    };
    return await this.hass.callWS(data);
  }
  async actionGetPodcastData(
    podcastUri: string,
    entityIdOrConfigEntryId: string,
  ): Promise<getPodcastServiceResponse> {
    let configEntry: string;
    if (entityIdOrConfigEntryId.includes(".")) {
      const info = await this.actionGetPlayerInfo(entityIdOrConfigEntryId);
      if (!info) {
        throw new Error(
          `Received nothing back when getting episodes for podcast ${podcastUri}!`,
        );
      }
      configEntry = info.entries.mass_queue;
    } else {
      configEntry = entityIdOrConfigEntryId;
    }
    const data: getPodcastServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "get_podcast",
      service_data: {
        uri: podcastUri,
        config_entry_id: configEntry,
      },
      return_response: true,
    };
    return await this.hass.callWS(data);
  }
  async actionRemovePlaylistTrack(
    playlistId: string,
    position: number,
    entityIdOrConfigEntryId: string,
  ) {
    let configEntry: string;
    if (entityIdOrConfigEntryId.includes(".")) {
      const info = await this.actionGetPlayerInfo(entityIdOrConfigEntryId);
      if (!info) {
        throw new Error(
          `Received nothing back when getting config entry for ${entityIdOrConfigEntryId}!`,
        );
      }
      configEntry = info.entries.mass_queue;
    } else {
      configEntry = entityIdOrConfigEntryId;
    }
    const data: removePlaylistTracksServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "remove_playlist_tracks",
      service_data: {
        playlist_id: playlistId,
        positions_to_remove: [position],
        config_entry_id: configEntry,
      },
    };
    await this.hass.callWS(data);
  }
  private async getPlayerConfigEntry(entityId: string): Promise<string> {
    const entry = await this.hass.callWS<{ config_entry_id: string }>({
      type: "config/entity_registry/get",
      entity_id: entityId,
    });
    const result = entry.config_entry_id;
    return result;
  }
  private async actionGetPlayerInfo(
    entityId: string,
  ): Promise<getInfoWSResponseSchema | null> {
    const data: getInfoWSServiceSchema = {
      type: "mass_queue/get_info",
      entity_id: entityId,
    };
    return await this.hass.callWS(data);
  }
}
