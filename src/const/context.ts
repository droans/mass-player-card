import { createContext } from '@lit/context'

import type {
  ExtendedHass,
  ExtendedHassEntity
} from "./common";
export type {
  ExtendedHass,
  ExtendedHassEntity
} from "./common";

import { Config, type EntityConfig } from '../config/config';
import { PlayerConfig } from '../config/player';
import { PlayerData } from './music-player';
import { QueueConfig } from '../config/player-queue';
import { MediaBrowserConfig } from '../config/media-browser';
import { PlayersConfig } from '../config/players';
import { Sections } from './card';
import { ActivePlayerController } from '../controller/active-player';
import { ActionsController } from '../controller/actions';
import { MassCardController } from '../controller/controller';
import { Theme } from '@material/material-color-utilities';
import { Icons } from './icons';
import { QueueItem, QueueItems } from './player-queue.js';
import { QueueController } from '../controller/queue.js';
import { MediaBrowserController } from '../controller/browser.js';
import { MediaCardItem, newMediaBrowserItemsConfig } from './media-browser.js';
export type {
  EntityConfig
} from '../config/config';

export const hassExt = createContext<ExtendedHass>('hass');
export const activeEntityConf = createContext<EntityConfig>('active-entity-conf');
export const activeEntityID = createContext<string>('active-entity-id');
export const activePlayerName = createContext<string>('active-player-name');
export const activeMediaPlayer = createContext<ExtendedHassEntity>('active-entity');
export const volumeMediaPlayer = createContext<ExtendedHassEntity>('volume-entity');
export const activePlayerDataContext = createContext<PlayerData>('active-player-data');
export const groupedPlayersContext = createContext<string[]>('group-members')
export const groupVolumeContext = createContext<number>('group-volume')

export const configContext = createContext<Config>('config');
export const entitiesConfigContext = createContext<EntityConfig[]>('entities-config');
export const musicPlayerConfigContext = createContext<PlayerConfig>('music-player-config');
export const playerQueueConfigContext = createContext<QueueConfig>('player-queue-config');
export const mediaBrowserConfigContext = createContext<MediaBrowserConfig>('mass-browser-config');
export const playersConfigContext = createContext<PlayersConfig>('players-config');

export const activeSectionContext = createContext<Sections>('active-section');
export const mediaCardDisplayContext = createContext<boolean>('media-card-display');
export const activePlayerControllerContext = createContext<ActivePlayerController>('active-player-controller');
export const actionsControllerContext = createContext<ActionsController>('actions-controller');
export const controllerContext = createContext<MassCardController>('controller');
export const queueControllerContext = createContext<QueueController>('queue-controller');
export const browserControllerContext = createContext<MediaBrowserController>('browser-controller');

export const expressiveThemeContext = createContext<Theme | undefined>('expressive-theme');
export const useExpressiveContext = createContext<boolean>('use-expressive');
export const IconsContext = createContext<Icons>('icons');

export const queueContext = createContext<QueueItems | null>('queue');
export const currentQueueItemContext = createContext<QueueItem | null>('current-queue-item');
export const nextQueueItemContext = createContext<QueueItem | null>('next-queue-item');
export const previousQueueItemContext = createContext<QueueItem | null>('previous-queue-item');

export const mediaBrowserCardsContext = createContext<newMediaBrowserItemsConfig>('browser-cards');
export const activeMediaBrowserCardsContext = createContext<MediaCardItem[]>('active-browser-items');