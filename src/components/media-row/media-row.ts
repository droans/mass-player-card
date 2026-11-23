import { consume } from "@lit/context";
import {
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
  type CSSResultGroup,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import { QueueItemSelectedService, QueueService } from "../../const/actions";
import { VibrationPattern } from "../../const/common";
import {
  activeEntityConfigContext,
  configContext,
  EntityConfig,
  hassUIServicesContext,
  IconsContext,
  playerQueueConfigContext,
  playerQueueHiddenElementsConfigContext,
} from "../../const/context";
import { Thumbnail } from "../../const/enums";
import { QueueItem, UIServicesHass } from "../../const/types";

import styles from "./media-row-styles";

import { queueItem } from "mass-queue-types/packages/mass_queue/actions/get_queue_items";
import { Config } from "../../config/config";
import {
  PlayerQueueHiddenElementsConfig,
  QueueConfig,
} from "../../config/player-queue";
import { HTMLImageElementEvent } from "../../const/events";
import { Icons } from "../../const/icons";
import {
  asyncImageURLWithFallback,
  getThumbnail,
  getTrackFallbackImg,
} from "../../utils/thumbnails";
import {
  jsonMatch,
  queueItemhasUpdated,
  stopEventPropagation,
} from "../../utils/utility";

@customElement("mpc-queue-media-row")
export class MediaRow extends LitElement {
  @property({ attribute: "active-item", type: Boolean }) activeItem = false;

  @state() public defaultImageURL?: string;
  @state() public fallbackImageURL?: string;
  @state() private actionButtonsExpanded = false;
  @state() private reconnected = false;

  @query(".thumbnail") thumbnailElement!: HTMLImageElement;
  @query("#action-buttons-div") actionsButtonDiv?: HTMLElement;
  @query("#action-buttons-headline") actionsButtonHeadline?: HTMLElement;

  @consume({ context: IconsContext }) public Icons!: Icons;
  @consume({ context: playerQueueHiddenElementsConfigContext, subscribe: true })
  private hide!: PlayerQueueHiddenElementsConfig;
  @consume({ context: configContext, subscribe: true })
  protected cardConfig!: Config;

  public moveQueueItemDownService!: QueueService;
  public moveQueueItemNextService!: QueueService;
  public moveQueueItemUpService!: QueueService;
  public removeService!: QueueService;
  public selectedService!: QueueItemSelectedService;
  public showAlbumCovers = true;

  private _media_item!: QueueItem;
  private _config!: QueueConfig;
  private _entityConfig!: EntityConfig;
  private imagesExhausted = false;
  private imgElemErrorCount = 0;
  private maxImgElemErrorCount = 5;
  private actionButtonsDisplayed = false;
  @consume({ context: hassUIServicesContext, subscribe: false })
  private hassUIServices?: UIServicesHass;

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

  @property({ attribute: false })
  public set media_item(mediaItem: QueueItem | undefined) {
    if (!mediaItem) {
      return;
    }
    this._media_item = mediaItem;
    void this.getTrackImage();
  }
  public get media_item() {
    return this._media_item;
  }

  protected async getTrackImage() {
    if (!this.hassUIServices || !this.media_item) {
      return;
    }
    const track = this.media_item;
    const mediaImg =
      track.media_image.length > 0 ? track.media_image : Thumbnail.CLEFT;
    const locImg = track.local_image_encoded?.length
      ? track.local_image_encoded
      : mediaImg;
    const imgs = await asyncImageURLWithFallback(
      this.hassUIServices,
      locImg,
      mediaImg,
      this.cardConfig.download_local,
      this.cardConfig.proxy_all_artwork,
    );
    this.defaultImageURL = imgs.image_url;
    this.fallbackImageURL = imgs.fallback_url;
  }

  private actionButtonsHidden() {
    return (
      !this.media_item?.show_action_buttons ||
      this.hide.action_buttons ||
      (this.hide.move_down_button &&
        this.hide.move_next_button &&
        this.hide.move_up_button &&
        this.hide.remove_button)
    );
  }

  /* eslint-disable @typescript-eslint/no-unnecessary-condition */
  private callMoveItemUpService = (event_: Event) => {
    if (!this.media_item) {
      return;
    }
    if (navigator.vibrate) {
      navigator.vibrate(VibrationPattern.Queue.ACTION_MOVE_UP);
    }
    event_.stopPropagation();
    this.moveQueueItemUpService(this.media_item.queue_item_id);
    this.changeActionButtonVisibility(false);
  };
  private callMoveItemDownService = (event_: Event) => {
    if (!this.media_item) {
      return;
    }
    if (navigator.vibrate) {
      navigator.vibrate(VibrationPattern.Queue.ACTION_MOVE_DOWN);
    }
    event_.stopPropagation();
    this.moveQueueItemDownService(this.media_item.queue_item_id);
    this.changeActionButtonVisibility(false);
  };
  private callMoveItemNextService = (event_: Event) => {
    if (!this.media_item) {
      return;
    }
    if (navigator.vibrate) {
      navigator.vibrate(VibrationPattern.Queue.ACTION_MOVE_NEXT);
    }
    event_.stopPropagation();
    this.moveQueueItemNextService(this.media_item.queue_item_id);
    this.changeActionButtonVisibility(false);
  };
  private callRemoveItemService = (event_: Event) => {
    if (!this.media_item) {
      return;
    }
    event_.stopPropagation();
    if (navigator.vibrate) {
      navigator.vibrate(VibrationPattern.Queue.ACTION_REMOVE);
    }
    this.removeService(this.media_item.queue_item_id);
    this.changeActionButtonVisibility(false);
  };
  private callOnQueueItemSelectedService = () => {
    if (!this.media_item) {
      return;
    }
    this.selectedService(this.media_item.queue_item_id);
    this.changeActionButtonVisibility(false);
  };
  /* eslint-enable @typescript-eslint/no-unnecessary-condition */
  private changeActionButtonVisibility(visibility: boolean): void {
    const addClass = visibility ? `open` : `closed`;
    const removeClass = visibility ? `closed` : `open`;
    this.actionsButtonDiv?.classList.remove(removeClass);
    this.actionsButtonDiv?.classList.add(addClass);
    this.actionsButtonHeadline?.classList.remove(removeClass);
    this.actionsButtonHeadline?.classList.add(addClass);
    this.actionButtonsExpanded = visibility;
    this.actionButtonsDisplayed = true;
  }
  private onChevronSelected = () => {
    this.changeActionButtonVisibility(!this.actionButtonsExpanded);
    this.actionButtonsDisplayed = true;
  };

  protected shouldUpdate(_changedProperties: PropertyValues<this>): boolean {
    if (_changedProperties.has("media_item")) {
      const oldItem = _changedProperties.get("media_item") as queueItem;
      return queueItemhasUpdated(oldItem, this.media_item);
    }
    return _changedProperties.size > 0;
  }

  private _renderThumbnailFallback = (event_: Event) => {
    this.imgElemErrorCount++;
    if (!this.hassUIServices) {
      return;
    }
    const currentSource = this.thumbnailElement.src;
    const thumb = getTrackFallbackImg(
      this.hassUIServices,
      currentSource,
      this.defaultImageURL ?? ``,
      this.fallbackImageURL,
      Thumbnail.CLEFT,
    );
    if (
      thumb == currentSource ||
      this.imgElemErrorCount >= this.maxImgElemErrorCount
    ) {
      this.imagesExhausted = true;
      this.thumbnailElement.src =
        getThumbnail(this.hassUIServices, Thumbnail.CLEFT) ?? "";
      return;
    }
    this.thumbnailElement.src = thumb;
    if (this.imagesExhausted) {
      (event_ as HTMLImageElementEvent).target.removeEventListener(
        "error",
        this._renderThumbnailFallback,
      );
    }
  };
  private renderThumbnail(): TemplateResult {
    if (!this.media_item) {
      return html``;
    }
    /* eslint-disable
          @typescript-eslint/no-unnecessary-condition
    */
    const img = this.defaultImageURL?.length
      ? this.defaultImageURL
      : this.fallbackImageURL?.length
        ? this.fallbackImageURL
        : getThumbnail(this.hassUIServices, Thumbnail.CLEFT);
    const played =
      !this.media_item.show_action_buttons && !this.media_item?.playing;
    /* eslint-enable
          @typescript-eslint/no-unnecessary-condition
    */
    if (this.imagesExhausted) {
      const fallbackImage = getThumbnail(this.hassUIServices, Thumbnail.CLEFT);
      return html`
        <img
          class="thumbnail ${played ? "disabled" : ""}"
          slot="start"
          src="${fallbackImage}"
          loading="lazy"
        />
      `;
    }
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
  private renderTitle(): TemplateResult {
    const played =
      !this.media_item?.show_action_buttons && !this.media_item?.playing;
    return html`
      <div
        class="title track
        ${played ? "disabled" : ""}"
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
        ${played ? "disabled" : ""}"
      >
        ${this.media_item?.media_artist}
      </span>
    `;
  }
  private renderChevron(): TemplateResult {
    if (this.actionButtonsHidden() || !this.media_item?.show_action_buttons) {
      return html``;
    }
    const icon = this.actionButtonsExpanded
      ? this.Icons.CARET_UP
      : this.Icons.CARET_DOWN;
    return html`
      <div
        class="chevron-div"
        slot="end"
        @click=${(event_: Event) => {
          event_.stopPropagation();
        }}
      >
        <mpc-button
          .onPressService=${this.onChevronSelected}
          role="plain"
          size="medium"
          elevation="-1"
          class="chevron-button"
        >
          <ha-svg-icon class="chevron-icon" .path=${icon}></ha-svg-icon>
        </mpc-button>
      </div>
    `;
  }
  private renderActionButtons(): TemplateResult {
    if (
      this.actionButtonsHidden() ||
      (!this.actionButtonsDisplayed && !this.actionButtonsExpanded)
    ) {
      return html``;
    }
    return html`
      <div id="action-buttons-div" class="open" @click=${stopEventPropagation}>
        <ha-list-item-base class="action-buttons-row" id="action-buttons-row">
          <div slot="headline" id="action-buttons-headline" class="open">
            ${this.renderMoveNextButton()} ${this.renderMoveUpButton()}
            ${this.renderMoveDownButton()} ${this.renderRemoveButton()}
          </div>
        </ha-list-item-base>
      </div>
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
        class="action-button"
      >
        <ha-svg-icon
          slot="start"
          .path=${this.Icons.ARROW_PLAY_NEXT}
          class="svg-action-button"
        ></ha-svg-icon>
        Next
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
        class="action-button"
      >
        <ha-svg-icon
          slot="start"
          .path=${this.Icons.ARROW_UP}
          class="svg-action-button"
        ></ha-svg-icon>
        Up
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
        class="action-button"
      >
        <ha-svg-icon
          slot="start"
          .path=${this.Icons.ARROW_DOWN}
          class="svg-action-button"
        ></ha-svg-icon>
        Down
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
        class="action-button"
      >
        <ha-svg-icon
          slot="start"
          .path=${this.Icons.CLOSE}
          class="svg-action-button"
        ></ha-svg-icon>
        Remove
      </mpc-button>
    `;
  }

  render(): TemplateResult {
    const playing = this.media_item?.playing ? `active` : ``;
    const hideCovers = this.showAlbumCovers ? `` : `hide-covers`;
    return html`
      <ha-list-item-button
        class="button ${playing} ${hideCovers}"
        @pointerup=${this.callOnQueueItemSelectedService}
        type="button"
      >
        ${this.renderThumbnail()}
        <span slot="headline" id="headline">
          ${this.renderTitle()} ${this.renderArtist()}
        </span>
        ${this.renderChevron()}
      </ha-list-item-button>
      ${this.renderActionButtons()}
    `;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }

  protected updated(): void {
    if (this.reconnected && this.activeItem) {
      setTimeout(() => {
        this.scrollIntoView({ block: "start", behavior: "auto" });
      }, 25);
      this.reconnected = false;
    }
  }
  disconnectedCallback(): void {
    if (this.activeItem) {
      this.reconnected = false;
    }
  }

  connectedCallback(): void {
    if (this.activeItem) {
      this.reconnected = true;
    }
    super.connectedCallback();
  }
}
