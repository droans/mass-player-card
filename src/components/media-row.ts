import { consume } from "@lit/context";
import {
  html,
  type CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { property, state } from "lit/decorators.js";

import { QueueItemSelectedService, QueueService } from "../const/actions";
import { Thumbnail } from "../const/enums";
import {
  activeEntityConfContext,
  EntityConfig,
  hassContext,
  IconsContext,
  mediaCardDisplayContext,
  playerQueueConfigContext,
  useExpressiveContext,
} from "../const/context";
import { ExtendedHass, QueueItem } from "../const/types";
import { VibrationPattern } from "../const/common";

import styles from "../styles/media-row";

import {
  getThumbnail,
} from "../utils/thumbnails";
import {
  jsonMatch,
  queueItemhasUpdated,
} from "../utils/util";
import {
  DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG,
  PlayerQueueHiddenElementsConfig,
  QueueConfig,
} from "../config/player-queue";
import { Icons } from "../const/icons";
import { queueItem } from "mass-queue-types/packages/mass_queue/actions/get_queue_items.js";

class MediaRow extends LitElement {

  @consume({ context: IconsContext }) public Icons!: Icons;

  @consume({ context: mediaCardDisplayContext, subscribe: true })
  @state()
  public display!: boolean;

  @consume({ context: useExpressiveContext, subscribe: true })
  public useExpressive!: boolean;

  public moveQueueItemDownService!: QueueService;
  public moveQueueItemNextService!: QueueService;
  public moveQueueItemUpService!: QueueService;
  public removeService!: QueueService;
  public selectedService!: QueueItemSelectedService;

  public showAlbumCovers = true;
  private _media_item!: QueueItem;

  private _config!: QueueConfig;
  private _entityConfig!: EntityConfig;
  private _hass!: ExtendedHass;

  private hide: PlayerQueueHiddenElementsConfig =
    DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG;

  @consume({ context: playerQueueConfigContext, subscribe: true })
  public set config(config: QueueConfig) {
    if (jsonMatch(this._config, config)) {
      return;
    }
    this._config = config;
    this.updateHiddenElements();
  }
  public get config() {
    return this._config;
  }

  @consume({ context: activeEntityConfContext, subscribe: true })
  public set entityConfig(config: EntityConfig) {
    if (jsonMatch(this._entityConfig, config)) {
      return;
    }
    this._entityConfig = config;
    this.updateHiddenElements();
  }
  public get entityConfig() {
    return this._entityConfig;
  }
  
  @consume({ context: hassContext, subscribe: true })
  public set hass(hass: ExtendedHass) {
    this._hass = hass;
  }
  public get hass() {
    return this._hass;
  }

  private updateHiddenElements() {
    if (!this.entityConfig || !this.config) {
      return;
    }
    const entity = this._entityConfig.hide.queue;
    const card = this._config.hide;
    this.hide = {
      album_covers: entity.album_covers || card.album_covers,
      artist_names: entity.artist_names || card.artist_names,
      action_buttons: entity.action_buttons || card.action_buttons,
      move_down_button: entity.move_down_button || card.move_down_button,
      move_next_button: entity.move_next_button || card.move_next_button,
      move_up_button: entity.move_up_button || card.move_up_button,
      remove_button: entity.remove_button || card.remove_button,
      clear_queue_button: entity.clear_queue_button || card.clear_queue_button,
    };
  }

  @property({ attribute: false }) 
  public set media_item(media_item: QueueItem) {
    this._media_item = media_item;
  }
  public get media_item() {
    return this._media_item;
  }


  private callMoveItemUpService = (e: Event) => {
    navigator.vibrate(VibrationPattern.Queue.ACTION_MOVE_UP);
    e.stopPropagation();
    this.moveQueueItemUpService(this.media_item.queue_item_id);
  }
  private callMoveItemDownService = (e: Event) => {
    navigator.vibrate(VibrationPattern.Queue.ACTION_MOVE_DOWN);
    e.stopPropagation();
    this.moveQueueItemDownService(this.media_item.queue_item_id);
  }
  private callMoveItemNextService = (e: Event) => {
    navigator.vibrate(VibrationPattern.Queue.ACTION_MOVE_NEXT);
    e.stopPropagation();
    this.moveQueueItemNextService(this.media_item.queue_item_id);
  }
  private callRemoveItemService = (e: Event) => {
    e.stopPropagation();
    navigator.vibrate(VibrationPattern.Queue.ACTION_REMOVE);
    this.removeService(this.media_item.queue_item_id);
  }
  private callOnQueueItemSelectedService = () => {
    this.selectedService(this.media_item.queue_item_id);
  }
  protected shouldUpdate(_changedProperties: PropertyValues<this>): boolean {
    if (_changedProperties.has("media_item")) {
      const oldItem = _changedProperties.get("media_item") as queueItem;
      return queueItemhasUpdated(oldItem, this.media_item);
    }
    return _changedProperties.size > 0;
  }

  private renderThumbnail(): TemplateResult {
    const played = !this.media_item.show_action_buttons && !this.media_item?.playing;
    const fallback = getThumbnail(this.hass, Thumbnail.DISC)
    const img = this.media_item.local_image_encoded ?? this.media_item.media_image ?? fallback;
    if ( this.showAlbumCovers && !this.hide.album_covers) {
      return html`
        <img
          class="thumbnail${played ? "-disabled" : ""}"
          slot="start"
          src="${img}"
          onerror="this.src=${fallback}"
          loading="lazy"
        >
      `
    }
    return html``;
  }
  private _calculateTitleWidth() {
    let button_ct = 0;
    const hide = this.config.hide;
    const media_item = this.media_item;
    if (media_item.show_move_up_next && !hide.move_next_button) {
      button_ct += 1;
    }
    if (media_item.show_move_up_next && !hide.move_up_button) {
      button_ct += 1;
    }
    if (!hide.move_down_button) {
      button_ct += 1;
    }
    if (!hide.remove_button) {
      button_ct += 1;
    }
    if (
      button_ct == 0 ||
      !media_item.show_action_buttons ||
      hide.action_buttons
    ) {
      return `100%`;
    }
    const gap_ct = button_ct - 1;
    return `calc(100% - ((32px * ${button_ct.toString()}) + (8px * ${gap_ct.toString()}) + 16px));`;
  }
  private renderTitle(): TemplateResult {
    const played =
      !this.media_item.show_action_buttons && !this.media_item?.playing;
    return html`
      <span
        slot="headline"
        class="title ${played ? "title-disabled" : ""}"
        style="width: ${this._calculateTitleWidth()}"
      >
        ${this.media_item.media_title}
      </span>
    `;
  }
  private renderArtist(): TemplateResult {
    if (this.hide.artist_names) {
      return html``;
    }
    const played =
      !this.media_item.show_action_buttons && !this.media_item?.playing;
    return html`
      <span
        slot="supporting-text"
        class="title ${played ? "title-disabled" : ""}"
        style="width: ${this._calculateTitleWidth()}"
      >
        ${this.media_item.media_artist}
      </span>
    `;
  }
  private renderActionButtons(): TemplateResult {
    if (this.hide.action_buttons || !this.media_item.show_action_buttons) {
      return html``;
    }
    return html`
      <span
        slot="end"
        class="button-group"
        @click=${(e: Event) => {
          e.stopPropagation();
        }}
      >
        ${this.renderMoveNextButton()} ${this.renderMoveUpButton()}
        ${this.renderMoveDownButton()} ${this.renderRemoveButton()}
      </span>
    `;
  }
  private renderMoveNextButton(): TemplateResult {
    if (this.hide.move_next_button || !this.media_item.show_move_up_next) {
      return html``;
    }
    return html`
      <mass-player-card-button
        .onPressService=${this.callMoveItemNextService}
        role="tonal"
        size="small"
        elevation=1
        class="action-button ${this.useExpressive ? `action-button-expressive` : ``}"
      >
        <ha-svg-icon
          .path=${this.Icons.ARROW_PLAY_NEXT}
          class="svg-action-button ${this.useExpressive
            ? `svg-action-button-expressive`
            : ``}"
        ></ha-svg-icon>
      </mass-player-card-button>
    `;
  }
  private renderMoveUpButton(): TemplateResult {
    if (this.hide.move_up_button || !this.media_item.show_move_up_next) {
      return html``;
    }
    return html`
      <mass-player-card-button
        .onPressService=${this.callMoveItemUpService}
        role="tonal"
        size="small"
        elevation=1
        class="action-button ${this.useExpressive ? `action-button-expressive` : ``}"
      >
        <ha-svg-icon
          .path=${this.Icons.ARROW_UP}
          class="svg-action-button ${this.useExpressive
            ? `svg-action-button-expressive`
            : ``}"
        ></ha-svg-icon>
      </mass-player-card-button>
    `;
  }
  private renderMoveDownButton(): TemplateResult {
    if (this.hide.move_down_button) {
      return html``;
    }
    return html`
      <mass-player-card-button
        .onPressService=${this.callMoveItemDownService}
        role="tonal"
        size="small"
        elevation=1
        class="action-button ${this.useExpressive ? `action-button-expressive` : ``}"
      >
        <ha-svg-icon
          .path=${this.Icons.ARROW_DOWN}
          class="svg-action-button ${this.useExpressive
            ? `svg-action-button-expressive`
            : ``}"
        ></ha-svg-icon>
      </mass-player-card-button>
    `;
  }
  private renderRemoveButton(): TemplateResult {
    if (this.hide.remove_button) {
      return html``;
    }
    return html`
      <mass-player-card-button
        .onPressService=${this.callRemoveItemService}
        role="tonal"
        size="small"
        elevation=1
        class="action-button ${this.useExpressive ? `action-button-expressive` : ``}"
      >
        <ha-svg-icon
          .path=${this.Icons.CLOSE}
          class="svg-action-button ${this.useExpressive
            ? `svg-action-button-expressive`
            : ``}"
        ></ha-svg-icon>
      </mass-player-card-button>
    `;
  }

  render(): TemplateResult {
    const playing = this.media_item.playing ? `-active` : ``;
    const expressive = this.useExpressive ? `button-expressive${playing}` : ``;
    return html`
      <ha-md-list-item
        style="${this.display ? "" : "display: none;"}"
        class="button${playing} ${expressive}"
        @click=${this.callOnQueueItemSelectedService}
        type="button"
      >
        ${this.renderThumbnail()} ${this.renderTitle()} ${this.renderArtist()}
        ${this.renderActionButtons()}
      </ha-md-list-item>
      <div class="divider"></div>
    `;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define("mass-player-media-row", MediaRow);
