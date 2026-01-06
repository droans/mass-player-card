import { HomeAssistant, Themes } from "custom-card-helpers";
import { HassEntity, HassEntityAttributeBase } from "home-assistant-js-websocket";
import { TemplateResult } from "lit";
import {
  getRecommendationsServiceResponse,
  recommendationItem,
  recommendationItems,
  recommendationSection
} from "mass-queue-types/packages/mass_queue/actions/get_recommendations.js";
import {
  getQueuePartialServiceResponse,
  getQueueServiceResponse,
  getQueueServiceSchema
} from "mass-queue-types/packages/music_assistant/actions/get_queue"

import { MediaTypes, RepeatMode, Thumbnail } from "./enums";
import { MediaItem, QueueItemSchema } from "mass-queue-types/packages/music_assistant/types.js";
import { ImageURLWithFallback } from "../utils/thumbnails";
import { queueItem } from "mass-queue-types/packages/mass_queue/actions/get_queue_items.js";
import { QueueConfig } from "../config/player-queue";

export interface ExtendedHass extends Omit<HomeAssistant, "states"> {
  entities: ExtendedEntitiesBase;
  states: ExtendedHassEntities;
  themes: ExtendedThemes;
}

interface ExtendedEntityBase {
  entity_id: string;
  device_id: string;
}
type ExtendedEntitiesBase = Record<string, ExtendedEntityBase>;

export interface ExtendedHassEntity extends HassEntity {
  attributes: ExtendedHassEntityAttributes;
}
export type ExtendedHassEntities = Record<string, ExtendedHassEntity | undefined>;

interface ExtendedHassEntityAttributes extends HassEntityAttributeBase {
  app_id?: string;
  active_queue?: string;
  entity_picture_local?: string;
  group_members?: string[];
  is_volume_muted?: boolean;
  mass_player_type?: string;
  media_album_name?: string;
  media_artist?: string;
  media_title?: string;
  media_content_id?: string;
  media_content_type?: string;
  media_duration?: number;
  media_position?: number;
  repeat?: RepeatMode;
  shuffle?: boolean;
  volume_level?: number;
}

export interface ExtendedThemes extends Themes {
  darkMode: boolean;
  default_dark_theme: string;
  theme: string;
}

export interface FavoriteItems {
  albums: MediaBrowserItem[];
  artists: MediaBrowserItem[];
  audiobooks: MediaBrowserItem[];
  playlists: MediaBrowserItem[];
  podcasts: MediaBrowserItem[];
  radios: MediaBrowserItem[];
  tracks: MediaBrowserItem[];
}

export interface ListImageData {
  url: string;
  fallback: string;
}

export interface ListItemData {
  option: string;
  icon: string;
  image?: ListImageData;
  title: string;
}
export type ListItems = ListItemData[];

export type MassGetQueueServiceDataSchema = getQueueServiceSchema;

export type MassGetQueueServiceResponseSchema = getQueueServiceResponse;

export interface MediaBrowserItem {
  name: string;
  media_content_id: string;
  media_content_type: MediaTypes;
  image: string;
}

export interface newMediaBrowserItemsConfig {
  favorites: mediaBrowserSectionConfig;
  recents: mediaBrowserSectionConfig;
  recommendations: mediaBrowserSectionConfig;
  search: MediaCardItem[];
}
export interface MediaBrowserItemsConfig {
  main: MediaCardItem[];
  [str: string]: MediaCardItem[];
}

export interface mediaBrowserSectionConfig {
  main: MediaCardItem[];
  [str: string]: MediaCardItem[];
}

export type mediaBrowserSectionSubtypes = 
  'favorites'
  | 'recents'
  | 'recommendations'

// export interface MediaCardData {
//   type?: string;
//   subtype?: string;
//   section?: string;
//   media_content_id?: string;
//   media_content_type?: string;
//   service?: string;
// }

export type mediaCardData = 
  mediaCardEnqueueType
  | mediaCardSectionData

export type mediaCardEnqueueType = 
  mediaCardPlaylistData
  | mediaCardAlbumData
  | mediaCardArtistData
  | mediaCardItemData
  | mediaCardServiceData
  | mediaCardRecommendationData

export type mediaCardCollectionType = 
  mediaCardPlaylistData
  | mediaCardAlbumData
  | mediaCardArtistData

export interface mediaCardItemData {
  type: 'item';
  media_content_id: string;
  media_content_type: string;
}

export interface mediaCardServiceData {
  type: 'service';
  media_content_id: string;
  media_content_type: string;
  service?: string;
}
export interface mediaCardRecommendationData {
  type: 'service';
  media_content_id: string;
  media_content_type: string;
}

export interface mediaCardSectionData {
  type: 'section';
  subtype: mediaBrowserSectionSubtypes;
  section: string;
}

interface mediaCardCollectionData {
  media_content_id: string;
  media_image: string;
  media_title: string;
}

export interface mediaCardPlaylistData extends mediaCardCollectionData {
  type: 'playlist';
}

export interface mediaCardAlbumData extends mediaCardCollectionData {
  type: 'album';
}

export interface mediaCardArtistData extends mediaCardCollectionData {
  type: 'artist';
}

export interface mediaPlaylistCard extends Omit<MediaCardItem, 'data'> {
  data: mediaCardPlaylistData
}

export interface MediaCardItem {
  title: string;
  thumbnail: string;
  fallback: Thumbnail;
  data: mediaCardData;
  background?: TemplateResult;
}

export type MediaLibraryItem = MediaItem;

export type ServiceNoParams = () => void;

export type SubscriptionUnsubscribe = () => Promise<void>

export interface PlayerData {
  playing: boolean;
  muted: boolean;
  track_title: string;
  track_artist: string;
  track_album: string;
  track_artwork: string;
  shuffle: boolean;
  repeat: RepeatMode;
  player_name: string;
  volume: number;
  favorite: boolean;
}

export interface PlaylistDialogItem {
  image: ImageURLWithFallback;
  name: string;
  uri: string;
}

export interface QueueItem extends Omit<queueItem, "playing"> {
  playing?: boolean;
  show_action_buttons: boolean;
  show_artist_name: boolean;
  show_move_up_next: boolean;
}

export type QueueItems = QueueItem[];

export interface QueueSection {
  active_player_entity: string;
  config: QueueConfig;
  hass: ExtendedHass;
}

export type RecommendationItem = recommendationItem;
export type RecommendationItems = recommendationItems;
export type RecommendationResponse = getRecommendationsServiceResponse;

export type RecommendationSection = recommendationSection;

export interface getQueueResponse extends Omit<Omit<getQueuePartialServiceResponse, 'current_item'>, "next_item"> {
  current_item: QueueItemSchema | null
  next_item: QueueItemSchema | null
} 