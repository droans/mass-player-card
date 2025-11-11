import { ExtendedHass } from "./common"
import { QueueConfig } from "../config/player-queue"

export interface QueueItem {
  media_title: string
  media_album_name: string
  media_artist: string
  media_content_id: string
  playing: boolean
  queue_item_id: string
  media_image: string
  local_image_encoded?: string
  show_action_buttons: boolean
  show_artist_name: boolean
  show_move_up_next: boolean
  favorite: boolean
}
export interface QueueSection {
  active_player_entity: string
  config: QueueConfig
  hass: ExtendedHass
}

export type QueueItems = QueueItem[]

export interface MassQueueEvent {
  data: {
    type: string
    data: {
      queue_id: string
    }
  }
}

export const MAX_GET_QUEUE_FAILURES = 6
export const MUSIC_ASSISTANT_APP_NAME = "music_assistant"
export const TIMED_LISTENER_DELAY_MS = 10000
