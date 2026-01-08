import { mediaBrowserSectionConfig, newMediaBrowserItemsConfig } from "./types";

export type TargetValueEvent = (event_: TargetValueEventData) => void;

export interface TargetValueEventData extends Omit<Event, "target"> {
  target: {
    value: string;
  };
}
export interface DetailValueEventData extends Omit<Event, "target"> {
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
  };
}
export interface JoinUnjoinEventData extends Omit<Event, "target"> {
  target: {
    entity: string;
  };
}

export interface MenuButtonEventData extends Omit<CustomEvent, "detail"> {
  detail: {
    option: string;
  };
}

export interface TrackRemovedEventData extends Omit<CustomEvent, "detail"> {
  detail: {
    playlist: string;
    position: number;
  };
}

export type MenuButtonEvent = (event_: MenuButtonEventData) => void;

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
