import { consume } from "@lit/context";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";

import '@shoelace-style/shoelace/dist/components/carousel/carousel.js';
import '@shoelace-style/shoelace/dist/components/carousel-item/carousel-item.js';


import styles from '../styles/player-artwork';
import { getThumbnail } from "../utils/thumbnails.js";
import {
  activeMediaPlayer,
  activePlayerDataContext,
  controllerContext,
  currentQueueItemContext,
  ExtendedHass,
  hassExt,
  IconsContext,
  musicPlayerConfigContext,
  nextQueueItemContext,
  previousQueueItemContext,
} from "../const/context.js";
import { ExtendedHassEntity, Thumbnail } from "../const/common.js";
import { query, state } from "lit/decorators.js";
import { QueueItem } from "../const/player-queue.js";
import { PlayerData, SLSwipeEvent, SWIPE_MIN_DELAY } from "../const/music-player.js";
import SlCarousel from "@shoelace-style/shoelace/dist/components/carousel/carousel.js";
import { PlayerConfig } from "../config/player.js";
import { MassCardController } from "../controller/controller.js";
import { Icons } from "../const/icons.js";
import { jsonMatch } from "../utils/util.js";

class MassPlayerArtwork extends LitElement {
  @consume({ context: hassExt, subscribe: true })
  private hass!: ExtendedHass;
  @consume({ context: controllerContext, subscribe: true})
  private controller!: MassCardController;
  @consume({ context: musicPlayerConfigContext, subscribe: true})
  @state()
  private playerConfig!: PlayerConfig;
  @consume({ context: activeMediaPlayer, subscribe: true})
  private activePlayer!: ExtendedHassEntity;

  @consume({ context: IconsContext})
  private Icons!: Icons;

  @query('#carousel') private carouselElement!: SlCarousel;

  @query('#carousel-img-prior') private previousCarouselImage!: HTMLImageElement;
  @query('#carousel-img-cur') private currentCarouselImage!: HTMLImageElement;
  @query('#carousel-img-next') private nextCarouselImage!: HTMLImageElement;

  @state() public _playerData!: PlayerData;

  private _previousQueueItem!: QueueItem | undefined;
  private _currentQueueItem!: QueueItem | undefined;
  private _nextQueueItem!: QueueItem  | undefined;
  private _previousItemImage!: string;
  private _currentItemImage!: string;
  private _nextItemImage!: string;
  private _lastSwipedTS = 0;
  private _disconnected = false;
  private _playerLoadedTS = 0;

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

  @consume({ context: previousQueueItemContext, subscribe: true})
  public set previousQueueItem(item: QueueItem | null | undefined) {
    if (jsonMatch(this.previousQueueItem, item)) {
      return;
    }
    this.previousItemImage = item?.media_image ?? ``;
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

  @consume({ context: currentQueueItemContext, subscribe: true})
  public set currentQueueItem(item: QueueItem | null | undefined) {
    if (jsonMatch(this.currentQueueItem, item)) {
      return;
    }
    this.currentItemImage = item?.media_image ?? ``;
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
  }
  public get currentItemImage() {
    return this._currentItemImage;
  }
  
  @consume({ context: nextQueueItemContext, subscribe: true})
  public set nextQueueItem(item: QueueItem | null | undefined) {
    if (jsonMatch(this.nextQueueItem, item)) {
      return;
    }
    this.nextItemImage = item?.media_image ?? ``;
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
    const slide_idx = ev.detail.index;
    const last_ts = this._lastSwipedTS;
    const cur_ts = ev.timeStamp;
    const cur_time = new Date().getTime();
    this._lastSwipedTS = cur_ts;
    const delay_since_swipe = cur_ts - last_ts;
    const delay_since_load = cur_time - this._playerLoadedTS;
    if (delay_since_swipe <= SWIPE_MIN_DELAY || delay_since_load <= SWIPE_MIN_DELAY) {
      return;
    }
    if (slide_idx == 0) {
      if (this.previousItemImage) {
        this.currentItemImage = this.previousItemImage;
        void this.controller.Actions.actionPlayPrevious();
      }
    } else if (slide_idx == 2) {
      if (this.nextItemImage) {
        this.currentItemImage = this.nextItemImage;
        void this.controller.Actions.actionPlayNext()
      };
    }
  }

  protected renderItemArtwork(img: string | undefined, artwork_id: string) {
    
    const fallback = getThumbnail(this.hass, Thumbnail.CLEFT);
    const size = this.playerConfig.layout.artwork_size;
    if (!img) {
      return html`
        <img
          class="artwork artwork-${size}"
          src="${fallback}"
        >
      `
    }
    return html`
      <img
        id="${artwork_id}"
        class="artwork artwork-${size}"
        src="${img}"
        onerror="this.src='${fallback}';"
      >
    `
  }
  protected renderAsleep() {
    const expressive = this.controller.config.expressive ? `-expressive` : ``;
    return html`
    <ha-svg-icon
      .path=${this.Icons.ASLEEP}
      class="asleep asleep${expressive}"
    >

    </ha-svg-icon>
    `
  }
  protected renderCarouselItem(img: string | undefined, artwork_id: string) {
    img = img ?? Thumbnail.CLEFT;
    return  html`
      <sl-carousel-item>
        ${this.renderItemArtwork(img, artwork_id)}
      </sl-carousel-item>
    `
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
        >
      </sl-carousel-item>
    `
  }
  protected renderPriorItem() {
    const img = this.previousItemImage ?? Thumbnail.CLEFT;
    return this.renderCarouselItem(img, `carousel-img-prior`);
  }
  protected renderCarouselItems() {
    if (!this.controller.ActivePlayer.isActive()) {
      return this.renderAsleep();
    }
    return html`
      ${this.renderCarouselItem(this.previousItemImage, `carousel-img-prior`)}
      ${this.renderCarouselItem(this.activePlayer.attributes.entity_picture_local ?? this.currentItemImage, `carousel-img-cur`)}
      ${this.renderCarouselItem(this.nextItemImage, `carousel-img-next`)}
    `
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
    `
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {  
    return _changedProperties.size > 0;
  }
  protected updated(): void {
    this.carouselElement.goToSlide(1, 'instant');
  }

  disconnectedCallback(): void {
    this._disconnected = true;
    super.disconnectedCallback();
  }
  connectedCallback(): void {
    if (this._disconnected) {
      this.carouselElement.goToSlide(1, 'instant');
    }
    this._disconnected = false;
    super.connectedCallback();
  }
  static get styles() {
    return styles;
  }
}
customElements.define('mass-artwork', MassPlayerArtwork);
