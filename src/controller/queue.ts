import { ContextProvider } from "@lit/context"
import {
  currentQueueItemContext,
  ExtendedHass,
  ExtendedHassEntity,
  nextQueueItemContext,
  previousQueueItemContext,
  queueContext,
} from "../const/context.js"
import {
  MassQueueEvent,
  MAX_GET_QUEUE_FAILURES,
  QueueItem,
  QueueItems,
  TIMED_LISTENER_DELAY_MS,
} from "../const/player-queue.js"
import { Config } from "../config/config.js"
import QueueActions from "../actions/queue-actions.js"
import { isActive, jsonMatch, playerHasUpdated } from "../utils/util.js"

export class QueueController {
  public _host!: HTMLElement
  private _queue!: ContextProvider<typeof queueContext>
  private _currentQueueItem!: ContextProvider<typeof currentQueueItemContext>
  private _nextQueueItem!: ContextProvider<typeof nextQueueItemContext>
  private _previousQueueItem!: ContextProvider<typeof previousQueueItemContext>
  private _currentItem!: QueueItem
  private _hass!: ExtendedHass
  private _activeMediaPlayer!: ExtendedHassEntity
  private _config!: Config
  private _actions!: QueueActions
  private _fails = 0
  private _activeQueueID!: string

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  private _unsubscribe!: any
  private _listening = false
  private _interval!: number | undefined
  private _timedListening = false
  private _updatingQueue = false

  constructor(
    hass: ExtendedHass,
    active_player: ExtendedHassEntity,
    config: Config,
    host: HTMLElement,
  ) {
    this.hass = hass
    this.config = config
    this._host = host
    this._queue = new ContextProvider(host, { context: queueContext })
    this._currentQueueItem = new ContextProvider(host, {
      context: currentQueueItemContext,
    })
    this._nextQueueItem = new ContextProvider(host, {
      context: nextQueueItemContext,
    })
    this._previousQueueItem = new ContextProvider(host, {
      context: previousQueueItemContext,
    })
    this._actions = new QueueActions(hass, active_player.entity_id)
    this.activeMediaPlayer = active_player
    void this.getQueue()
    void this.subscribeUpdates()
  }

  private set queue(queue_items: QueueItems | null) {
    if (jsonMatch(this._queue.value, queue_items)) {
      return
    }
    this._queue.setValue(queue_items)
  }
  public get queue() {
    return this._queue.value
  }

  public set hass(hass: ExtendedHass) {
    this._hass = hass
    if (this.activeMediaPlayer) {
      this.activeMediaPlayer = hass.states[this.activeMediaPlayer.entity_id]
    }
  }
  public get hass() {
    return this._hass
  }

  private set activeMediaPlayer(player: ExtendedHassEntity) {
    if (this._activeMediaPlayer) {
      const updated = playerHasUpdated(player, this._activeMediaPlayer)
      if (!updated) {
        return
      }
    }
    this._activeMediaPlayer = player
    this._activeQueueID = player.attributes.active_queue
    this.actions.player_entity = player.entity_id
    void this.getQueue()
  }
  public get activeMediaPlayer() {
    return this._activeMediaPlayer
  }

  private set config(config: Config) {
    this._config = config
  }
  public get config() {
    return this._config
  }

  private set actions(actions: QueueActions) {
    this._actions = actions
  }
  public get actions() {
    return this._actions
  }

  private set currentQueueItem(queue_item: QueueItem | null) {
    if (jsonMatch(this._currentQueueItem.value, queue_item)) {
      return
    }
    this._currentQueueItem.setValue(queue_item)
  }
  public get currentQueueItem() {
    return this._currentQueueItem.value
  }

  private set nextQueueItem(queue_item: QueueItem | null) {
    if (jsonMatch(this._nextQueueItem.value, queue_item)) {
      return
    }
    this._nextQueueItem.setValue(queue_item)
  }
  public get nextQueueItem() {
    return this._nextQueueItem.value
  }

  private set previousQueueItem(queue_item: QueueItem | null) {
    if (jsonMatch(this._previousQueueItem.value, queue_item)) {
      return
    }
    this._previousQueueItem.setValue(queue_item)
  }
  public get previousQueueItem() {
    return this._previousQueueItem.value
  }

  public setActiveEntityId(entity_id: string) {
    this.activeMediaPlayer = this.hass.states[entity_id]
  }
  private raiseQueueFailure() {
    // eslint-disable-next-line no-console
    console.error(
      `Reached max failures getting queue, check your browser and HA logs!`,
    )
  }
  public getQueue = async () => {
    const ents = this.config.entities
    const ent_id = this.activeMediaPlayer.entity_id
    const activeEntityConfig = ents.find((item) => item.entity_id == ent_id)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (isActive(this.hass, this.activeMediaPlayer, activeEntityConfig!)) {
      const queue = this._getQueue()
      return queue
    }
    this.queue = []
    return []
  }
  private setActiveTrack(queue: QueueItems) {
    const active_track = this.activeMediaPlayer.attributes.media_content_id
    const active_idx =
      queue.findIndex((i) => i.media_content_id == active_track) ?? -1
    if (active_idx >= 0) {
      queue[active_idx].playing = true
    }
    return queue
  }
  public resetQueueFailures() {
    this._fails = 0
    void this.getQueue()
  }
  public async _getQueue() {
    if (this._updatingQueue) {
      return
    }
    this._updatingQueue = true
    const limit_before = this.config.queue.limit_before
    const limit_after = this.config.queue.limit_after
    if (this._fails >= MAX_GET_QUEUE_FAILURES) {
      this.raiseQueueFailure()
      this._updatingQueue = false
      return
    }
    try {
      let queue = await this.actions.getQueue(limit_before, limit_after)
      if (!queue) {
        this._updatingQueue = false
        return
      }
      this._fails = 0
      queue = this.setActiveTrack(queue)
      this.queue = queue
      this.getCurNextPrQueueItems()
      this._updatingQueue = false
      return queue
    } catch {
      this._fails++
    } finally {
      this._updatingQueue = false
    }
    return []
  }

  private timedListener = () => {
    try {
      clearInterval(this._interval)
    } finally {
      this._interval = undefined
    }
    this._interval = setInterval(this.timedListener, TIMED_LISTENER_DELAY_MS)
    void this.getQueue()
  }

  private eventListener = (event: MassQueueEvent) => {
    const event_data = event.data
    const queue_id = event_data.data?.queue_id
    if (event_data.type == "queue_updated" && queue_id == this._activeQueueID) {
      if (this._updatingQueue) {
        return
      }
      void this.getQueue()
    }
  }

  public get isSubscribed() {
    return this._listening || this._timedListening
  }

  public async subscribeUpdates() {
    this.unsubscribeUpdates()
    if (this.hass.user.is_admin) {
      this._unsubscribe = await this.hass.connection.subscribeEvents(
        this.eventListener,
        "mass_queue",
      )
      this._listening = true
    } else {
      this.timedListener()
      this._timedListening = true
    }
  }

  public unsubscribeUpdates() {
    if (this._unsubscribe) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this._unsubscribe()
      this._unsubscribe = undefined
    }
    if (this._interval) {
      try {
        clearInterval(this._interval)
      } finally {
        this._interval = undefined
      }
    }
  }

  private getCurNextPrQueueItems() {
    const queue = this.queue
    if (!queue) {
      return
    }
    const idx = queue.findIndex((i) => i.playing)
    this.currentQueueItem = queue[idx]
    if (idx > 0) {
      this.previousQueueItem = queue[idx - 1]
    } else {
      this.previousQueueItem = null
    }
    if (idx < queue.length - 1) {
      this.nextQueueItem = queue[idx + 1]
    } else {
      this.nextQueueItem = null
    }
  }

  private setItemActive(queue_item_id: string) {
    if (!this.queue) {
      return
    }
    const new_idx = this.getIndex(queue_item_id)
    if (!new_idx) return
    this.queue[new_idx].playing = true
    const cur_idx = this.queue.findIndex((i) => i.playing)
    this.queue[cur_idx].playing = false
  }
  private getIndex(queue_item_id: string) {
    if (!this.queue) {
      return
    }
    const r = this.queue.findIndex((i) => i.queue_item_id == queue_item_id)
    return r
  }

  private moveQueueItem(old_index: number, new_index: number) {
    if (!this.queue) {
      return
    }
    const queue = [...this.queue]

    queue.splice(new_index, 0, queue.splice(old_index, 1)[0])
    this.queue = queue
  }

  public async playQueueItem(queue_item_id: string) {
    this.setItemActive(queue_item_id)
    await this.actions.playQueueItem(queue_item_id)
  }

  public async moveQueueItemUp(queue_item_id: string) {
    const cur_idx = this.getIndex(queue_item_id)
    if (!cur_idx) {
      return
    }
    this.moveQueueItem(cur_idx, cur_idx - 1)
    await this.actions.MoveQueueItemUp(queue_item_id)
  }
  public async moveQueueItemDown(queue_item_id: string) {
    const cur_idx = this.getIndex(queue_item_id)
    if (!cur_idx) return
    this.moveQueueItem(cur_idx, cur_idx + 1)
    await this.actions.MoveQueueItemDown(queue_item_id)
  }
  public async moveQueueItemNext(queue_item_id: string) {
    if (!this.queue) {
      return
    }
    const cur_idx = this.getIndex(queue_item_id)
    if (!cur_idx) {
      return
    }
    const new_idx = this.queue.findIndex((i) => i.playing) + 1
    this.moveQueueItem(cur_idx, new_idx)
    await this.actions.MoveQueueItemNext(queue_item_id)
  }
  public async removeQueueItem(queue_item_id: string) {
    if (!this.queue) return
    this.queue = this.queue.filter((i) => i.queue_item_id !== queue_item_id)
    await this.actions.removeQueueItem(queue_item_id)
  }
  public async clearQueue(
    entity_id: string = this.activeMediaPlayer.entity_id,
  ) {
    await this.actions.clearQueue(entity_id)
  }
  public disconnected() {
    this.unsubscribeUpdates()
  }
  public reconnected(hass: ExtendedHass) {
    this.hass = hass
    void this.subscribeUpdates()
    this.resetQueueFailures()
    void this.getQueue()
  }
}
