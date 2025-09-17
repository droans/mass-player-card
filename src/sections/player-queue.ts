import { LitElement, html, type CSSResultGroup, PropertyValues, TemplateResult } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import { property, state } from 'lit/decorators.js';

import QueueActions from '../actions/queue-actions';
import styles from '../styles/player-queue';
import '../components/media-row'
import { 
  DEFAULT_QUEUE_CONFIG,
  MassQueueEvent,
  QueueConfig,
  QueueItem,
} from '../const/player-queue';
import { QueueConfigErrors } from '../config/player-queue';
import { ExtendedHass } from '../const/common';
import { LovelaceCard } from 'custom-card-helpers';

class QueueCard extends LitElement {
  @state() private lastUpdated = '';
  private _active_player_entity!: string;
  @property({ attribute: false }) public _config!: QueueConfig;
  private _hass!: ExtendedHass;
  @state() private queue: QueueItem[] = [];
  private error?: TemplateResult;
  public set hass(hass: ExtendedHass) {
    if (!hass) {
      return;
    }
    if (this._active_player_entity) {
      const lastUpdated = hass.states[this._active_player_entity].last_updated;
      if (lastUpdated !== this.lastUpdated) {
        this.lastUpdated = lastUpdated;
      }
    }
    this._hass = hass;
  }
  public get hass() {
    return this._hass;
  }
  private testConfig(config: QueueConfig) {
    if (!config) {
      return QueueConfigErrors.CONFIG_MISSING;
    }
    if (!this._active_player_entity) {
      return QueueConfigErrors.NO_ENTITY;
    };
    if (typeof(this._active_player_entity) !== "string") {
      return QueueConfigErrors.ENTITY_TYPE;
    }
    if (this.hass) {
      if (!this.hass.states[this._active_player_entity]) {
        return QueueConfigErrors.MISSING_ENTITY;
      }
    }
    return QueueConfigErrors.OK;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (
      _changedProperties.has('_config')
      || _changedProperties.has('queue')
    ) {
      return true;
    }
    if (_changedProperties.has('hass')) {
      const cur_id = this.newId;
      const new_id = this.hass.states[this._active_player_entity].attributes.media_content_id;
      this.newId = new_id;
      return cur_id !== new_id;
    }
    return super.shouldUpdate(_changedProperties);
  }
  private _listening = false;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  private _unsubscribe: any;
  private queueID = '';
  private newId = '';
  private actions!: QueueActions;
  private failCt = 0;
  private maxFailCt = 5;
  private hasFailed = false;

  @property({ attribute: false})
  set active_player_entity(active_player_entity: string) {
    this._active_player_entity = active_player_entity;
    this.getQueueIfReady();
  }
  public set config(config: QueueConfig) {
   
    const status = this.testConfig(config);
    if (status !== QueueConfigErrors.OK) {
      throw this.createError(status);
    }
    this._config = {
      ...DEFAULT_QUEUE_CONFIG,
      ...config
    };
    this.getQueueIfReady();
  }
  public get config() {
    return this._config;
  }
  private getQueueIfReady() {
    if (!this.hass || !this._config || !this._active_player_entity) {
      return
    }
    this.getQueue(true);
    if (!this._listening) {
      this.subscribeUpdates();
  }
  }
  private eventListener = (event: MassQueueEvent) => {
    const event_data = event.data;
    if (event_data.type == 'queue_updated') {
      const updated_queue_id = event_data.data.queue_id;
      if (updated_queue_id == this.queueID) {
        this.getQueue(true);
    }}
  }
  private async subscribeUpdates() {
    this._unsubscribe = await this.hass.connection.subscribeEvents(
      this.eventListener, 
      "mass_queue"
    );
    this._listening = true;
  }
  public disconnectedCallback(): void {
    super.disconnectedCallback();
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-call */
    this._unsubscribe();
  }
  private getQueueItemIndex(queue_item_id: string, queue: QueueItem[] = []): number {
    if (!queue.length) {
      queue = this.queue;
    }
    return queue.findIndex(item => item.queue_item_id == queue_item_id)
  }
  private moveQueueItem(old_index, new_index) {
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */
    this.queue.splice(new_index, 0, this.queue.splice(old_index, 1)[0]);
  }
  private getQueue(forced_id = false) {
    if (
      !this.actions 
      || this.actions.player_entity !== this._active_player_entity
    ) {
      this.actions = new QueueActions(this.hass, this._active_player_entity)
    }
    if (this.testConfig(this._config) !== QueueConfigErrors.OK || this.hasFailed) {
      return;
    }
    if (this.failCt >= this.maxFailCt) {
      this.hasFailed = true;
      throw this.createError(`Failed to get queue ${this.failCt.toString()} times! Please check card config and that the services are working properly.`)
      return
    }
    if (forced_id) {
      const new_id = this.hass.states[this._active_player_entity]?.attributes?.media_content_id;
      if (new_id) {
        this.newId = new_id;
      }
    }
    try {
      /* eslint-disable-next-line @typescript-eslint/no-floating-promises */
      this.actions.getQueue(this._config.limit_before, this._config.limit_after).then(
        (queue) => {
          if (queue == null) {
            this.failCt ++;
            return
          }
          this.queue = this.updateActiveTrack(queue);
        }
      );
      this.queueID = this.hass.states[this._active_player_entity].attributes.active_queue;
    } catch {
      this.queue = []
    }
  }
  private updateActiveTrack(queue: QueueItem[]): QueueItem[] {
    let content_id = this.newId;
    if (!content_id.length) {
      content_id = this.hass.states[this._active_player_entity].attributes.media_content_id;
    }
    const activeIndex = queue.findIndex(item => item.media_content_id === content_id);
    return queue.map( (element, index) => ({
      ...element,
      playing: index === activeIndex,
      show_action_buttons: index > activeIndex,
      show_move_up_next: index > activeIndex + 1,
      show_artist_name: this._config.show_artist_names
    }));
  }
  private onQueueItemSelected = async (queue_item_id: string, content_id: string) => {
    this.newId = content_id
    await this.actions.playQueueItem(queue_item_id);
    this.getQueue();
  }
  private onQueueItemRemoved = async (queue_item_id: string) => {
    await this.actions.removeQueueItem(queue_item_id);
    this.queue = this.queue.filter( (item) => item.queue_item_id !== queue_item_id);
  }
  private onQueueItemMoveNext = async (queue_item_id: string) => {
    const cur_idx = this.getQueueItemIndex(queue_item_id) ;
    const new_idx = this.queue.findIndex(item => item.playing) + 1;
    this.moveQueueItem(cur_idx, new_idx);
    await this.actions.MoveQueueItemNext(queue_item_id);
  }
  private onQueueItemMoveUp = async (queue_item_id: string) => {
    const cur_idx = this.getQueueItemIndex(queue_item_id);
    const new_idx = cur_idx - 1;
    this.moveQueueItem(cur_idx, new_idx);
    await this.actions.MoveQueueItemUp(queue_item_id);
  }
  private onQueueItemMoveDown = async (queue_item_id: string) => {
    const cur_idx = this.getQueueItemIndex(queue_item_id);
    const new_idx = cur_idx + 1;
    this.moveQueueItem(cur_idx, new_idx);
    await this.actions.MoveQueueItemDown(queue_item_id);
  }
  private renderQueueItems() {
    const show_album_covers = this._config.show_album_covers;
    return this.queue.map(
      (item) => {
        return keyed(
          item.queue_item_id, 
          html`
            <mass-player-media-row
              .media_item=${item}
              .selected=${item.playing}
              .showAlbumCovers=${show_album_covers}
              .showMoveUpNext=${item.show_move_up_next}
              .showArtistName=${item.show_artist_name}
              .selectedService=${this.onQueueItemSelected}
              .removeService=${this.onQueueItemRemoved}
              .moveQueueItemNextService=${this.onQueueItemMoveNext}
              .moveQueueItemUpService=${this.onQueueItemMoveUp}
              .moveQueueItemDownService=${this.onQueueItemMoveDown}
              .hass=${this.hass}
            >
            </mass-player-media-row>`
        )
      }
    );
  }
  protected render() {
    return this.error ?? html`
      <ha-card>
        <ha-md-list class="list">
          ${this.renderQueueItems()}
        </ha-md-list>
      </ha-card>
    `
  }
  
  static get styles(): CSSResultGroup {
    return styles;
  }
  private createError(errorString: string): Error {
    const error = new Error(errorString);
    const errorCard = document.createElement('hui-error-card') as LovelaceCard;
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this._config,
    });
    this.error = html`${errorCard}`;
    return error;
  }

}
customElements.define('mass-player-queue-card', QueueCard);
