import { mediaBrowserSectionConfig, newMediaBrowserItemsConfig } from "./types";

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

export interface HTMLImageElementEvent extends UIEvent {
  target: HTMLImageElement;
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

export interface MenuButtonEventData extends Omit<CustomEvent, "detail"> {
  detail: {
    option: string,
  },
}

export type MenuButtonEvent = (ev: MenuButtonEventData) => void;

export interface ForceUpdatePlayerDataEvent extends CustomEvent {
  detail: ForceUpdatePlayerDataEventData;
}
export interface ForceUpdatePlayerDataEventData {
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,
  value: any;
}

export interface MassQueueEvent {
  data: {
    type: string;
    data: {
      queue_id: string;
    };
  };
}