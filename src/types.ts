export interface Config {
  entity: string;
  title: string;
  expanded: boolean;
  limit_before: number;
  limit_after: number;
  show_album_covers: boolean;
  show_artist_names: boolean;
  allow_collapsing: boolean;
}

export interface QueueItem {
  media_title: string;
  media_album_name: string;
  media_artist: string;
  media_content_id: string;
  playing: boolean;
  queue_item_id: string;
  media_image: string;
  show_action_buttons: boolean;
  show_artist_name: boolean
  show_move_up_next: boolean;
}

export type QueueService = (
  queue_item_id: string
) => void;
export type ItemSelectedService = (
  queue_item_id: string, 
  media_content_id: string
) => void;