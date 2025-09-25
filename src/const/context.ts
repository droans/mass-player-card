import { createContext } from '@lit/context'

import type {
  ExtendedHass,
  ExtendedHassEntity
} from "./common";
export type {
  ExtendedHass,
  ExtendedHassEntity
} from "./common";

import {
  Config,
  type EntityConfig
} from '../config/config';
import { PlayerConfig } from '../config/player';
import { PlayerData } from './music-player';
import { QueueConfig } from '../config/player-queue';
import { MediaBrowserConfig } from '../config/media-browser';
import { PlayersConfig } from '../config/players';
export type {
  EntityConfig
} from '../config/config';

export const hassExt = createContext<ExtendedHass>('hass');
export const activeEntityConf = createContext<EntityConfig>('active-entity-conf');
export const activeEntityID = createContext<string>('active-entity-id');
export const activePlayerName = createContext<string>('active-player-name');
export const activeMediaPlayer = createContext<ExtendedHassEntity>('active-entity');
export const entitiesConfig = createContext<EntityConfig[]>('entities-config');
export const volumeMediaPlayer = createContext<ExtendedHassEntity>('volume-entity');
export const configContext = createContext<Config>('config');
export const musicPlayerConfigContext = createContext<PlayerConfig>('music-player-config');
export const activePlayerDataContext = createContext<PlayerData>('active-player-data');
export const playerQueueConfigContext = createContext<QueueConfig>('player-queue-config');
export const mediaBrowserConfigContext = createContext<MediaBrowserConfig>('media-browser-config');
export const playersConfigContext = createContext<PlayersConfig>('players-config');