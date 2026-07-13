import { consume } from "@lit/context";
import {
  html,
  type CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import { QueueItemSelectedService, QueueService } from "../../const/actions";
import { Thumbnail } from "../../const/enums";
import {
  activeEntityConfigContext,
  configContext,
  EntityConfig,
  hassContext,
  IconsContext,
  mediaCardDisplayContext,
  playerQueueConfigContext,
  playerQueueHiddenElementsConfigContext,
  useExpressiveContext,
} from "../../const/context";
import { ExtendedHass, QueueItem } from "../../const/types";
import { VibrationPattern } from "../../const/common";

import styles from "./media-row-styles";

import {
  asyncImageURLWithFallback,
  getThumbnail,
  getTrackFallbackImg,
} from "../../utils/thumbnails";
import { jsonMatch, queueItemhasUpdated } from "../../utils/utility";
import {
  PlayerQueueHiddenElementsConfig,
  QueueConfig,
} from "../../config/player-queue";
import { Icons } from "../../const/icons";
import { queueItem } from "mass-queue-types/packages/mass_queue/actions/get_queue_items";
import { Config } from "../../config/config";

@customElement("mpc-queue-media-row")
export class MediaRow extends LitElement {
  @consume({ context: IconsContext }) public Icons!: Icons;

  @consume({ context: mediaCardDisplayContext, subscribe: true })
  @state()
  public display!: boolean;

  @consume({ context: useExpressiveContext, subscribe: true })
  public useExpressive!: boolean;
  @state() public defaultImageURL?: string;
  @state() public fallbackImageURL?: string;
  @query(".thumbnail") thumbnailElement!: HTMLImageElement;
  private imagesExhausted = false;
  private errorCount = 0;

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

  @consume({ context: playerQueueHiddenElementsConfigContext, subscribe: true })
  private hide!: PlayerQueueHiddenElementsConfig;
  @consume({ context: configContext, subscribe: true })
  protected cardConfig!: Config;

  @consume({ context: playerQueueConfigContext, subscribe: true })
  public set config(config: QueueConfig | undefined) {
    if (jsonMatch(this._config, config) || !config) {
      return;
    }
    this._config = config;
  }
  public get config() {
    return this._config;
  }

  @consume({ context: activeEntityConfigContext, subscribe: true })
  public set entityConfig(config: EntityConfig | undefined) {
    if (jsonMatch(this._entityConfig, config) || !config) {
      return;
    }
    this._entityConfig = config;
  }
  public get entityConfig() {
    return this._entityConfig;
  }

  @consume({ context: hassContext, subscribe: true })
  public set hass(hass: ExtendedHass) {
    this._hass = hass;
    void this.getTrackImage();
  }
  public get hass() {
    return this._hass;
  }

  @property({ attribute: false })
  public set media_item(media_item: QueueItem | undefined) {
    if (!media_item) {
      return;
    }
    this._media_item = media_item;
    void this.getTrackImage();
  }
  public get media_item() {
    return this._media_item;
  }

  protected async getTrackImage() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.hass || !this.media_item) {
      return;
    }
    const track = this.media_item;
    const mediaImg =
      track.media_image.length > 0 ? track.media_image : Thumbnail.CLEFT;
    const locImg = track.local_image_encoded?.length
      ? track.local_image_encoded
      : mediaImg;
    const imgs = await asyncImageURLWithFallback(
      this.hass,
      locImg,
      mediaImg,
      this.cardConfig.download_local,
      this.cardConfig.proxy_all_artwork,
    );
    this.defaultImageURL = imgs.image_url;
    this.fallbackImageURL = imgs.fallback_url;
  }

  private callMoveItemUpService = (event_: Event) => {
    if (!this.media_item) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (navigator.vibrate) {
      navigator.vibrate(VibrationPattern.Queue.ACTION_MOVE_UP);
    }
    event_.stopPropagation();
    this.moveQueueItemUpService(this.media_item.queue_item_id);
  };
  private callMoveItemDownService = (event_: Event) => {
    if (!this.media_item) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (navigator.vibrate) {
      navigator.vibrate(VibrationPattern.Queue.ACTION_MOVE_DOWN);
    }
    event_.stopPropagation();
    this.moveQueueItemDownService(this.media_item.queue_item_id);
  };
  private callMoveItemNextService = (event_: Event) => {
    if (!this.media_item) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (navigator.vibrate) {
      navigator.vibrate(VibrationPattern.Queue.ACTION_MOVE_NEXT);
    }
    event_.stopPropagation();
    this.moveQueueItemNextService(this.media_item.queue_item_id);
  };
  private callRemoveItemService = (event_: Event) => {
    if (!this.media_item) {
      return;
    }
    event_.stopPropagation();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (navigator.vibrate) {
      navigator.vibrate(VibrationPattern.Queue.ACTION_REMOVE);
    }
    this.removeService(this.media_item.queue_item_id);
  };
  private callOnQueueItemSelectedService = () => {
    if (!this.media_item) {
      return;
    }
    this.selectedService(this.media_item.queue_item_id);
  };
  protected shouldUpdate(_changedProperties: PropertyValues<this>): boolean {
    if (_changedProperties.has("media_item")) {
      const oldItem = _changedProperties.get("media_item") as queueItem;
      return queueItemhasUpdated(oldItem, this.media_item);
    }
    return _changedProperties.size > 0;
  }

  private _renderThumbnailFallback = () => {
    this.errorCount++;
    const currentSource = this.thumbnailElement.src;
    const thumb = getTrackFallbackImg(
      this.hass,
      currentSource,
      this.defaultImageURL ?? ``,
      this.fallbackImageURL,
      Thumbnail.CLEFT,
    );
    this.thumbnailElement.src = thumb;
    if (thumb == currentSource || this.errorCount >= 5) {
      this.imagesExhausted = true;
      return;
    }
    if (this.imagesExhausted) {
      // eslint-disable-next-line unicorn/prefer-add-event-listener
      this.thumbnailElement.onerror = null;
    }
  };
  private renderThumbnail(): TemplateResult {
    if (!this.media_item) {
      return html``;
    }
    /* eslint-disable
          unicorn/no-nested-ternary,  
          @typescript-eslint/no-unnecessary-condition 
    */
    const img = this.defaultImageURL?.length
      ? this.defaultImageURL
      : this.fallbackImageURL?.length
        ? this.fallbackImageURL
        : getThumbnail(this.hass, Thumbnail.CLEFT);
    const played =
      !this.media_item.show_action_buttons && !this.media_item?.playing;
    /* eslint-enable
          unicorn/no-nested-ternary,
          @typescript-eslint/no-unnecessary-condition 
    */
    if (this.showAlbumCovers && !this.hide.album_covers) {
      return html`
        <img
          class="thumbnail ${played ? "disabled" : ""}"
          slot="start"
          src="${img}"
          @error=${this._renderThumbnailFallback}
          loading="lazy"
        />
      `;
    }
    return html``;
  }
  private _calculateTitleWidth() {
    if (!this.config || !this.media_item) {
      return;
    }
    let button_ct = 0;
    const hide = this.hide;
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
      !this.media_item?.show_action_buttons && !this.media_item?.playing;
    return html`
      <div
        class="title track 
        ${played ? "disabled" : ""}
        ${this.useExpressive ? `expressive` : ``}"
        style="width: ${this._calculateTitleWidth()}"
      >
        ${this.media_item?.media_title}
      </span>
    `;
  }
  private renderArtist(): TemplateResult {
    if (this.hide.artist_names) {
      return html``;
    }
    const played =
      !this.media_item?.show_action_buttons && !this.media_item?.playing;
    return html`
      <div
        class="title artist 
        ${played ? "disabled" : ""} 
        ${this.useExpressive ? `expressive` : ``}"
        style="width: ${this._calculateTitleWidth()}"
      >
        ${this.media_item?.media_artist}
      </span>
    `;
  }
  private renderActionButtons(): TemplateResult {
    if (this.hide.action_buttons || !this.media_item?.show_action_buttons) {
      return html``;
    }
    return html`
      <span
        slot="end"
        class="button-group"
        @click=${(event_: Event) => {
          event_.stopPropagation();
        }}
      >
        ${this.renderMoveNextButton()} ${this.renderMoveUpButton()}
        ${this.renderMoveDownButton()} ${this.renderRemoveButton()}
      </span>
    `;
  }
  private renderMoveNextButton(): TemplateResult {
    if (this.hide.move_next_button || !this.media_item?.show_move_up_next) {
      return html``;
    }
    return html`
      <mpc-button
        .onPressService=${this.callMoveItemNextService}
        role="tonal"
        size="small"
        elevation="1"
        class="action-button ${this.useExpressive ? `expressive` : ``}"
      >
        <ha-svg-icon
          .path=${this.Icons.ARROW_PLAY_NEXT}
          class="svg-action-button ${this.useExpressive ? `expressive` : ``}"
        ></ha-svg-icon>
      </mpc-button>
    `;
  }
  private renderMoveUpButton(): TemplateResult {
    if (this.hide.move_up_button || !this.media_item?.show_move_up_next) {
      return html``;
    }
    return html`
      <mpc-button
        .onPressService=${this.callMoveItemUpService}
        role="tonal"
        size="small"
        elevation="1"
        class="action-button ${this.useExpressive ? `expressive` : ``}"
      >
        <ha-svg-icon
          .path=${this.Icons.ARROW_UP}
          class="svg-action-button ${this.useExpressive ? `expressive` : ``}"
        ></ha-svg-icon>
      </mpc-button>
    `;
  }
  private renderMoveDownButton(): TemplateResult {
    if (this.hide.move_down_button) {
      return html``;
    }
    return html`
      <mpc-button
        .onPressService=${this.callMoveItemDownService}
        role="tonal"
        size="small"
        elevation="1"
        class="action-button ${this.useExpressive ? `expressive` : ``}"
      >
        <ha-svg-icon
          .path=${this.Icons.ARROW_DOWN}
          class="svg-action-button ${this.useExpressive ? `expressive` : ``}"
        ></ha-svg-icon>
      </mpc-button>
    `;
  }
  private renderRemoveButton(): TemplateResult {
    if (this.hide.remove_button) {
      return html``;
    }
    return html`
      <mpc-button
        .onPressService=${this.callRemoveItemService}
        role="tonal"
        size="small"
        elevation="1"
        class="action-button ${this.useExpressive ? `expressive` : ``}"
      >
        <ha-svg-icon
          .path=${this.Icons.CLOSE}
          class="svg-action-button ${this.useExpressive ? `expressive` : ``}"
        ></ha-svg-icon>
      </mpc-button>
    `;
  }

  render(): TemplateResult {
    const playing = this.media_item?.playing ? `active` : ``;
    const expressive = this.useExpressive ? `expressive` : ``;
    const hideCovers = this.showAlbumCovers ? `` : `hide-covers`;
    return html`
      <ha-md-list-item
        style="${this.display ? "" : "display: none;"}"
        class="button ${playing} ${expressive} ${hideCovers}"
        @click=${this.callOnQueueItemSelectedService}
        type="button"
      >
        ${this.renderThumbnail()}
        <span slot="headline" id="headline">
          ${this.renderTitle()} ${this.renderArtist()}
        </span>
        ${this.renderActionButtons()}
      </ha-md-list-item>
      <div class="divider"></div>
    `;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
