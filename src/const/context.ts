import { createContext } from "@lit/context";

import type { ExtendedHass, ExtendedHassEntity } from "./common";
export type { ExtendedHass, ExtendedHassEntity } from "./common";

import { Config, type EntityConfig } from "../config/config";
import { PlayerConfig } from "../config/player";
import { PlayerData } from "./music-player";
import { QueueConfig } from "../config/player-queue";
import { MediaBrowserConfig } from "../config/media-browser";
import { PlayersConfig } from "../config/players";
import { Sections } from "./card";
import { ActivePlayerController } from "../controller/active-player";
import { ActionsController } from "../controller/actions";
import { MassCardController } from "../controller/controller";
import { DynamicScheme } from "@material/material-color-utilities";
import { Icons } from "./icons";
import { QueueItem, QueueItems } from "./player-queue.js";
import { QueueController } from "../controller/queue.js";
import { MediaBrowserController } from "../controller/browser.js";
import { MediaCardItem, newMediaBrowserItemsConfig } from "./media-browser.js";
export type { EntityConfig } from "../config/config";

export const hassExt = createContext<ExtendedHass>(uuid4());
export const activeEntityConf = createContext<EntityConfig>(uuid4());
export const activeEntityID = createContext<string>(uuid4());
export const activePlayerName = createContext<string>(uuid4());
export const activeMediaPlayer = createContext<ExtendedHassEntity>(uuid4());
export const volumeMediaPlayer = createContext<ExtendedHassEntity>(uuid4());
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

function uuid4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16),
  );
}
