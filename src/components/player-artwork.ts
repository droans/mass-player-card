import { consume } from "@lit/context";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";

import "@shoelace-style/shoelace/dist/components/carousel/carousel.js";
import "@shoelace-style/shoelace/dist/components/carousel-item/carousel-item.js";

import styles from "../styles/player-artwork";
import { getThumbnail } from "../utils/thumbnails.js";
import {
  activeMediaPlayerContext,
  activePlayerDataContext,
  controllerContext,
  ExtendedHass,
  hassContext,
  IconsContext,
  musicPlayerConfigContext,
  queueContext,
} from "../const/context.js";
import { ExtendedHassEntity, Thumbnail } from "../const/common.js";
import { query, state } from "lit/decorators.js";
import { QueueItem, QueueItems } from "../const/player-queue.js";
import {
  PlayerData,
  SLSwipeEvent,
  SWIPE_MIN_DELAY,
} from "../const/music-player.js";
import SlCarousel from "@shoelace-style/shoelace/dist/components/carousel/carousel.js";
import { PlayerConfig } from "../config/player.js";
import { MassCardController } from "../controller/controller.js";
import { Icons } from "../const/icons.js";
import { isActive, jsonMatch } from "../utils/util.js";

class MassPlayerArtwork extends LitElement {
  @consume({ context: hassContext, subscribe: true })
  private hass!: ExtendedHass;
  @consume({ context: controllerContext, subscribe: true })
  private controller!: MassCardController;
  @consume({ context: musicPlayerConfigContext, subscribe: true })
  @state()
  private playerConfig!: PlayerConfig;
  @consume({ context: activeMediaPlayerContext, subscribe: true })
  @state()
  public activePlayer!: ExtendedHassEntity;
  private _queue!: QueueItems;

  @consume({ context: IconsContext })
  private Icons!: Icons;

  @query("#carousel") private carouselElement!: SlCarousel;

  @query("#carousel-img-prior")
  private previousCarouselImage!: HTMLImageElement;
  @query("#carousel-img-cur") private currentCarouselImage!: HTMLImageElement;
  @query("#carousel-img-next") private nextCarouselImage!: HTMLImageElement;

  @state() public _playerData!: PlayerData;

  private _previousQueueItem!: QueueItem | undefined;
  private _currentQueueItem!: QueueItem | undefined;
  private _nextQueueItem!: QueueItem | undefined;
  private _previousItemImage!: string;
  private _currentItemImage!: string;
  private _nextItemImage!: string;
  private _lastSwipedTS = 0;
  private _disconnected = false;
  private _playerLoadedTS = 0;
  private _curIdx = 0;

  @consume({ context: activePlayerDataContext, subscribe: true })
  public set playerData(playerData: PlayerData) {
    const cur_data = this.playerData;
    if (cur_data?.track_artwork != playerData?.track_artwork) {
      this._playerData = playerData;
      this.currentItemImage = playerData.track_artwork;
    }
    this._playerLoadedTS = new Date().getTime();
  }
  public get playerData() {
    return this._playerData;
  }

  @consume({ context: queueContext, subscribe: true })
  public set queue(queue: QueueItems | null) {
    if (!queue?.length) {
      return;
    }
    this._queue = queue;
    const cur_idx = queue.findIndex((item) => item.playing);
    this._curIdx = cur_idx;
    this.currentQueueItem = queue[cur_idx];
    this.previousQueueItem = queue[cur_idx - 1];
    this.nextQueueItem = queue[cur_idx + 1];
  }
  public get queue() {
    return this._queue;
  }

  public set previousQueueItem(item: QueueItem | null | undefined) {
    if (jsonMatch(this.previousQueueItem, item)) {
      return;
    }
    this.previousItemImage = item?.media_image?.length ? item?.media_image : item?.local_image_encoded ?? ``;
    this._previousQueueItem = item ?? undefined;
  }
  public get previousQueueItem() {
    return this._previousQueueItem;
  }
  public set previousItemImage(img: string) {
    if (img == this._previousItemImage) {
      return;
    }
    this._previousItemImage = img;
    if (this.previousCarouselImage) {
      this.previousCarouselImage.src = img;
    }
  }
  public get previousItemImage() {
    return this._previousItemImage;
  }

  public set currentQueueItem(item: QueueItem | null | undefined) {
    if (jsonMatch(this.currentQueueItem, item)) {
      return;
    }
    this.currentItemImage = item?.media_image?.length ? item?.media_image : item?.local_image_encoded ?? ``;
    this._currentQueueItem = item ?? undefined;
  }
  public get currentQueueItem() {
    return this._currentQueueItem;
  }
  public set currentItemImage(img: string) {
    if (img == this._currentItemImage) {
      return;
    }
    this._currentItemImage = img;
    if (this.currentCarouselImage) {
      this.currentCarouselImage.src = img;
    }
    const detail = {
      type: "current",
      image: img,
    };
    const ev = new CustomEvent("artwork-updated", { detail: detail });
    this.controller.host.dispatchEvent(ev);
  }
  public get currentItemImage() {
    return this._currentItemImage;
  }

  public set nextQueueItem(item: QueueItem | null | undefined) {
    if (jsonMatch(this.nextQueueItem, item)) {
      return;
    }
    this.nextItemImage = item?.media_image?.length ? item?.media_image : item?.local_image_encoded ?? ``;
    this._nextQueueItem = item ?? undefined;
  }
  public get nextQueueItem() {
    return this._nextQueueItem;
  }
  public set nextItemImage(img: string) {
    if (img == this._nextItemImage) {
      return;
    }
    this._nextItemImage = img;
    if (this.nextCarouselImage) {
      this.nextCarouselImage.src = img;
    }
  }
  public get nextItemImage() {
    return this._nextItemImage;
  }

  private onCarouselSwipe = (ev: SLSwipeEvent) => {
    ev.stopPropagation();
    navigator.vibrate([75, 20, 75]);
    const slide_idx = ev.detail.index;
    const last_ts = this._lastSwipedTS;
    const cur_ts = ev.timeStamp;
    const cur_time = new Date().getTime();
    this._lastSwipedTS = cur_ts;
    const delay_since_swipe = cur_ts - last_ts;
    const delay_since_load = cur_time - this._playerLoadedTS;
    if (
      delay_since_swipe <= SWIPE_MIN_DELAY ||
      delay_since_load <= SWIPE_MIN_DELAY
    ) {
      return;
    }
    if (slide_idx == 0) {
      if (this.previousItemImage) {
        this.nextItemImage = this.currentItemImage;
        this.currentItemImage = this.previousItemImage;
        if (this.queue) {
          this.previousItemImage = this.queue[this._curIdx - 2].media_image;
        }
        void this.controller.Actions.actionPlayPrevious();
      }
    } else if (slide_idx == 2) {
      if (this.nextItemImage) {
        this.previousItemImage = this.currentItemImage;
        this.currentItemImage = this.nextItemImage;
        if (this.queue) {
          this.nextItemImage = this.queue[this._curIdx + 2].media_image;
        }

        void this.controller.Actions.actionPlayNext();
      }
    }
    this.goToCurrentSlide("instant");
  };
  private goToCurrentSlide(behavior: ScrollBehavior = "instant") {
    this.carouselElement.goToSlide(1, behavior);
  }

  protected renderItemArtwork(img: string | undefined, artwork_id: string) {
    const fallback = getThumbnail(this.hass, Thumbnail.CLEFT);
    const size = this.playerConfig.layout.artwork_size;
    if (!img) {
      return html` <img class="artwork artwork-${size}" src="${fallback}" /> `;
    }
    return html`
      <img
        id="${artwork_id}"
        class="artwork artwork-${size}"
        src="${img}"
        onerror="this.src='${fallback}';"
      />
    `;
  }
  protected renderAsleep() {
    const expressive = this.controller.config.expressive ? `-expressive` : ``;
    return html`
      <ha-svg-icon
        .path=${this.Icons.ASLEEP}
        class="asleep asleep${expressive}"
      >
      </ha-svg-icon>
    `;
  }
  protected renderCarouselItem(img: string | undefined, artwork_id: string) {
    img = img ?? Thumbnail.CLEFT;
    return html`
      <sl-carousel-item>
        ${this.renderItemArtwork(img, artwork_id)}
      </sl-carousel-item>
    `;
  }
  protected renderInactive() {
    const img = getThumbnail(this.hass, Thumbnail.CLEFT);
    const size = this.playerConfig.layout.artwork_size;
    return html`
      <sl-carousel-item>
        <img
          class="artwork artwork-${size}"
          src="${img}"
          onerror="this.src='${img}';"
        />
      </sl-carousel-item>
    `;
  }
  protected renderCarouselItems() {
    if (
      !isActive(
        this.hass,
        this.activePlayer,
        this.controller.ActivePlayer.activeEntityConfig,
      )
    ) {
      return this.renderAsleep();
    }
    return html`
      ${this.renderCarouselItem(this.previousItemImage, `carousel-img-prior`)}
      ${this.renderCarouselItem(
        this.activePlayer.attributes.entity_picture_local ??
          this.currentItemImage,
        `carousel-img-cur`,
      )}
      ${this.renderCarouselItem(this.nextItemImage, `carousel-img-next`)}
    `;
  }

  protected render(): TemplateResult {
    const size = this.playerConfig.layout.artwork_size;
    return html`
      <sl-carousel
        id="carousel"
        class="carousel-${size}"
        mouse-dragging
        @sl-slide-change=${this.onCarouselSwipe}
      >
        ${this.renderCarouselItems()}
      </sl-carousel>
    `;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
  protected updated(): void {
    this.goToCurrentSlide();
  }

  disconnectedCallback(): void {
    this._disconnected = true;
    super.disconnectedCallback();
  }
  connectedCallback(): void {
    if (this._disconnected) {
      this.goToCurrentSlide();
    }
    this._disconnected = false;
    super.connectedCallback();
  }
  static get styles() {
    return styles;
  }
}
customElements.define("mass-artwork", MassPlayerArtwork);
