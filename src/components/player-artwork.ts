import { consume } from "@lit/context";
import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult
} from "lit";

import {
  customElement,
  query,
  queryAll,
  state
} from "lit/decorators.js";
import "@droans/webawesome/dist/components/carousel/carousel.js"
import "@droans/webawesome/dist/components/carousel-item/carousel-item.js"

import {
  activeMediaPlayerContext,
  controllerContext,
  hassContext,
  IconsContext,
  musicPlayerConfigContext,
  queueContext
} from "../const/context";
import { PlayerConfig } from "../config/player";
import { MassCardController } from "../controller/controller";
import { isActive, jsonMatch, playerHasUpdated, tryPrefetchImageWithFallbacks } from "../utils/util";
import { ExtendedHass, ExtendedHassEntity, QueueItem, QueueItems } from "../const/types";
import { SlCarousel } from "@shoelace-style/shoelace";
import { VibrationPattern } from "../const/common";
import { getThumbnail } from "../utils/thumbnails";
import { Icons } from "../const/icons";
import styles from "../styles/player-artwork";
import { Thumbnail } from "../const/enums";
import { WaSlideChangeEvent } from "@droans/webawesome";

@customElement('mpc-artwork')
export class MassPlayerArtwork extends LitElement {
  @consume({ context: musicPlayerConfigContext, subscribe: true })
  @state()
  private playerConfig!: PlayerConfig;

  @consume({ context: hassContext, subscribe: true })
  private hass!: ExtendedHass;

  @consume({ context: controllerContext, subscribe: true })
  private controller!: MassCardController;

  @consume({ context: IconsContext, subscribe: true })
  private Icons!: Icons;

  @state() private _activePlayer!: ExtendedHassEntity;

  @state() private _queue!: QueueItems | null;
  @state() private imageTemplates: TemplateResult[] = [];

  @query('#carousel') private carouselElement?: SlCarousel;
  @queryAll('wa-carousel-item') private imageElements?: HTMLImageElement[];

  private currentIdx?: number;
  private _timeout?: number;

  @consume({ context: activeMediaPlayerContext, subscribe: true })
  public set activePlayer(player: ExtendedHassEntity) {
    if (!playerHasUpdated(this._activePlayer, player)) {
      return;
    }
    this._activePlayer = player;
  }
  public get activePlayer() {
    return this._activePlayer;
  }

  @consume({ context: queueContext, subscribe: true})
  public set queue(queue: QueueItems | null) {
    if (jsonMatch(this._queue, queue)) {
      return;
    }
    this._queue = queue;
    void this.createQueueImageElements();
    if (!this.carouselElement) {
      return;
    }
  }
  public get queue() {
    return this._queue;
  }
  private async createQueueImageElements() {
    const _elems: Promise<TemplateResult>[] = [];
    const attrs = this.activePlayer.attributes;
    const fallback = attrs.entity_picture ?? attrs.entity_picture_local;
    if (!this?.queue?.length) {
      this.imageTemplates = [this.renderEmptyQueue()]
      return;
    }
    for (const queueItem of this.queue) {
      if (queueItem?.playing) {
        _elems.push(this.renderCarouselItem(queueItem, [fallback]))
      } else {
        _elems.push(this.renderCarouselItem(queueItem))
      }
    }
    const elems = await Promise.all(_elems)
    this.imageTemplates = [...elems];
  }

  private setActiveSlide(idx: number | undefined = this.currentIdx) {
    if (!idx || !this?.queue?.length || !this?.carouselElement || this._timeout) {
      return;
    }
    this.carouselElement.removeEventListener('wa-slide-change', this.onSwipe);
    this?.carouselElement?.goToSlide(idx, 'instant');
    const item = this.queue[idx];
    const img = item.media_image ?? item.local_image_encoded;
    const detail = {
      type: 'current',
      image: img
    }
    const ev = new CustomEvent('artwork-updated', { detail: detail });
    this.controller.host.dispatchEvent(ev);
    this._timeout = setTimeout(
      () => {
        this?.carouselElement?.addEventListener('wa-slide-change', this.onSwipe);
        this._timeout = undefined;
      },
      100
    )
  }
  private updateActiveSlide() {
    if (!this.queue) {
      return;
    }
    const idx = this.queue.findIndex(
      (item) => {
        return item?.playing
      }
    )
    if (idx >= 0 && idx != this.carouselElement?.activeSlide) {
      this.currentIdx = idx;
      this.setActiveSlide(this.currentIdx)
    }
    setTimeout(
      () => {
        this.requestUpdate('activeSlide', 'fixed')
      },
      50
    )
  }

  private onSwipe = (ev: WaSlideChangeEvent) => {
    ev.stopPropagation();
    if (!this?.queue?.length) {
      return;
    }
    navigator.vibrate(VibrationPattern.Player.ACTION_SWIPE);
    const idx = ev.detail.index;
    const item = this.queue[idx];
    const media_content_id = item.media_content_id;
    if (media_content_id == this.activePlayer.attributes.media_content_id) {
      return;
    }
    void this.controller.Queue.playQueueItem(item.queue_item_id);
  }

  protected async renderCarouselItem(
    item: QueueItem,
    fallbacks: string[] = [],
  ): Promise<TemplateResult> {
    const size = this.playerConfig.layout.artwork_size;
    let default_img = item?.media_image?.length ? item.media_image : item.local_image_encoded as string;
    let fallback = [
      ...fallbacks,
      getThumbnail(this.hass, Thumbnail.CLEFT)
    ]
    if (item?.playing) {
      const attrs = this.activePlayer.attributes;
      default_img = attrs.entity_picture_local ?? default_img;
      fallback = [attrs.entity_picture ?? '', ...fallback]
    } 
    const img = await tryPrefetchImageWithFallbacks(
      default_img,
      fallback,
      this.hass
    )
    const playing = item?.playing ? `playing` : false;
    return html`
      <wa-carousel-item 
      >
        <img
          class="artwork ${size}"
          src="${img}"
          ?data-playing=${playing}
        > 
      </wa-carousel-item>
    `
  }
  protected renderEmptyQueue(): TemplateResult {
    const expressive = this.controller.config.expressive ? 'expressive' : ``
    return html`
      <wa-carousel-item>
        <ha-svg-icon
          .path=${this.Icons.ASLEEP}  
          id="asleep"
          class="${expressive}"
        >
      </wa-carousel-item>
    `
  }
  protected render(): TemplateResult {
    const size = this.playerConfig.layout.artwork_size;
    return html`
      <wa-carousel
        id="carousel"
        class="${size}"
        mouse-dragging
      >
        ${this.imageTemplates}
      </wa-carousel>
    `
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0
  }
  connectedCallback(): void {
    if (this.hasUpdated){
      this.updateActiveSlide();
    }
    super.connectedCallback();
  }
  protected firstUpdated(): void {
    if (this.carouselElement) {
      this.controller.ActivePlayer.carouselElement = this.carouselElement;
    } 
    this?.carouselElement?.addEventListener('wa-slide-change', this.onSwipe)
  }
  protected updated(_changedProperties: PropertyValues): void {
    const wrongIdx = this.currentIdx != this.carouselElement?.activeSlide;
    const playerChanged = _changedProperties.has('_activePlayer');
    const queueChanged = _changedProperties.has('_queue');
    const _isactive = isActive(this.hass, this.activePlayer, this.controller.ActivePlayer.activeEntityConfig);
    const hasQueue = this.queue?.length;
    if ( _isactive 
      && hasQueue
      && (
         wrongIdx
          || playerChanged
          || queueChanged
      )
    ) {
      this.updateActiveSlide();
    }
    const queue = this.queue;
    if (!queue) {
      return;
    }
  }
  
  static get styles(): CSSResultGroup {
    return styles;
  }
}