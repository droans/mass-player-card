import { createContext } from '@lit/context'
import type { 
  EntityConfig 
} from '../config/config';
export type {
  EntityConfig 
} from '../config/config';

export const hassExt = createContext<ExtendedHass>('hass');
export const activeEntityConf = createContext<EntityConfig>('active-entity-conf');
export const activeEntityID = createContext<string>('active-entity-id');
