import { createContext } from "@lit/context";

import {
  mediaCardAlbumData,
  mediaCardArtistData,
  mediaCardTracksData,
  type ExtendedHass,
  type ExtendedHassEntity,
  type MediaCardItem,
  type newMediaBrowserItemsConfig,
  type PlayerData,
  type PlayersHass,
  type QueueItem,
  type QueueItems,
  type UIServicesHass,
} from "./types";

import { DynamicScheme } from "@ktibow/material-color-utilities-nightly";
import {
  Config,
  HiddenElementsConfig,
  type EntityConfig,
} from "../config/config";
import {
  MediaBrowserConfig,
  MediaBrowserHiddenElementsConfig,
} from "../config/media-browser";
import { PlayerConfig, PlayerHiddenElementsConfig } from "../config/player";
import {
  PlayerQueueHiddenElementsConfig,
  QueueConfig,
} from "../config/player-queue";
import { PlayersConfig, PlayersHiddenElementsConfig } from "../config/players";
import { ActionsController } from "../controller/actions";
import { ActivePlayerController } from "../controller/active-player";
import { MediaBrowserController } from "../controller/browser";
import { MassCardController } from "../controller/controller";
import { QueueController } from "../controller/queue";
import { uuid4 } from "../utils/utility";
import { getQueueInfoWSServiceResponseSchema } from "./actions";
import { Sections } from "./enums";
import { Icons } from "./icons";
import { MediaBrowserSection } from "./media-browser";
export type { EntityConfig } from "../config/config";

export const hassPlayersContext = createContext<PlayersHass>(uuid4());
export const hassUIServicesContext = createContext<UIServicesHass>(uuid4());
export const hassUpdatedContext = createContext<ExtendedHass>(uuid4());
export const activeEntityConfigContext = createContext<EntityConfig>(uuid4());
export const activeEntityIDContext = createContext<string>(uuid4());
export const activePlayerNameContext = createContext<string>(uuid4());
export const activeMediaPlayerContext =
  createContext<ExtendedHassEntity>(uuid4());
export const volumeMediaPlayerContext =
  createContext<ExtendedHassEntity>(uuid4());
export const activePlayerDataContext = createContext<PlayerData>(uuid4());
export const groupedPlayersContext = createContext<string[]>(uuid4());
export const groupVolumeContext = createContext<number>(uuid4());

export const configContext = createContext<Config>(uuid4());
export const entitiesConfigContext = createContext<EntityConfig[]>(uuid4());
export const musicPlayerConfigContext = createContext<PlayerConfig>(uuid4());
export const playerQueueConfigContext = createContext<QueueConfig>(uuid4());
export const mediaBrowserConfigContext =
  createContext<MediaBrowserConfig>(uuid4());
export const playersConfigContext = createContext<PlayersConfig>(uuid4());

export const activeSectionContext = createContext<Sections>(uuid4());
export const mediaCardDisplayContext = createContext<boolean>(uuid4());
export const activePlayerControllerContext =
  createContext<ActivePlayerController>(uuid4());
export const actionsControllerContext =
  createContext<ActionsController>(uuid4());
export const controllerContext = createContext<MassCardController>(uuid4());
export const queueControllerContext = createContext<QueueController>(uuid4());
export const browserControllerContext =
  createContext<MediaBrowserController>(uuid4());

export const expressiveSchemeContext = createContext<DynamicScheme | undefined>(
  uuid4(),
);
export const useExpressiveContext = createContext<boolean>(uuid4());
export const useVibrantContext = createContext<boolean>(uuid4());
export const IconsContext = createContext<Icons>(uuid4());

export const queueContext = createContext<QueueItems | null>(uuid4());
export const currentQueueItemContext = createContext<QueueItem | null>(uuid4());
export const nextQueueItemContext = createContext<QueueItem | null>(uuid4());
export const previousQueueItemContext = createContext<QueueItem | null>(
  uuid4(),
);

export const mediaBrowserCardsContext =
  createContext<newMediaBrowserItemsConfig>(uuid4());
export const activeMediaBrowserCardsContext =
  createContext<MediaCardItem[]>(uuid4());
export const activeMediaBrowserSectionContext =
  createContext<MediaBrowserSection>(uuid4());

export const hiddenElementsConfigContext =
  createContext<HiddenElementsConfig>(uuid4());

export const musicPlayerHiddenElementsConfigContext =
  createContext<PlayerHiddenElementsConfig>(uuid4());
export const playerQueueHiddenElementsConfigContext =
  createContext<PlayerQueueHiddenElementsConfig>(uuid4());
export const mediaBrowserHiddenElementsConfigContext =
  createContext<MediaBrowserHiddenElementsConfig>(uuid4());
export const playersHiddenElementsConfigContext =
  createContext<PlayersHiddenElementsConfig>(uuid4());

export const activeAlbumCollectionContext = createContext<
  mediaCardAlbumData | undefined
>(uuid4());
export const activeArtistCollectionContext = createContext<
  mediaCardArtistData | undefined
>(uuid4());
export const tracksCollectionContext = createContext<
  mediaCardTracksData | undefined
>(uuid4());

export const canGroupWithContext = createContext<string[]>(uuid4());

export const activeQueueInfoContext =
  createContext<getQueueInfoWSServiceResponseSchema>(uuid4());
