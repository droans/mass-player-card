import { ContextProvider } from "@lit/context";
import {
  currentQueueItemContext,
  nextQueueItemContext,
  previousQueueItemContext,
  queueContext,
} from "../const/context";
import {
  MAX_GET_QUEUE_FAILURES,
  TIMED_LISTENER_DELAY_MS,
} from "../const/player-queue";
import { Config } from "../config/config";
import QueueActions from "../actions/queue-actions";
import { isActive, jsonMatch, playerHasUpdated } from "../utils/utility";
import {
  ExtendedHass,
  ExtendedHassEntity,
  QueueItem,
  QueueItems,
  SubscriptionUnsubscribe,
} from "../const/types";
import { MassQueueEvent } from "../const/events";

export class QueueController {
  public _host!: HTMLElement;
  private _queue!: ContextProvider<typeof queueContext>;
  private _currentQueueItem!: ContextProvider<typeof currentQueueItemContext>;
  private _nextQueueItem!: ContextProvider<typeof nextQueueItemContext>;
  private _previousQueueItem!: ContextProvider<typeof previousQueueItemContext>;
  private _hass!: ExtendedHass;
  private _activeMediaPlayer?: ExtendedHassEntity;
  private _config!: Config;
  private _actions!: QueueActions;
  private _fails = 0;
  private _activeQueueID!: string;

  private _unsubscribe?: SubscriptionUnsubscribe;
  private _listening = false;
  private _interval!: number | undefined;
  private _timedListening = false;
  private _updatingQueue = false;

  constructor(
    hass: ExtendedHass,
    activePlayer: ExtendedHassEntity,
    config: Config,
    host: HTMLElement,
  ) {
    this.hass = hass;
    this.config = config;
    this._host = host;
    this._queue = new ContextProvider(host, { context: queueContext });
    this._currentQueueItem = new ContextProvider(host, {
      context: currentQueueItemContext,
    });
    this._nextQueueItem = new ContextProvider(host, {
      context: nextQueueItemContext,
    });
    this._previousQueueItem = new ContextProvider(host, {
      context: previousQueueItemContext,
    });
    this._actions = new QueueActions(hass, activePlayer.entity_id);
    this.activeMediaPlayer = activePlayer;
    void this.getQueue();
    void this.subscribeUpdates();
  }

  private set queue(queueItems: QueueItems | null) {
    if (jsonMatch(this._queue.value, queueItems)) {
      return;
    }
    if (!this.activeMediaPlayer) {
      this._queue.setValue([]);
      return;
    }
    if (this.activeMediaPlayer.state == "playing" && !queueItems?.length) {
      // If the player is playing, there must be active player items; assume then that we received bad data.
      return;
    }
    this._queue.setValue(queueItems);
  }
  public get queue() {
    return this._queue.value;
  }

  public set hass(hass: ExtendedHass) {
    this._hass = hass;
    if (this.activeMediaPlayer) {
      this.activeMediaPlayer = hass.states[this.activeMediaPlayer.entity_id];
    }
  }
  public get hass() {
    return this._hass;
  }

  private set activeMediaPlayer(player: ExtendedHassEntity | undefined) {
    if (this._activeMediaPlayer) {
      const updated = playerHasUpdated(player, this._activeMediaPlayer);
      if (!updated) {
        return;
      }
    }
    if (player) {
      this._activeMediaPlayer = player;
      this._activeQueueID = player.attributes.active_queue ?? "";
      this.actions.player_entity = player.entity_id;
      void this.getQueue();
    }
  }
  public get activeMediaPlayer() {
    return this._activeMediaPlayer;
  }

  private set config(config: Config) {
    this._config = config;
  }
  public get config() {
    return this._config;
  }

  private set actions(actions: QueueActions) {
    this._actions = actions;
  }
  public get actions() {
    return this._actions;
  }

  private set currentQueueItem(queueItem: QueueItem | null) {
    if (jsonMatch(this._currentQueueItem.value, queueItem)) {
      return;
    }
    this._currentQueueItem.setValue(queueItem);
  }
  public get currentQueueItem() {
    return this._currentQueueItem.value;
  }

  private set nextQueueItem(queueItem: QueueItem | null) {
    if (jsonMatch(this._nextQueueItem.value, queueItem)) {
      return;
    }
    this._nextQueueItem.setValue(queueItem);
  }
  public get nextQueueItem() {
    return this._nextQueueItem.value;
  }

  private set previousQueueItem(queueItem: QueueItem | null) {
    if (jsonMatch(this._previousQueueItem.value, queueItem)) {
      return;
    }
    this._previousQueueItem.setValue(queueItem);
  }
  public get previousQueueItem() {
    return this._previousQueueItem.value;
  }

  public setActiveEntityId(entityId: string) {
    this.activeMediaPlayer = this.hass.states[entityId];
  }
  private raiseQueueFailure() {
    // eslint-disable-next-line no-console
    console.error(
      `Reached max failures getting queue, check your browser and HA logs!`,
    );
  }
  public getQueue = async () => {
    if (!this.activeMediaPlayer) {
      return;
    }
    const ents = this.config.entities;
    const entityId = this.activeMediaPlayer.entity_id;
    const activeEntityConfig = ents.find((item) => item.entity_id == entityId);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (isActive(this.hass, this.activeMediaPlayer, activeEntityConfig!)) {
      const queue = await this._getQueue();
      return queue;
    }
    this.queue = [];
    return [];
  };
  private setActiveTrack(queue: QueueItems) {
    if (!this.activeMediaPlayer) {
      return;
    }
    const activeTrack = this.activeMediaPlayer.attributes.media_content_id;
    const activeIndex = queue.findIndex(
      (i) => i.media_content_id == activeTrack,
    );
    if (activeIndex !== -1) {
      queue[activeIndex].playing = true;
    }
    return queue;
  }
  public resetQueueFailures() {
    this._fails = 0;
    void this.getQueue();
  }
  public async _getQueue(attempt = 0) {
    if (!this.activeMediaPlayer) {
      return;
    }
    if (this._updatingQueue) {
      return;
    }
    this._updatingQueue = true;
    if (this._fails >= MAX_GET_QUEUE_FAILURES) {
      this.raiseQueueFailure();
      this._updatingQueue = false;
      return;
    }
    const currentIdx =
      this.queue?.findIndex((item) => {
        return item.playing;
      }) ?? 0;
    const options = {
      offset: -1,
    };
    if (currentIdx > 250) {
      options.offset = currentIdx - 250;
    }
    try {
      let queue = (await this.actions.getQueue(options)) ?? null;
      if (
        !queue?.length &&
        ["playing", "paused"].includes(this.activeMediaPlayer.state)
      ) {
        if (attempt >= MAX_GET_QUEUE_FAILURES) {
          return [];
        }
        // If queue length is zero and player is playing/paused, assume we refreshed at a bad time. Set a short delay and try again.
        setTimeout(() => {
          void this._getQueue(attempt + 1);
        }, 75);
      } else {
        if (!queue) {
          this._updatingQueue = false;
          return;
        }
        this._fails = 0;
        queue = this.setActiveTrack(queue) ?? null;
        this.queue = queue;
        this.getCurNextPrQueueItems();
        this._updatingQueue = false;
        return queue;
      }
    } catch (error) {
      this._fails++;
      throw error;
    } finally {
      this._updatingQueue = false;
    }
    return [];
  }

  private timedListener = () => {
    try {
      clearInterval(this._interval);
    } finally {
      this._interval = undefined;
    }
    this._interval = window.setInterval(
      this.timedListener,
      TIMED_LISTENER_DELAY_MS,
    );
    void this.getQueue();
  };

  private eventListener = (event: MassQueueEvent) => {
    const eventData = event.data;
    const queueId = eventData.data.queue_id;
    if (eventData.type == "queue_updated" && queueId == this._activeQueueID) {
      if (this._updatingQueue) {
        return;
      }
      void this.getQueue();
    }
  };

  public get isSubscribed() {
    return this._listening || this._timedListening;
  }

  public async subscribeUpdates() {
    this.unsubscribeUpdates();
    if (this.hass.user.is_admin) {
      this._unsubscribe = await this.hass.connection.subscribeEvents(
        this.eventListener,
        "mass_queue",
      );
      this._listening = true;
    } else {
      this.timedListener();
      this._timedListening = true;
    }
  }

  public unsubscribeUpdates() {
    if (this._unsubscribe) {
      void this._unsubscribe();
      this._unsubscribe = undefined;
    }
    if (this._interval) {
      try {
        clearInterval(this._interval);
      } finally {
        this._interval = undefined;
      }
    }
  }

  private getCurNextPrQueueItems() {
    const queue = this.queue;
    if (!queue) {
      return;
    }
    const idx = queue.findIndex((i) => i.playing);
    this.currentQueueItem = queue[idx];
    this.previousQueueItem = idx > 0 ? queue[idx - 1] : null;
    this.nextQueueItem = idx < queue.length - 1 ? queue[idx + 1] : null;
  }

  private setItemActive(queueItemId: string) {
    if (!this.queue) {
      return;
    }

    const newIndex = this.getIndex(queueItemId);
    if (newIndex === -1 || !this.queue[newIndex]) {
      return;
    }

    const currentIndex = this.queue.findIndex((i) => i.playing);
    if (currentIndex !== -1) {
      this.queue[currentIndex].playing = false;
    }

    this.queue[newIndex].playing = true;
  }

  private getIndex(queueItemId: string): number {
    if (!this.queue) {
      return -1;
    }

    return this.queue.findIndex((i) => i.queue_item_id === queueItemId);
  }

  private moveQueueItem(oldIndex: number, newIndex: number) {
    if (!this.queue) {
      return;
    }
    const queue = [...this.queue];

    queue.splice(newIndex, 0, queue.splice(oldIndex, 1)[0]);
    this.queue = queue;
  }

  public async playQueueItem(queueItemId: string) {
    this.setItemActive(queueItemId);
    await this.actions.playQueueItem(queueItemId);
  }

  public async moveQueueItemUp(queueItemId: string) {
    const currentIndex = this.getIndex(queueItemId);
    if (currentIndex <= 0) {
      return;
    }

    this.moveQueueItem(currentIndex, currentIndex - 1);
    await this.actions.MoveQueueItemUp(queueItemId);
  }
  public async moveQueueItemDown(queueItemId: string) {
    if (!this.queue) {
      return;
    }

    const currentIndex = this.getIndex(queueItemId);
    if (currentIndex === -1 || currentIndex >= this.queue.length - 1) {
      return;
    }

    this.moveQueueItem(currentIndex, currentIndex + 1);
    await this.actions.MoveQueueItemDown(queueItemId);
  }
  public async moveQueueItemNext(queueItemId: string) {
    if (!this.queue) {
      return;
    }

    const currentIndex = this.getIndex(queueItemId);
    if (currentIndex === -1) {
      return;
    }

    const playingIndex = this.queue.findIndex((i) => i.playing);
    if (playingIndex === -1) {
      return;
    }

    const newIndex = playingIndex + 1;
    this.moveQueueItem(currentIndex, newIndex);
    await this.actions.MoveQueueItemNext(queueItemId);
  }
  public async removeQueueItem(queueItemId: string) {
    if (!this.queue) return;
    this.queue = this.queue.filter((i) => i.queue_item_id !== queueItemId);
    await this.actions.removeQueueItem(queueItemId);
  }
  public async clearQueue(
    entityId: string = this.activeMediaPlayer?.entity_id ?? "",
  ) {
    await this.actions.clearQueue(entityId);
  }
  public disconnected() {
    this.unsubscribeUpdates();
  }
  public reconnected(hass: ExtendedHass) {
    this.hass = hass;
    void this.subscribeUpdates();
    this.resetQueueFailures();
    void this.getQueue();
  }
}
