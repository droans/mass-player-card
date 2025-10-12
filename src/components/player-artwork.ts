import { consume } from "@lit/context";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";

import '@shoelace-style/shoelace/dist/components/carousel/carousel.js';
import '@shoelace-style/shoelace/dist/components/carousel-item/carousel-item.js';


import styles from '../styles/player-artwork';
import { getThumbnail } from "../utils/thumbnails.js";
import {
  activePlayerDataContext,
  ExtendedHass,
  hassExt,
  musicPlayerConfigContext,
  queueContext,
  queueControllerContext
} from "../const/context.js";
import { Thumbnail } from "../const/common.js";
import { query, state } from "lit/decorators.js";
import { QueueItem, QueueItems } from "../const/player-queue.js";
import { PlayerData, SLSwipeEvent, SWIPE_QUEUE_ITEMS_AFTER, SWIPE_QUEUE_ITEMS_BEFORE } from "../const/music-player.js";
import SlCarousel from "@shoelace-style/shoelace/dist/components/carousel/carousel.js";
import { PlayerConfig } from "../config/player.js";
import { QueueController } from "../controller/queue.js";
import { keyed } from "lit/directives/keyed.js";

class MassPlayerArtwork extends LitElement {
  @consume({ context: hassExt, subscribe: true })
  private hass!: ExtendedHass;
  @consume({ context: queueControllerContext, subscribe: true})
  private queueController!: QueueController;
  @consume({ context: musicPlayerConfigContext, subscribe: true})
  @state()
  private playerConfig!: PlayerConfig;
  @query('#carousel') private carouselElement!: SlCarousel;


  @state() public _playerData!: PlayerData;
  private _queue!: QueueItems;
  @state() public _queueItems!: QueueItems;

  private _curSlideIdx = 1;
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

  @consume({ context: queueContext, subscribe: true})
  public set queue(queue: QueueItems | null) {
    if (!queue) {
      return;
    }
    if (!this._queue) {
      this._queue = queue;
      this.setQueueItems();
    }
    const cur_js = JSON.stringify(this._queue);
    const new_js = JSON.stringify(queue);
    if (cur_js != new_js) {
      this._queue = queue;
      this.setQueueItems();
    }
  }
  public get queue() {
    return this._queue
  }

  private setQueueItemsFromIndex(idx: number) {
    if (!this.queue) {
      return;
    }
    const queue = this.queue;
    const idx_before = idx - SWIPE_QUEUE_ITEMS_BEFORE;
    const idx_after = idx + SWIPE_QUEUE_ITEMS_AFTER + 1; 
    const queueItems = queue.slice(idx_before, idx_after);
    this._queueItems = queueItems;
  }

  private setQueueItems() {
    if (!this.queue) {
      return;
    }
    const cur_idx = this.queue?.findIndex( (i) => i.playing);
    this.setQueueItemsFromIndex(cur_idx);
  }

  private onCarouselSwipe = (ev: SLSwipeEvent) => {
    const slide_idx = ev.detail.index;
    const queue_item = this._queueItems[slide_idx];
    if (queue_item.playing) {
      return;
    }
    void this.queueController.playQueueItem(queue_item.queue_item_id);
    this._queueItems[slide_idx].playing = true;
    this._shouldSetIndex = false;
    this.setQueueItemsFromIndex(slide_idx);
  }

  protected renderItemArtwork(img: string | undefined) {
    
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
        class="artwork artwork-${size}"
        src="${img}"
        onerror="this.src='${fallback}';"
      >
    `
  }
  protected renderCarouselItem(img: string | undefined, content_id: string) {
    return keyed(
      `carousel-${content_id}`,
      html`
        <sl-carousel-item>
          ${this.renderItemArtwork(img)}
        </sl-carousel-item>
      `
    )
  }
  protected renderCarouselItems() {
    const items = this._queueItems;
    const result = items.map(
      (item, idx) => {
        const img = item.playing ? this.playerData?.track_artwork ?? item.media_image : item.media_image;
        if (item.playing) {
          this._curSlideIdx = idx;
        }
        return this.renderCarouselItem(img, item.media_content_id);
      }
    )
    return html`${result}`
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
    const carousel = this.carouselElement;
    const slide = carousel.activeSlide;
    if (slide != this._curSlideIdx && this._shouldSetIndex){
      carousel.goToSlide(this._curSlideIdx)
    };
  }
  static get styles() {
    return styles;
  }
}
customElements.define('mass-artwork', MassPlayerArtwork);
