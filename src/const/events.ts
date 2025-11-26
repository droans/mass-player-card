import { mediaBrowserSectionConfig, newMediaBrowserItemsConfig } from "./media-browser.js";

export type TargetValEvent = (ev: TargetValEventData) => void;

export interface TargetValEventData extends Omit<Event, "target"> {
  target: {
    value: string;
  };
}
export interface DetailValEventData extends Omit<Event, "target"> {
  detail: {
    value: number;
  };
}

export interface CardsUpdatedEventDetail {
  section: string;
  cards: newMediaBrowserItemsConfig | mediaBrowserSectionConfig;
}
export interface CardsUpdatedEvent extends Omit<CustomEvent, "detail"> {
  detail: CardsUpdatedEventDetail;
}
export interface ArtworkUpdatedEventData extends Omit<Event, "detail"> {
  detail: {
    type: string;
    image: string;
  }
}
export interface JoinUnjoinEventData extends Omit<Event, "target"> {
  target: {
    entity: string;
  }
}