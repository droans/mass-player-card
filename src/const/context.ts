import { createContext } from "@lit/context";

import type {
  ExtendedHass,
  ExtendedHassEntity,
  MediaCardItem,
  newMediaBrowserItemsConfig,
  PlayerData,
  QueueItem,
  QueueItems,
} from "./types";

import { Config, type EntityConfig } from "../config/config";
import { PlayerConfig } from "../config/player";
import { QueueConfig } from "../config/player-queue";
import { MediaBrowserConfig } from "../config/media-browser";
import { PlayersConfig } from "../config/players";
import { Sections } from "./enums";
import { ActivePlayerController } from "../controller/active-player";
import { ActionsController } from "../controller/actions";
import { MassCardController } from "../controller/controller";
import { DynamicScheme } from "@ktibow/material-color-utilities-nightly";
import { Icons } from "./icons";
import { QueueController } from "../controller/queue";
import { MediaBrowserController } from "../controller/browser";
import { uuid4 } from "../utils/util";
export type { EntityConfig } from "../config/config";

export const hassContext = createContext<ExtendedHass>(uuid4());
export const activeEntityConfContext = createContext<EntityConfig>(uuid4());
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
