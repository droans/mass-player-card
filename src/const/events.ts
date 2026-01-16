import { mediaBrowserSectionConfig, newMediaBrowserItemsConfig } from "./types";

export type TargetValueEvent = (event_: TargetValueEventData) => void;

export type EventNoTarget = Omit<Event, "target">;
export type CustomEventNoDetail = Omit<Event, "detail">;

export interface TargetValueEventData extends EventNoTarget {
  target: {
    value: string;
  };
}
export interface DetailValueEventData extends EventNoTarget {
  detail: {
    value: number;
  };
}

export interface CardsUpdatedEventDetail {
  section: string;
  cards: newMediaBrowserItemsConfig | mediaBrowserSectionConfig;
}
export interface CardsUpdatedEvent extends CustomEventNoDetail {
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
export interface JoinUnjoinEventData extends EventNoTarget {
  target: {
    entity: string;
  };
}

export interface MenuButtonEventData extends CustomEventNoDetail {
  detail: {
    option: string;
  };
}

export interface TrackRemovedEventData extends CustomEventNoDetail {
  detail: {
    playlist: string;
    position: number;
  };
}
export interface PlayerSyncEvent extends CustomEventNoDetail {
  detail: {
    player: string;
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
