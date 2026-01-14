import { consume } from "@lit/context";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import {
  activeMediaPlayerContext,
  configContext,
  controllerContext,
  IconsContext,
  musicPlayerConfigContext,
  queueContext,
} from "../../const/context";
import { customElement, query, queryAll, state } from "lit/decorators.js";
import { PlayerConfig } from "../../config/player";
import { ExtendedHassEntity, QueueItems } from "../../const/types";
import { MassCardController } from "../../controller/controller";
import { Icons } from "../../const/icons";
import { delay, jsonMatch, playerHasUpdated } from "../../utils/utility";
import styles from "./player-artwork-styles";
import { Thumbnail } from "../../const/enums";
import type WaCarouselItem from "@droans/webawesome/dist/components/carousel-item/carousel-item";
import type WaCarousel from "@droans/webawesome/dist/components/carousel/carousel";
import "@droans/webawesome/dist/components/carousel/carousel";
import "@droans/webawesome/dist/components/carousel-item/carousel-item";
import { VibrationPattern } from "../../const/common";
import { Config } from "../../config/config";

@customElement("mpc-artwork")
export class MassPlayerArtwork extends LitElement {
  @consume({ context: musicPlayerConfigContext, subscribe: true })
  @state()
  private playerConfig!: PlayerConfig;

  private _observer?: MutationObserver;

  @consume({ context: controllerContext, subscribe: true })
  private controller!: MassCardController;

  @consume({ context: IconsContext, subscribe: true })
  private Icons!: Icons;

  @consume({ context: configContext, subscribe: true })
  private Config!: Config;

  private _interval!: number | undefined;
  private _intervalSet = false;
  private _intervalMs = 250;

  @state() private _activePlayer!: ExtendedHassEntity;

  @state() private _queue: QueueItems | null = null;

  @query("#carousel") private carouselElement?: WaCarousel;
  @query("#active-slide") private activeSlide?: WaCarouselItem;
  @queryAll("wa-carousel-item") private carouselItems?: WaCarouselItem[];

  private _slidesInserted = false;
  private _pushingArtwork = false;
  private _touchActive = false;

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

  @consume({ context: queueContext, subscribe: true })
  public set queue(queue: QueueItems | null) {
    if (queue) {
      queue = this._filterQueue(queue);
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
    return (
      this.queue?.findIndex((item) => {
        return item.playing;
      }) ?? 0
    );
  }

  private _filterQueue(queue: QueueItems) {
    if (queue.length <= 10) {
      return queue;
    }
    const playIdx = queue.findIndex((item) => {
      return item.playing;
    });
    if (!(playIdx == 0) && !playIdx) {
      return queue.slice(0, 10);
    }
    const startIdx = Math.max(0, playIdx - 5);
    const endIdx = Math.min(queue.length, playIdx + 6);
    return queue.slice(startIdx, endIdx);
  }

  private _observerCB = () => {
    if (this._touchActive) {
      return;
    }
    const idx = this.getActiveIndex();
    this.delayedGoToSlide(idx);
  };

  private onSwipe = (idx: number) => {
    if (!this.queue?.length) {
      return;
    }
    this.queue[idx].playing = true;
    const item = this.queue[idx];
    const media_content_id = item.media_content_id;
    if (media_content_id == this.activePlayer.attributes.media_content_id) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (navigator.vibrate) {
      navigator.vibrate(VibrationPattern.Player.ACTION_SWIPE);
    }
    if (!this.controller.Queue) {
      return;
    }
    void this.controller.Queue.playQueueItem(item.queue_item_id);
  };

  private onPointerDown = () => {
    this._touchActive = true;
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("touchend", this.onPointerUp, { passive: true });
  };
  private onPointerUp = () => {
    setTimeout(() => {
      this._touchActive = false;
    }, 150);
    window.removeEventListener("pointerup", this.onPointerUp);
    void this._pointerUpCheckSwipe();
  };

  private _pointerUpCheckSwipe = async () => {
    if (!this.queue) {
      return;
    }
    await delay(100);
    if (!this.carouselItems) {
      return;
    }
    const slides = [...this.carouselItems];
    const activeSlide = slides.findIndex((item) => {
      return item.classList.contains("--in-view");
    });
    const previousSlide = this.queue.findIndex((item) => {
      return item.playing;
    });
    if (
      (!activeSlide && activeSlide != 0) ||
      (!previousSlide && previousSlide != 0)
    ) {
      return;
    }
    if (activeSlide != previousSlide) {
      this.onSwipe(activeSlide);
    }
  };

  protected renderEmptyQueue(): TemplateResult {
    const expressive = this.controller.config?.expressive ? "expressive" : ``;
    return html`
      <wa-carousel-item>
        <ha-svg-icon
          .path=${this.Icons.ASLEEP}  
          id="asleep"
          class="${expressive}"
        >
      </wa-carousel-item>
    `;
  }

  private _intervalGoToSlide = () => {
    this.delayedGoToSlide(this.getActiveIndex());
  };
  private delayedGoToSlide(idx: number) {
    if (!this.carouselItems) {
      return;
    }
    const dataID = this.carouselItems[idx]?.dataset?.queueitem;
    if (!dataID) {
      return;
    }
    if (this._touchActive) {
      return;
    }
    const intersectingSlide = this.getIntersectingSlide();
    if (!intersectingSlide || !this.carouselElement) {
      return;
    }
    const intersectingDataId = intersectingSlide.dataset.queueitem;
    if (dataID == intersectingDataId) {
      return;
    }
    this.carouselElement.goToSlide(idx, "instant");
  }

  private getIntersectingSlide() {
    if (!this.carouselItems?.length) {
      return;
    }
    const firstSlide = this.carouselItems[0];
    const scrollContainer = firstSlide.assignedSlot?.parentElement;
    if (!scrollContainer) {
      return;
    }
    const scrollLeft = scrollContainer.scrollLeft;
    const scrollWidth = scrollContainer.offsetWidth;
    const scrollRight = scrollLeft + scrollWidth;
    const result = [...this.carouselItems].filter((item) => {
      const mid = item.offsetLeft + item.offsetWidth / 2;
      return mid >= scrollLeft && mid <= scrollRight;
    });
    if (result.length > 0) {
      return result[0];
    }
    return firstSlide;
  }

  protected async pushQueueArtwork() {
    if (this._pushingArtwork) {
      return;
    }
    this._pushingArtwork = true;
    await delay(300);
    this._pushQueueArtwork();
    const activeIdx = this.getActiveIndex();
    this.delayedGoToSlide(activeIdx);
    this._pushingArtwork = false;
  }
  protected _pushQueueArtwork() {
    const queue = this.queue;
    const activeIdx = this.getActiveIndex();
    if (!queue || (!activeIdx && activeIdx != 0) || !this.activeSlide) {
      return;
    }
    this.createAndDestroyCarouselItemsAsNeeded();
    queue.forEach((item, idx) => {
      let url = item.media_image;
      if (url.length === 0) {
        url = item.local_image_encoded ?? "";
      }
      if (item.playing) {
        const attributes = this.activePlayer.attributes;
        const ent_img_local = attributes.entity_picture_local ?? "";
        const fallbacks: string[] = [];
        const ent_img = attributes.entity_picture;
        if (ent_img) {
          fallbacks.push(ent_img);
        }
        fallbacks.push(url);
        this.updateCarouselImg(
          idx,
          ent_img_local,
          item.queue_item_id,
          fallbacks,
          true,
        );
      } else {
        this.updateCarouselImg(idx, url, item.queue_item_id);
      }
    });
  }
  protected updateCarouselImg(
    index: number,
    img_url: string,
    queue_item_id: string,
    fallbacks: string[] = [],
    playing = false,
  ) {
    const element = this.carouselElement?.querySelectorAll("img")[index];
    if (!element) {
      return;
    }
    element.src = img_url;
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    element.onerror = () => {
      const urls = [img_url, ...fallbacks, Thumbnail.CLEFT];
      const currentIdx = urls.findIndex((item) => {
        return element.src == item;
      });
      const url = urls[currentIdx + 1] ?? Thumbnail.CLEFT;
      element.src = url;
    };
    element.parentElement?.setAttribute("data-queueitem", queue_item_id);
    if (playing) {
      element.setAttribute("id", "img-playing");
      element.parentElement?.setAttribute("id", "active-slide");
    } else if (element.id) {
      element.id = "";
      element.removeAttribute("id");
      element.parentElement?.removeAttribute("id");
    }
  }

  private createAndDestroyCarouselItemsAsNeeded() {
    const slides = this.carouselItems;
    if (!slides || !this.queue) {
      return;
    }
    const artworkIdx = [...slides].findIndex((item) => {
      return item.id == "active-slide";
    });
    const slidesLength = slides.length;
    const actSlidesBefore = artworkIdx;
    const actSlidesAfter = slidesLength - artworkIdx - 1;

    const queueIdx = this.queue.findIndex((item) => {
      return item.playing;
    });
    const queueLength = this.queue.length;
    const requestSlidesBefore = queueIdx;
    const requestSlidesAfter = queueLength - queueIdx - 1;

    if (
      actSlidesBefore == requestSlidesBefore &&
      actSlidesAfter == requestSlidesAfter
    ) {
      return;
    }

    if (actSlidesBefore < requestSlidesBefore) {
      const insertBeforeCt = requestSlidesBefore - actSlidesBefore;
      this.insertSlides(insertBeforeCt, "start");
    } else if (actSlidesBefore > requestSlidesBefore) {
      const removeBeforeCt = actSlidesBefore - requestSlidesBefore;
      this.removeSlides(removeBeforeCt, "start");
    }

    if (actSlidesAfter < requestSlidesAfter) {
      const insertAfterCt = requestSlidesAfter - actSlidesAfter;
      this.insertSlides(insertAfterCt, "end");
    } else if (actSlidesAfter > requestSlidesAfter) {
      const removeAfterct = actSlidesAfter - requestSlidesAfter;
      this.removeSlides(removeAfterct, "end");
    }
  }

  private removeSlides(ct: number, direction: "start" | "end") {
    if (!this.carouselItems) {
      return;
    }
    const elements = [...this.carouselItems];
    const remove =
      direction == "start"
        ? elements.slice(0, ct)
        : elements.slice(elements.length - ct);
    remove.forEach((item) => {
      item.remove();
    });
  }

  private insertSlides(ct: number, direction: "start" | "end") {
    if (!this.carouselItems || !this.carouselElement) {
      return;
    }
    const rng = [...Array(ct).keys()];

    const insertBefore = this.carouselItems[0];
    rng.forEach(() => {
      const element = document.createElement("wa-carousel-item");
      const div = document.createElement("div");
      div.className = "slot";
      const img = document.createElement("img");
      img.loading = "lazy";
      div.append(img);
      element.append(div);
      if (direction == "start") {
        (this.carouselElement as WaCarousel).insertBefore(
          element,
          insertBefore,
        );
      } else {
        (this.carouselElement as WaCarousel).append(element);
      }
    });
  }

  protected renderActiveItem(): TemplateResult {
    if (!this.queue?.length) {
      return this.renderEmptyQueue();
    }
    const activeItem = this.queue.find((item) => {
      return item.playing;
    });
    if (!activeItem) {
      return this.renderEmptyQueue();
    }
    const size = this.playerConfig.layout.artwork_size;
    const attributes = this.activePlayer.attributes;
    const url = attributes.entity_picture_local;
    return html`
      <wa-carousel-item
        id="active-slide"
        data-queueitem="${activeItem.queue_item_id}"
      >
        <div class="slot">
          <img
            class="artwork ${size}"
            id="img-playing"
            src="${url}"
            loading="lazy"
          />
        </div>
      </wa-carousel-item>
    `;
  }

  protected render(): TemplateResult {
    const size = `${this.playerConfig.layout.artwork_size} ${this.Config.panel ? ` panel` : ``}`;
    return html`
      <wa-carousel
        id="carousel"
        class="${size}"
        mouse-dragging
        @pointerdown=${this.onPointerDown}
      >
        ${this.renderActiveItem()}
      </wa-carousel>
    `;
  }
  protected updated(): void {
    if (this.activeSlide && this.queue && !this._slidesInserted) {
      this._slidesInserted = true;
      void this.pushQueueArtwork();
    }
    if (!this._observer && this.carouselItems?.length && this.carouselElement) {
      this._observer = new MutationObserver(this._observerCB);
      this._observer.observe(this.carouselElement, {
        subtree: true,
        childList: true,
        attributes: true,
      });
    }
    if (
      !this._intervalSet &&
      this.carouselItems?.length &&
      this.carouselElement
    ) {
      this._intervalSet = true;
      this._interval = window.setInterval(() => {
        this._intervalGoToSlide();
      }, this._intervalMs);
    }
  }
  protected firstUpdated(): void {
    if (this.controller.ActivePlayer) {
      this.controller.ActivePlayer.carouselElement = this.carouselElement;
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("touchend", this.onPointerUp);
    this._observer?.disconnect();

    if (this._interval) {
      try {
        clearInterval(this._interval);
      } finally {
        this._interval = undefined;
        this._intervalSet = false;
      }
    }
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
