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
import { isActive, jsonMatch, playerHasUpdated } from "../utils/util";
import { ExtendedHass, ExtendedHassEntity, QueueItem, QueueItems } from "../const/types";
import { SlCarousel } from "@shoelace-style/shoelace";
import { VibrationPattern } from "../const/common";
import { getThumbnail } from "../utils/thumbnails";
import { Icons } from "../const/icons";
import styles from "../styles/player-artwork";
import { Thumbnail } from "../const/enums";
import { keyed } from "lit/directives/keyed.js";

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

  @query('#carousel') private carouselElement?: SlCarousel;

  private currentIdx?: number;

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
    if (queue) {
      queue = this._filterQueue(queue)
    }
    if (jsonMatch(this._queue, queue)) {
      return;
    }
    this._queue = queue;
    if (queue?.length) {
      this.updateActiveSlide();
    } 
  }
  public get queue() {
    return this._queue;
  }
  private _filterQueue(queue: QueueItems) {
    const playIdx = queue.findIndex(
      (item) => {
        return item?.playing
      }
    );
    if (!playIdx) {
      return queue.slice(0,10)
    }
    const startIdx = Math.max(0, playIdx - 5);
    const endIdx = Math.min(queue.length - 1, playIdx + 5);
    return queue.slice(startIdx, endIdx)
  }

  private setActiveSlide(idx: number | undefined = this.currentIdx) {
    if (!idx || !this?.queue?.length || !this?.carouselElement ) {
      return;
    }
    this?.carouselElement?.goToSlide(idx, 'instant');
    const item = this.queue[idx];
    const img = item.media_image ?? item.local_image_encoded;
    const detail = {
      type: 'current',
      image: img
    }
    const ev = new CustomEvent('artwork-updated', { detail: detail });
    this.controller.host.dispatchEvent(ev);
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
  }

  private onSwipe = (idx: number) => {
    if (!this?.queue?.length) {
      return;
    }
    this.queue[idx].playing = true;
    if (this.currentIdx) {
      this.queue[this.currentIdx].playing = false;
    }
    const item = this.queue[idx];
    const media_content_id = item.media_content_id;
    if (media_content_id == this.activePlayer.attributes.media_content_id) {
      return;
    }
    navigator.vibrate(VibrationPattern.Player.ACTION_SWIPE);
    void this.controller.Queue.playQueueItem(item.queue_item_id)
  }

  protected renderCarouselItem(item: QueueItem, fallback: string = Thumbnail.CLEFT) {
    if (Object.values(Thumbnail).includes(fallback as Thumbnail)) {
      fallback = getThumbnail(this.hass, fallback as Thumbnail)
    }
    const size = this.playerConfig.layout.artwork_size;
    const _img = item?.media_image?.length ? item.media_image : item.local_image_encoded;
    const attrs = this.activePlayer.attributes;
    const img = item?.playing ? attrs.entity_picture_local ?? attrs.entity_picture ?? _img : _img;
    const playing = item.playing ? `playing` : false;
    return keyed(
      item.media_content_id,
      html`
        <wa-carousel-item 
        >
          <img
            class="artwork ${size}"
            src="${img}"
            ?data-playing=${playing}
            onerror="this.src='${fallback}';"
          > 
        </wa-carousel-item>
      `
    )
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
  protected onPointerDown = () => {
    window.addEventListener("pointerup", this.onPointerUp)
  }
  protected onPointerUp = () => {
    window.removeEventListener("pointerup", this.onPointerUp)
    if (this.carouselElement?.activeSlide && this.carouselElement?.activeSlide != this.currentIdx) {
      this.onSwipe(this.carouselElement?.activeSlide)
    }
  }
  protected renderCarouselItems() {
    if (!this?.queue?.length) {
      return this.renderEmptyQueue();
    }
    return this.queue.map (
      (item) => {
        if (item.playing) {
          const attrs = this.activePlayer.attributes;
          const fallback = attrs.entity_picture ?? attrs.entity_picture_local;
          return this.renderCarouselItem(item, fallback);
        }
        return this.renderCarouselItem(item);
      }
    )
  }
  protected render(): TemplateResult {
    const size = this.playerConfig.layout.artwork_size;
    return html`
      <wa-carousel
        id="carousel"
        class="${size}"
        mouse-dragging
        @pointerdown=${this.onPointerDown}
        style="display: none;"
      >
        ${this.renderCarouselItems()}
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
    setTimeout(
      () => {
        this.updateActiveSlide()
      },
      2000
    )
  }
  protected updated(_changedProperties: PropertyValues): void {
    if (this.carouselElement) {
      this.carouselElement.style.display = "unset";
    }
    const wrongIdx = this.currentIdx != this.carouselElement?.activeSlide;
    const queueChanged = _changedProperties.has('_queue');
    const _isactive = isActive(this.hass, this.activePlayer, this.controller.ActivePlayer.activeEntityConfig);
    const hasQueue = this.queue?.length;
    if ( _isactive 
      && hasQueue
      && (
         wrongIdx
          || queueChanged
      )
    ) {
      this.updateActiveSlide();
    }
  }
  
  static get styles(): CSSResultGroup {
    return styles;
  }
}