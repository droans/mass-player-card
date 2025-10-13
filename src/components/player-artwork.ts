import { consume } from "@lit/context";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";

import '@shoelace-style/shoelace/dist/components/carousel/carousel.js';
import '@shoelace-style/shoelace/dist/components/carousel-item/carousel-item.js';


import styles from '../styles/player-artwork';
import { getThumbnail } from "../utils/thumbnails.js";
import {
  activePlayerDataContext,
  controllerContext,
  currentQueueItemContext,
  ExtendedHass,
  hassExt,
  musicPlayerConfigContext,
  nextQueueItemContext,
  previousQueueItemContext,
  queueContext,
} from "../const/context.js";
import { Thumbnail } from "../const/common.js";
import { query, state } from "lit/decorators.js";
import { QueueItem, QueueItems } from "../const/player-queue.js";
import { PlayerData, SLSwipeEvent } from "../const/music-player.js";
import SlCarousel from "@shoelace-style/shoelace/dist/components/carousel/carousel.js";
import { PlayerConfig } from "../config/player.js";
import { MassCardController } from "../controller/controller.js";

class MassPlayerArtwork extends LitElement {
  @consume({ context: hassExt, subscribe: true })
  private hass!: ExtendedHass;
  @consume({ context: controllerContext, subscribe: true})
  private controller!: MassCardController;
  @consume({ context: musicPlayerConfigContext, subscribe: true})
  @state()
  private playerConfig!: PlayerConfig;
  @query('#carousel') private carouselElement!: SlCarousel;

  @query('#carousel-img-prior') private previousCarouselImage!: HTMLImageElement;
  @query('#carousel-img-cur') private currentCarouselImage!: HTMLImageElement;
  @query('#carousel-img-next') private nextCarouselImage!: HTMLImageElement;

  @state() public _playerData!: PlayerData;
  @state() private _queue!: QueueItems;
  @state() public _queueItems!: QueueItems;

  private _previousQueueItem!: QueueItem;
  private _currentQueueItem!: QueueItem;
  private _nextQueueItem!: QueueItem;
  private _previousItemImage!: string;
  private _currentItemImage!: string;
  private _nextItemImage!: string;
  private _curSlideIdx = 0;
  private _shouldSetIndex = true;

  @consume({ context: activePlayerDataContext, subscribe: true })
  public set playerData(playerData: PlayerData) {
    const cur_data = this.playerData;
    if (cur_data?.track_artwork != playerData?.track_artwork) {
      this._playerData = playerData
      this._shouldSetIndex = true;
    }
  }
  public get playerData() {
    return this._playerData;
  }

  @consume({ context: previousQueueItemContext, subscribe: true})
  public set previousQueueItem(item: QueueItem | null) {
    if (!item) {
      return;
    }
    this.previousItemImage = item.media_image;
    this._previousQueueItem = item
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
  public set currentQueueItem(item: QueueItem | null) {
    if (!item) {
      return;
    }
    this.currentItemImage = item.media_image;
    this._currentQueueItem = item
  }
  public get currentQueueItem() {
    return this._nextQueueItem;
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
  public set nextQueueItem(item: QueueItem | null) {
    if (!item) {
      return;
    }
    this.nextItemImage = item.media_image;
    this._nextQueueItem = item
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

  @consume({ context: queueContext, subscribe: true})
  public set queue(queue: QueueItems | null) {
    if (!queue) {
      return;
    }
    if (!this._queue) {
      this._queue = queue;
    }
    const cur_js = JSON.stringify(this._queue);
    const new_js = JSON.stringify(queue);
    if (cur_js != new_js) {
      this._queue = queue;
    }
  }
  public get queue() {
    return this._queue
  }
  private onCarouselSwipe = (ev: SLSwipeEvent) => {
    const slide_idx = ev.detail.index;
    if (slide_idx == 0) {
      if (this.previousItemImage) {
        
        this.currentItemImage = this.previousItemImage;
        this.carouselElement.goToSlide(1, 'instant');
        void this.controller.Actions.actionPlayPrevious();
      }
    } else if (slide_idx == 2) {
      if (this.nextItemImage) {
        this.currentItemImage = this.nextItemImage;
        this.carouselElement.goToSlide(1, 'instant');
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
  protected renderCarouselItem(img: string | undefined, artwork_id: string) {
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
    const img = this.previousItemImage;
    return this.renderCarouselItem(img, `carousel-img-prior`);
  }
  protected renderCarouselItems() {
    if (!this.queue || !this.controller.ActivePlayer.isActive()) {
      return this.renderInactive();
    }
    return html`
      ${this.renderCarouselItem(this.previousItemImage, `carousel-img-prior`)}
      ${this.renderCarouselItem(this.currentItemImage, `carousel-img-cur`)}
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
  protected firstUpdated(): void {
    this.carouselElement.goToSlide(1, 'instant');
  }
  static get styles() {
    return styles;
  }
}
customElements.define('mass-artwork', MassPlayerArtwork);
