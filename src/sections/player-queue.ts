import { consume, provide } from '@lit/context';
import { LovelaceCard } from 'custom-card-helpers';
import { LitElement, html, type CSSResultGroup, PropertyValues, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import '../components/media-row'
import '../components/section-header';

import {
  DEFAULT_QUEUE_CONFIG,
  QueueConfig,
  QueueConfigErrors,
} from '../config/player-queue';

import { ExtendedHass } from '../const/common';
import {
  activeEntityConf,
  activeEntityID,
  activePlayerControllerContext,
  activeSectionContext,
  EntityConfig,
  hassExt,
  mediaCardDisplayContext,
  playerQueueConfigContext,
  queueContext,
  queueControllerContext
} from '../const/context';
import {
  QueueItem,
  QueueItems,
} from '../const/player-queue';

import styles from '../styles/player-queue';
import { Sections } from '../const/card';
import { ActivePlayerController } from '../controller/active-player.js';
import { QueueController } from '../controller/queue.js';

class QueueCard extends LitElement {
  
  @consume({ context: activePlayerControllerContext})
  private activePlayerController!: ActivePlayerController;

  @consume({ context: activeEntityConf, subscribe: true})
  private entityConf!: EntityConfig;

  @provide({context: playerQueueConfigContext})
  public _config!: QueueConfig;
  @state() private _queue: QueueItems = [];
  private _queueController!: QueueController;

  @consume({ context: queueControllerContext, subscribe: true})
  public set queueController(controller: QueueController) {
    this._queueController = controller;
  }
  public get queueController() {
    return this._queueController;
  }
  
  @consume({ context: queueContext, subscribe: true})
  public set queue(queue: QueueItems | null) {
    if (queue) {
      if (!this.queue?.length) {
        this._queue = queue;
        return;
      }
      const new_queue = JSON.stringify(queue);
      const old_queue = JSON.stringify(this.queue);
      if (new_queue != old_queue) {
        this._queue = this.processQueue(queue);
      }
      return;
    }
  }
  public get queue() {
    return this._queue;
  }

  private processQueue(queue: QueueItems) {
    const active_idx = queue.findIndex( i => i.playing );

    return queue.map(
      (item, idx) => {
        {
          const r: QueueItem = {
            ...item,
            show_action_buttons: idx > active_idx,
            show_move_up_next: idx > active_idx + 1,
          }
          return r;
        }
      }
    )
  }

  private _active_player_entity!: string;
  private _hass!: ExtendedHass;
  private error?: TemplateResult;

  @provide({context: mediaCardDisplayContext})
  private _mediaCardDisplay = true;
  private _section!: Sections;

  @consume({ context: activeSectionContext, subscribe: true})
  public set activeSection(section: Sections) {
    this._mediaCardDisplay = section == Sections.QUEUE;
    this._section = section;
  }
  public get activeSection() {
    return this._section;
  }
  @consume({context: hassExt, subscribe: true})
  public set hass(hass: ExtendedHass) {
    if (!hass) {
      return;
    }
    this._hass = hass;
  }
  public get hass() {
    return this._hass;
  }
  
  @consume( { context: activeEntityID, subscribe: true})
  @property({ attribute: false})
  public set active_player_entity(active_player_entity: string) {
    this._active_player_entity = active_player_entity;
  }
  public get active_player_entity() {
    return this._active_player_entity;
  }

  public set config(config: QueueConfig) {
    const status = this.testConfig(config, false);
    if (status !== QueueConfigErrors.OK) {
      throw this.createError(status);
    }
    this._config = {
      ...DEFAULT_QUEUE_CONFIG,
      ...config
    };
  }
  public get config() {
    return this._config;
  }

  private testConfig(config: QueueConfig, test_active = true) {
    if (!config) {
      return QueueConfigErrors.CONFIG_MISSING;
    }
    if (test_active) {
      if (!this.active_player_entity) {
        return QueueConfigErrors.NO_ENTITY;
      };
      if (typeof(this.active_player_entity) !== "string") {
        return QueueConfigErrors.ENTITY_TYPE;
      }
    }
    if (this.hass) {
      if (!this.hass.states[this.active_player_entity]) {
        return QueueConfigErrors.MISSING_ENTITY;
      }
    }
    return QueueConfigErrors.OK;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (!_changedProperties.size) {
      return false;
    }
    if (
      _changedProperties.has('_config')
      || _changedProperties.has('queue')
    ) {
      return true;
    }
    return super.shouldUpdate(_changedProperties);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this?.queueController?.isSubscribed) this.queueController.unsubscribeUpdates();
    super.disconnectedCallback();
  }
  public connectedCallback(): void {
    if (this.queueController) {
      void this.queueController.subscribeUpdates();
    }
    super.connectedCallback();
  }
  private onQueueItemSelected = async (queue_item_id: string) => {
    await this.queueController.playQueueItem(queue_item_id);
    await this.queueController.getQueue();
  }
  private onQueueItemRemoved = async (queue_item_id: string) => {
    await this.queueController.removeQueueItem(queue_item_id);
  }
  private onQueueItemMoveNext = async (queue_item_id: string) => {
    await this.queueController.moveQueueItemNext(queue_item_id);
  }
  private onQueueItemMoveUp = async (queue_item_id: string) => {
    await this.queueController.moveQueueItemUp(queue_item_id);
  }
  private onQueueItemMoveDown = async (queue_item_id: string) => {
    await this.queueController.moveQueueItemDown(queue_item_id);
  }
  private renderQueueItems() {
    const show_album_covers = this._config.show_album_covers;
    const delay_add = 62.5;
    let i = 1;
    const visibility = this.checkVisibility();
    return this.queue?.map(
      (item) => {
        const result = 
          html`
            <wa-animation
              name="fadeIn"
              delay=${delay_add * i}
              duration=${delay_add * 2}
              fill="forwards"
              play=${visibility}
              iterations=1
            >
              <mass-player-media-row
                style="opacity: 0%;"
                .media_item=${item}
                .showAlbumCovers=${show_album_covers}
                .selectedService=${this.onQueueItemSelected}
                .removeService=${this.onQueueItemRemoved}
                .moveQueueItemNextService=${this.onQueueItemMoveNext}
                .moveQueueItemUpService=${this.onQueueItemMoveUp}
                .moveQueueItemDownService=${this.onQueueItemMoveDown}
              >
              </mass-player-media-row>
            </wa-animation>
          `
        ;
        i++;
        return result;
      }
    );
  }
  protected render() {
    const expressive = this.activePlayerController.useExpressive;
    return this.error ?? html`
      <div
        id="container"
        class="${expressive ? `container-expressive` : ``}"
      >
        <mass-section-header>
          <span slot="label" id="title">
            Queue
          </span>
        </mass-section-header>
        <ha-md-list class="list ${expressive ? `list-expressive` : ``}">
          ${this.renderQueueItems()}
        </ha-md-list>
      </div>
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
