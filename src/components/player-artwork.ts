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
import "@shoelace-style/shoelace/dist/components/carousel/carousel.js";
import "@shoelace-style/shoelace/dist/components/carousel-item/carousel-item.js";

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
import { jsonMatch, playerHasUpdated } from "../utils/util";
import { ExtendedHass, ExtendedHassEntity, QueueItem, QueueItems } from "../const/types";
import { SlCarousel } from "@shoelace-style/shoelace";
import { SLSwipeEvent } from "../const/events";
import { VibrationPattern } from "../const/common";
import { getThumbnail } from "../utils/thumbnails";
import { Icons } from "../const/icons";
import styles from "../styles/player-artwork";
import { Thumbnail } from "../const/enums";

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
  private _timeout?: number;

  @consume({ context: activeMediaPlayerContext, subscribe: true })
  public set activePlayer(player: ExtendedHassEntity) {
    if (!playerHasUpdated(this._activePlayer, player)) {
      return;
    }
    this.updateActiveSlide();
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
    this.updateActiveSlide();
  }
  public get queue() {
    return this._queue;
  }

  private setActiveSlide(idx: number | undefined = this.currentIdx) {
    if (!idx || !this?.queue?.length || !this?.carouselElement || this._timeout) {
      return;
    }
    this.carouselElement.removeEventListener('sl-slide-change', this.onSwipe);
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
        this?.carouselElement?.addEventListener('sl-slide-change', this.onSwipe);
        this._timeout = undefined;
      },
      250
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
    if (idx >= 0) {
      this.currentIdx = idx;
      this.setActiveSlide(this.currentIdx)
    }
  }

  private onSwipe = (ev: SLSwipeEvent) => {
    ev.stopPropagation();
    if (!this?.queue?.length) {
      return;
    }
    navigator.vibrate(VibrationPattern.Player.ACTION_SWIPE);
    const idx = ev.detail.index;
    if (Math.abs(idx - (this?.currentIdx ?? 0)) > 1)  {
      this.updateActiveSlide()
      return;
    }
    const item = this.queue[idx];
    const media_content_id = item.media_content_id;
    if (media_content_id == this.activePlayer.attributes.media_content_id) {
      return;
    }
    void this.controller.Queue.playQueueItem(item.queue_item_id);
  }

  protected renderCarouselItem(item: QueueItem, fallback: string = Thumbnail.CLEFT): TemplateResult {
    if (Object.values(Thumbnail).includes(fallback as Thumbnail)) {
      fallback = getThumbnail(this.hass, fallback as Thumbnail)
    }
    const size = this.playerConfig.layout.artwork_size;
    const img = item?.media_image?.length ? item.media_image : item.local_image_encoded;
    return html`
      <sl-carousel-item 
      >
        <img
          class="artwork ${size}"
          src="${img}"
          onerror="console.log('Rendering fallback for ${item.media_title} as image is unavailable'); this.src='${fallback}';"
        > 
      </sl-carousel-item>
    `
  }
  protected renderEmptyQueue(): TemplateResult {
    const expressive = this.controller.config.expressive ? 'expressive' : ``
    return html`
      <sl-carousel-item>
        <ha-svg-icon
          .path=${this.Icons.ASLEEP}  
          id="asleep"
          class="${expressive}"
        >
      </sl-carousel-item>
    `
  }
  protected renderCarouselItems(): TemplateResult | TemplateResult[] {
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
      <sl-carousel
        id="carousel"
        class="${size}"
        mouse-dragging
      >
        ${this.renderCarouselItems()}
      </sl-carousel>
    `
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return super.shouldUpdate(_changedProperties)
  }
  connectedCallback(): void {
    if (this.hasUpdated){
      this.updateActiveSlide();
    }
    super.connectedCallback();
  }
  protected firstUpdated(): void {
    this.updateActiveSlide();
    this?.carouselElement?.addEventListener('sl-slide-change', this.onSwipe)
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}