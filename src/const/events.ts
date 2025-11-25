import { mediaBrowserSectionConfig, newMediaBrowserItemsConfig } from "./media-browser.js";

export type TargetValEvent = (ev: TargetValEventData) => void;

export interface TargetValEventData {
  target: {
    value: string;
  };
}
export interface DetailValEventData {
  detail: {
    value: number;
  };
}

export interface CardsUpdatedEventDetail {
  section: string;
  cards: newMediaBrowserItemsConfig | mediaBrowserSectionConfig;
}
export interface CardsUpdatedEvent extends CustomEvent {
  detail: CardsUpdatedEventDetail;
}