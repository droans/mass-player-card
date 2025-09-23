import { createContext } from '@lit/context'
import type { ExtendedHass } from "./common";
export type { ExtendedHass } from "./common";
export const hassExt = createContext<ExtendedHass>('hass');