import { createContext } from '@lit/context'

import type { 
  ExtendedHass, 
  ExtendedHassEntity 
} from "./common";
export type { 
  ExtendedHass, 
  ExtendedHassEntity 
} from "./common";

import type { 
  EntityConfig 
} from '../config/config';
export type {
  EntityConfig 
} from '../config/config';

export const hassExt = createContext<ExtendedHass>('hass');
export const activeEntityConf = createContext<EntityConfig>('active-entity-conf');
export const activeEntityID = createContext<string>('active-entity-id');
export const activePlayerName = createContext<string>('active-player-name');
export const activeMediaPlayer = createContext<ExtendedHassEntity>('active-entity');
export const volumeMediaPlayer = createContext<ExtendedHassEntity>('volume-entity');
