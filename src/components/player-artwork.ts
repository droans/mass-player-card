import { consume } from "@lit/context";
import {
  CSSResultGroup,
  html,
  LitElement,
  TemplateResult
} from "lit";
import {
  activeMediaPlayerContext,
  controllerContext,
  IconsContext,
  musicPlayerConfigContext,
  queueContext
} from "../const/context.js";
import {
  customElement,
  query,
  queryAll,
  state
} from "lit/decorators.js";
import { PlayerConfig } from "../config/player.js";
import {
  ExtendedHassEntity,
  QueueItems
} from "../const/types.js";
import { MassCardController } from "../controller/controller.js";
import { Icons } from "../const/icons.js";
import { delay, jsonMatch, playerHasUpdated } from "../utils/util.js";
import styles from "../styles/player-artwork";
import { Thumbnail } from "../const/enums.js";
import WaCarouselItem from "@droans/webawesome/dist/components/carousel-item/carousel-item.js";
import WaCarousel from "@droans/webawesome/dist/components/carousel/carousel.js";
import "@droans/webawesome/dist/components/carousel/carousel.js"
import "@droans/webawesome/dist/components/carousel-item/carousel-item.js"
import { VibrationPattern } from "../const/common.js";

@customElement('mpc-artwork')
export class MassPlayerArtwork extends LitElement {
  @consume({ context: musicPlayerConfigContext, subscribe: true })
  @state()
  private playerConfig!: PlayerConfig;

  @consume({ context: controllerContext, subscribe: true })
  private controller!: MassCardController;

  @consume({ context: IconsContext, subscribe: true })
  private Icons!: Icons;

  @state() private _activePlayer!: ExtendedHassEntity;

  @state() private _queue!: QueueItems | null;

  @query('#carousel') private carouselElement?: WaCarousel;
  @query('#active-slide') private activeSlide!: WaCarouselItem
  @queryAll('wa-carousel-item') private carouselItems!: WaCarouselItem[]


  private _slidesInserted = false;

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
    void this.pushQueueArtwork();
  }
  public get queue() {
    return this._queue;
  }

  private getActiveIndex() {
    return this.queue?.findIndex(
      (item) => {
        return item?.playing
      }
    ) ?? 0;
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

  private onSwipe = (idx: number) => {
    if (!this?.queue?.length) {
      return;
    }
    this.queue[idx].playing = true;
    const item = this.queue[idx];
    const media_content_id = item.media_content_id;
    if (media_content_id == this.activePlayer.attributes.media_content_id) {
      return;
    }
    navigator.vibrate(VibrationPattern.Player.ACTION_SWIPE);
    void this.controller.Queue.playQueueItem(item.queue_item_id)
  }

  private onPointerDown = () => {
    window.addEventListener('pointerup', this.onPointerUp)
  }
  private onPointerUp = () => {
    window.removeEventListener('pointerup', this.onPointerUp);
    if (!this.carouselElement) {
      return;
    }
    const slides = [...this.carouselItems];
    const activeSlide = slides.findIndex(
      (item) => {
        return item.classList.contains('--in-view')
      }
    )
    const prevSlide = this.queue?.findIndex(
      (item) => {
        return item.playing;
      }
    )
    if (!activeSlide || !prevSlide) {
      return;
    }
    if (activeSlide != prevSlide) {
      this.onSwipe(activeSlide)
    }
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


  protected async pushQueueArtwork() {
    await delay(300);
    this._pushQueueArtwork();
    const activeIdx = this.getActiveIndex();
    this.carouselElement?.goToSlide(activeIdx, 'instant');
    await delay(25)
    this.carouselElement?.goToSlide(activeIdx, 'instant');
    // Run again a few times with delays just to be safe.
    await delay(75)
    this.carouselElement?.goToSlide(activeIdx, 'instant');
    await delay(150)
    this.carouselElement?.goToSlide(activeIdx, 'instant');
    await delay(300)
    this.carouselElement?.goToSlide(activeIdx, 'instant');
    await delay(750)
    this.carouselElement?.goToSlide(activeIdx, 'instant');
    await delay(1000)
    this.carouselElement?.goToSlide(activeIdx, 'instant');
    await delay(1000)
    this.carouselElement?.goToSlide(activeIdx, 'instant');
  }
  protected _pushQueueArtwork() {
    const queue = this.queue;
    const activeIdx = this.getActiveIndex();
    if (!queue || !activeIdx || !this.activeSlide || !this.carouselElement) {
      return;
    }
    queue.forEach(
      (item, idx) => {
        let url = item.media_image ?? '';
        if (!url.length) {
          url = item.local_image_encoded ?? ''
        }
        this.updateCarouselImg(idx, url)
      }
    )
  }
  protected updateCarouselImg(index: number, img_url: string) {
    if (!this.carouselElement) {
      return
    }
    const elem = this.carouselElement.querySelectorAll('img')[index];
    if (!elem) {
      return
    }    
    elem.src = img_url;
  }


  private insertEmptyCarouselItems() {
    const activeElem = this.activeSlide;
    if (!activeElem) {
      return;
    }
    this._insertElementAfter();
    this._insertElementAfter();
    this._insertElementAfter();
    this._insertElementAfter();
    this._insertElementAfter();
    this._insertElementBefore(activeElem);
    this._insertElementBefore(activeElem);
    this._insertElementBefore(activeElem);
    this._insertElementBefore(activeElem);
    this._insertElementBefore(activeElem);
    this._slidesInserted = true
  }

  private _insertElementBefore(before_elem: WaCarouselItem) {
    const elem = document.createElement('wa-carousel-item');
    const img = document.createElement('img');
    elem.appendChild(img)
    if (!this.carouselElement) {
      return;
    }
    this.carouselElement.goToSlide(this.carouselElement.activeSlide + 1);
    this.carouselElement.insertBefore(elem, before_elem)
  }
  private _insertElementAfter() {
    const elem = document.createElement('wa-carousel-item');
    const img = document.createElement('img');
    elem.appendChild(img)
    if (!this.carouselElement) {
      return;
    }
    this.carouselElement.appendChild(elem)
  }

  protected renderActiveItem(): TemplateResult {
    if (!this?.queue?.length) {
      return this.renderEmptyQueue();
    }
    const activeItem = this.queue.find(
      (item) => {
        return item?.playing
      }
    )
    if (!activeItem) {
      return this.renderEmptyQueue();
    }
    const size = this.playerConfig.layout.artwork_size;
    const attrs = this.activePlayer.attributes;
    const url = attrs.entity_picture_local;
    const fallback = attrs.entity_picture;
    const itemFallback = activeItem?.media_image?.length ? activeItem.media_image : activeItem.local_image_encoded;
    return html`
      <wa-carousel-item id="active-slide">
        <img
          class="artwork ${size}"
          id="img-playing"
          src="${url}"
          onerror="if (this.src == '${url}') { this.src = '${fallback}' } else if (this.src == '${fallback}') { this.src = '${itemFallback}' } else { this.src == '${Thumbnail.CLEFT}' }"
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
        @pointerdown=${this.onPointerDown}
      >
        ${this.renderActiveItem()}
      </wa-carousel>
    `
  }
  protected updated(): void {
    if (this.activeSlide && this.queue && !this._slidesInserted) {
      this.insertEmptyCarouselItems();
      void this.pushQueueArtwork()
      return;
    }
  }
  protected firstUpdated(): void {
    if (this.carouselElement) {
      this.controller.ActivePlayer.carouselElement = this.carouselElement;
    }
    
  }

  static get styles(): CSSResultGroup {
    return styles;
  }

}