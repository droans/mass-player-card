import { consume, provide } from "@lit/context";
import { LovelaceCard } from "custom-card-helpers";
import {
  LitElement,
  html,
  type CSSResultGroup,
  PropertyValues,
  TemplateResult,
} from "lit";
import { property, query, queryAll, state } from "lit/decorators.js";
import "../components/media-row";
import "../components/section-header";

import {
  DEFAULT_QUEUE_CONFIG,
  QueueConfig,
  QueueConfigErrors,
} from "../config/player-queue";

import { ExtendedHass, QueueItem, QueueItems } from "../const/types";
import {
  activeEntityConfContext,
  activeEntityIDContext,
  activePlayerControllerContext,
  activeSectionContext,
  EntityConfig,
  hassContext,
  IconsContext,
  mediaCardDisplayContext,
  playerQueueConfigContext,
  queueContext,
  queueControllerContext,
} from "../const/context";

import styles from "../styles/player-queue";
import { Sections } from "../const/enums";
import { ActivePlayerController } from "../controller/active-player";
import { QueueController } from "../controller/queue";
import { jsonMatch } from "../utils/util";
import { getTranslation } from "../utils/translations";
import { Icons } from "../const/icons";
import { WaAnimation } from "../const/elements";

class QueueCard extends LitElement {
  @consume({ context: activePlayerControllerContext })
  private activePlayerController!: ActivePlayerController;

  @consume({ context: activeEntityConfContext, subscribe: true })
  private entityConf!: EntityConfig;

  @consume({ context: IconsContext, subscribe: true })
  private Icons!: Icons;

  @provide({ context: playerQueueConfigContext })
  public _config!: QueueConfig;
  @state() private _queue: QueueItems = [];
  private _queueController?: QueueController;

  @queryAll("#animation") _animations?: WaAnimation[];
  @query(".media-active") _activeElement!: HTMLElement;
  @query(".list") _items!: HTMLElement;

  private _firstLoaded = false;

  @state() public _tabSwitchFirstUpdate = false;

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
    const active_idx = queue.findIndex((i) => i.playing);

    return queue.map((item, idx) => {
      {
        const r: QueueItem = {
          ...item,
          show_action_buttons: idx > active_idx,
          show_move_up_next: idx > active_idx + 1,
        };
        return r;
      }
    });
  }

  private _active_player_entity!: string;
  private _hass?: ExtendedHass;
  private error?: TemplateResult;

  @provide({ context: mediaCardDisplayContext })
  private _mediaCardDisplay = true;
  private _section!: Sections;

  @consume({ context: activeSectionContext, subscribe: true })
  public set activeSection(section: Sections) {
    this._mediaCardDisplay = section == Sections.QUEUE;
    this._section = section;
  }
  public get activeSection() {
    return this._section;
  }
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
      ...config,
    };
  }
  public get config() {
    return this._config;
  }

  private testConfig(config: QueueConfig | undefined, test_active = true) {
    if (!config) {
      return QueueConfigErrors.CONFIG_MISSING;
    }
    if (test_active) {
      if (!this.active_player_entity) {
        return QueueConfigErrors.NO_ENTITY;
      }
      if (typeof this.active_player_entity !== "string") {
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
  private scrollToActive() {
    if (!this.queue?.length) {
      return;
    }
    const item_offset = this._activeElement.offsetTop;
    const padding = this._activeElement.offsetHeight * 2;
    const scroll = item_offset - padding;
    this._items.scrollTop = scroll;
  }
  private onQueueItemSelected = async (queue_item_id: string) => {
    if (!this.queueController) {
      return;
    }
    await this.queueController.playQueueItem(queue_item_id);
    void this.queueController.getQueue();
    this.scrollToActive();
  };
  private onQueueItemRemoved = async (queue_item_id: string) => {
    if (!this.queueController) {
      return;
    }
    await this.queueController.removeQueueItem(queue_item_id);
  };
  private onQueueItemMoveNext = async (queue_item_id: string) => {
    if (!this.queueController) {
      return;
    }
    await this.queueController.moveQueueItemNext(queue_item_id);
  };
  private onQueueItemMoveUp = async (queue_item_id: string) => {
    if (!this.queueController) {
      return;
    }
    await this.queueController.moveQueueItemUp(queue_item_id);
  };
  private onQueueItemMoveDown = async (queue_item_id: string) => {
    if (!this.queueController) {
      return;
    }
    await this.queueController.moveQueueItemDown(queue_item_id);
  };
  private onClearQueue = async () => {
    if (!this.queueController) {
      return;
    }
    await this.queueController.clearQueue(this.active_player_entity);
  };
  private onTabSwitch = (ev: Event) => {
    if ((ev as CustomEvent).detail == Sections.QUEUE) {
      this._tabSwitchFirstUpdate = true;
      this.scrollToActive();
    }
  };
  private renderQueueItems() {
    const show_album_covers = this._config.show_album_covers;
    const delay_add = 62.5;
    let i = 1;
    const play = this._tabSwitchFirstUpdate;
    return this.queue?.map((item) => {
      const result = html`
        <wa-animation
          id="animation"
          name="fadeIn"
          delay=${delay_add * i}
          duration=${delay_add * 2}
          fill="forwards"
          play=${play}
          iterations="1"
        >
          <mass-player-media-row
            style="opacity: 0%;"
            class="${item.playing ? `media-active` : ``}"
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
      `;
      i++;
      return result;
    });
  }
  protected renderClearQueueButton(): TemplateResult {
    const expressive = this.activePlayerController.useExpressive;
    const hide =
      this.config.hide.clear_queue_button ||
      this.entityConf.hide.queue.clear_queue_button;
    if (hide) {
      return html``;
    }
    return html`
      <mass-player-card-button
        .onPressService=${this.onClearQueue}
        role="filled"
        size="small"
        elevation="1"
        id="button-back"
        class="button-min ${expressive ? `button-expressive` : ``}"
      >
        <ha-svg-icon
          .path=${this.Icons.CLEAR}
          class="header-icon"
        ></ha-svg-icon>
      </mass-player-card-button>
    `;
  }
  protected renderHeader(): TemplateResult {
    const label = getTranslation("queue.header", this.hass) as string;
    return html`
      <mass-section-header>
        <span slot="label" id="title"> ${label} </span>
        <span slot="end" id="clear-queue">
          ${this.renderClearQueueButton()}
        </span>
      </mass-section-header>
    `;
  }
  protected render() {
    const expressive = this.activePlayerController.useExpressive;
    return (
      this.error ??
      html`
        <div id="container" class="${expressive ? `container-expressive` : ``}">
          ${this.renderHeader()}
          <ha-md-list class="list ${expressive ? `list-expressive` : ``}">
            ${this.renderQueueItems()}
          </ha-md-list>
        </div>
      `
    );
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (!_changedProperties.size) {
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
    super.disconnectedCallback();
  }
  public connectedCallback(): void {
    if (this.queueController) {
      void this.queueController.getQueue();
      void this.queueController.subscribeUpdates();
    }
    if (this._animations && this._firstLoaded) {
      this._animations.forEach((animation) => (animation.play = true));
    }
    this.queueController?._host.addEventListener(
      "section-changed",
      this.onTabSwitch,
    );
    super.connectedCallback();
  }
  protected firstUpdated(): void {
    this._firstLoaded = true;
    if (!this.queueController) {
      return;
    }
    this.queueController._host.addEventListener(
      "section-changed",
      this.onTabSwitch,
    );
  }
  protected updated(): void {
    this._tabSwitchFirstUpdate = false;
    // this.scrollToActive();
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
      origConfig: this._config,
    });
    this.error = html`${errorCard}`;
    return error;
  }
}
customElements.define("mass-player-queue-card", QueueCard);
