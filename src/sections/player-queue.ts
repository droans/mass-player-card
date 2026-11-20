import { consume, provide } from "@lit/context";
import { LovelaceCard } from "custom-card-helpers";
import {
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
  type CSSResultGroup,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import "../components/lit-virtualizer/lit-virtualizer";
import "../components/media-row/media-row";
import "../components/section-header/section-header";

import {
  DEFAULT_QUEUE_CONFIG,
  PlayerQueueHiddenElementsConfig,
  QueueConfig,
  QueueConfigErrors,
} from "../config/player-queue";

import {
  activeEntityIDContext,
  activePlayerControllerContext,
  hassContext,
  IconsContext,
  playerQueueConfigContext,
  playerQueueHiddenElementsConfigContext,
  queueContext,
  queueControllerContext,
} from "../const/context";
import { ExtendedHass, QueueItem, QueueItems } from "../const/types";

import { PlayerRow } from "../components/player-row/player-row";
import { Sections } from "../const/enums";
import { Icons } from "../const/icons";
import { ActivePlayerController } from "../controller/active-player";
import { QueueController } from "../controller/queue";
import styles from "../styles/player-queue";
import { getTranslation } from "../utils/translations";
import { jsonMatch } from "../utils/utility";

@customElement("mpc-queue-card")
export class QueueCard extends LitElement {
  @state() private _queue: QueueItems = [];
  @state() public _tabSwitchFirstUpdate = false;

  @query(".queue.current") private currentItemElement?: PlayerRow;

  @consume({ context: activePlayerControllerContext })
  private activePlayerController!: ActivePlayerController;
  @consume({ context: IconsContext, subscribe: true })
  private Icons!: Icons;
  @consume({ context: playerQueueHiddenElementsConfigContext, subscribe: true })
  private hiddenElements!: PlayerQueueHiddenElementsConfig;

  @provide({ context: playerQueueConfigContext })
  public _config!: QueueConfig;

  private _queueController?: QueueController;
  // private reconnected = false;

  @consume({ context: queueControllerContext, subscribe: true })
  public set queueController(controller: QueueController | undefined) {
    this._queueController = controller;
  }
  public get queueController() {
    return this._queueController;
  }

  @consume({ context: queueContext, subscribe: true })
  public set queue(queue: QueueItems | null) {
    if (queue) {
      if (!this.queue?.length) {
        this._queue = this.processQueue(queue);
        return;
      }
      if (!jsonMatch(this.queue, queue)) {
        this._queue = this.processQueue(queue);
      }
      return;
    }
  }
  public get queue() {
    return this._queue;
  }

  private processQueue(queue: QueueItems) {
    const activeIdx = queue.findIndex((i) => i.playing);

    return queue.map((item, idx) => {
      {
        const r: QueueItem = {
          ...item,
          show_action_buttons: idx > activeIdx,
          show_move_up_next: idx > activeIdx + 1,
        };
        return r;
      }
    });
  }

  private _active_player_entity!: string;
  private _hass?: ExtendedHass;
  private error?: TemplateResult;

  @consume({ context: hassContext, subscribe: true })
  public set hass(hass: ExtendedHass | undefined) {
    if (!hass) {
      return;
    }
    this._hass = hass;
  }
  public get hass() {
    return this._hass;
  }

  @consume({ context: activeEntityIDContext, subscribe: true })
  @property({ attribute: false })
  public set active_player_entity(activePlayerEntity: string) {
    this._active_player_entity = activePlayerEntity;
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
      ...config,
    };
  }
  public get config() {
    return this._config;
  }

  private testConfig(config: QueueConfig | undefined, testActive = true) {
    if (!config) {
      return QueueConfigErrors.CONFIG_MISSING;
    }
    if (testActive) {
      if (!this.active_player_entity) {
        return QueueConfigErrors.NO_ENTITY;
      }
      if (typeof this.active_player_entity !== "string") {
        return QueueConfigErrors.ENTITY_TYPE;
      }
    }
    if (this.hass && !this.hass.states[this.active_player_entity]) {
      return QueueConfigErrors.MISSING_ENTITY;
    }
    return QueueConfigErrors.OK;
  }
  private getActiveIndex(): number {
    if (!this.queue?.length) {
      return 0;
    }
    const activeIdx = this.queue.findIndex((item) => {
      return item.playing;
    });
    return activeIdx == -1 ? 0 : activeIdx;
  }
  public scrollToActive() {
    this.currentItemElement?.scrollIntoView({
      block: "start",
      behavior: "auto",
    });
  }
  private onQueueItemSelected = async (queueItemId: string) => {
    if (!this.queueController) {
      return;
    }
    await this.queueController.playQueueItem(queueItemId);
    void this.queueController.getQueue();
    this.scrollToActive();
  };
  private onQueueItemRemoved = async (queueItemId: string) => {
    if (!this.queueController) {
      return;
    }
    await this.queueController.removeQueueItem(queueItemId);
  };
  private onQueueItemMoveNext = async (queueItemId: string) => {
    if (!this.queueController) {
      return;
    }
    await this.queueController.moveQueueItemNext(queueItemId);
  };
  private onQueueItemMoveUp = async (queueItemId: string) => {
    if (!this.queueController) {
      return;
    }
    await this.queueController.moveQueueItemUp(queueItemId);
  };
  private onQueueItemMoveDown = async (queueItemId: string) => {
    if (!this.queueController) {
      return;
    }
    await this.queueController.moveQueueItemDown(queueItemId);
  };
  private onClearQueue = async () => {
    if (!this.queueController) {
      return;
    }
    await this.queueController.clearQueue(this.active_player_entity);
  };
  private onTabSwitch = (event_: Event) => {
    if ((event_ as CustomEvent).detail == Sections.QUEUE) {
      this._tabSwitchFirstUpdate = true;
      // this.scrollToActive();
    }
  };
  private hideSectionHeader(): boolean {
    return this.hiddenElements.header;
  }
  private renderQueueItem(
    queueItem: QueueItem,
    itemStatusClass: "upcoming" | "played" | "active",
    itemIndex: number,
    itemCount: number,
  ): TemplateResult {
    const showAlbumCovers = this.config.show_album_covers;
    /*
      If itemIndex == 0 and itemCount == 1, there is only one item so it is marked as `only`.
      Otherwise, if itemIndex == 0, it is the first item and is marked as `first`.
      And if itemIndex == itemCount - 1, it is the last item and is marked as `last`.
    */
    const itemLocationClass =
      itemIndex == 0 && itemCount == 1
        ? `only`
        : itemIndex == 0
          ? `first`
          : itemIndex == itemCount - 1
            ? `last`
            : ``;
    return html`
      <mpc-queue-media-row
        class="${itemStatusClass} ${itemLocationClass}"
        .media_item=${queueItem}
        .showAlbumCovers=${showAlbumCovers}
        .selectedService=${this.onQueueItemSelected}
        .removeService=${this.onQueueItemRemoved}
        .moveQueueItemNextService=${this.onQueueItemMoveNext}
        .moveQueueItemUpService=${this.onQueueItemMoveUp}
        .moveQueueItemDownService=${this.onQueueItemMoveDown}
        ?active-item=${itemStatusClass == "active"}
      ></mpc-queue-media-row>
    `;
  }
  private renderQueueItems(queueItems: QueueItems): TemplateResult {
    const queueItemCount = queueItems.length;
    return html`
      <lit-virtualizer
        .items=${queueItems}
        .renderItem=${(item: QueueItem, index: number) => {
          return this.renderQueueItem(item, "played", index, queueItemCount);
        }}
        .keyFunction=${(item: QueueItem) => {
          return item.queue_item_id;
        }}
      ></lit-virtualizer>
    `;
  }
  protected renderQueue(): TemplateResult {
    if (!this.queue || this.queue.length === 0) {
      return html``;
    }
    const currentIndex = this.getActiveIndex();
    const currentItem = this.queue[currentIndex];
    const priorQueue = this.queue.slice(0, currentIndex);
    const upcomingQueue = this.queue.slice(currentIndex + 1);
    const translatedUpNext = getTranslation(
      "queue.up_next",
      this.hass,
    ) as string;
    const remainingItems = this.queue.length - (currentIndex + 1);
    return html`
      <div class="queue prior">${this.renderQueueItems(priorQueue)}</div>
      <div id="current-queue-item" class="queue current">
        ${this.renderQueueItem(currentItem, "active", 0, 1)}
      </div>
      <div class="media-row up-next">
        <div class="up-next-title">${translatedUpNext} • ${remainingItems}</div>
        <div class="divider"></div>
      </div>
      <div class="queue upcoming">${this.renderQueueItems(upcomingQueue)}</div>
    `;
  }
  protected renderClearQueueButton(): TemplateResult {
    const hide = this.hiddenElements.clear_queue_button;
    if (hide) {
      return html``;
    }
    return html`
      <mpc-button
        .onPressService=${this.onClearQueue}
        role="tonal"
        size="small"
        elevation="1"
        id="button-back"
        class="button min"
      >
        <ha-svg-icon
          .path=${this.Icons.CLEAR}
          class="header-icon"
        ></ha-svg-icon>
      </mpc-button>
    `;
  }
  protected renderHeader(): TemplateResult {
    const label = getTranslation("queue.header", this.hass) as string;
    const usedLabel = this.hiddenElements.header_title ? `` : label;
    if (this.hideSectionHeader()) {
      return html``;
    }
    return html`
      <mpc-section-header>
        <span slot="label" id="title"> ${usedLabel} </span>
        <span slot="end" id="clear-queue">
          ${this.renderClearQueueButton()}
        </span>
      </mpc-section-header>
    `;
  }
  protected render() {
    const paddedCls = this.hideSectionHeader() ? `padded` : ``;
    return (
      this.error ??
      html`
        <div id="container">
          ${this.renderHeader()}
          <div class="list ${paddedCls}">${this.renderQueue()}</div>
        </div>
      `
    );
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (_changedProperties.size === 0) {
      return false;
    }
    if (_changedProperties.has("_config") || _changedProperties.has("queue")) {
      return true;
    }
    return super.shouldUpdate(_changedProperties);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (!this.queueController) {
      return;
    }
    if (this.queueController.isSubscribed)
      this.queueController.unsubscribeUpdates();
    this.queueController._host.removeEventListener(
      "section-changed",
      this.onTabSwitch,
    );
  }
  protected updated(): void {
    this._tabSwitchFirstUpdate = false;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
  private createError(errorString: string): Error {
    const error = new Error(errorString);
    const errorCard = document.createElement("hui-error-card") as LovelaceCard;
    errorCard.setConfig({
      type: "error",
      error,
      origConfig: this.config,
    });
    this.error = html`${errorCard}`;
    return error;
  }
}
