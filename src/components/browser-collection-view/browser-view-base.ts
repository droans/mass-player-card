import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import {
  ExtendedHass,
  ExtendedHassEntity,
  ListItems,
  mediaCardAlbumData,
  mediaCardArtistData,
  mediaCardCollectionType,
  mediaCardPlaylistData,
  mediaCardPodcastData,
} from "../../const/types";
import {
  HIDDEN_BUTTON_VALUE,
  MediaBrowserConfig,
  MediaBrowserHiddenElementsConfig,
} from "../../config/media-browser";
import { Icons } from "../../const/icons";
import { property, query, queryAll, state } from "lit/decorators.js";
import { EntityConfig } from "../../config/config";
import { CardEnqueueService } from "../../const/actions";
import {
  activeEntityConfigContext,
  activeMediaPlayerContext,
  hassContext,
  IconsContext,
  mediaBrowserConfigContext,
  mediaBrowserHiddenElementsConfigContext,
  useExpressiveContext,
  useVibrantContext,
} from "../../const/context";
import { consume } from "@lit/context";
import BrowserActions from "../../actions/browser-actions";
import { Track, Tracks } from "mass-queue-types/packages/mass_queue/utils";
import { HTMLImageElementEvent, MenuButtonEventData } from "../../const/events";
import { getEnqueueButtons } from "../../const/media-browser";
import { EnqueueOptions, Thumbnail } from "../../const/enums";
import { getThumbnail } from "../../utils/thumbnails";
import { cache } from "lit/directives/cache.js";
import "../marquee-text/marquee-text";
import { PodcastEpisode } from "mass-queue-types/packages/mass_queue/types/media-items";
import { delay } from "../../utils/utility";
import "./browser-collection-track-row";

export class BrowserViewBase extends LitElement {
  protected _collectionData?: mediaCardCollectionType | undefined;
  protected _hass?: ExtendedHass;
  protected _activePlayer?: ExtendedHassEntity;
  protected _browserConfig?: MediaBrowserConfig;
  protected _activeEntityConf?: EntityConfig;
  protected _Icons?: Icons;

  @query("#title") protected titleElement?: HTMLElement;
  @query("#enqueue-button") protected enqueueElement?: HTMLElement;
  @query("#enqueue") protected enqueueDiv?: HTMLElement;
  @query("#collection-image") protected imageDivElement?: HTMLElement;
  @query("#tracks") protected tracksElement?: HTMLElement;
  @query("#header") protected headerElement?: HTMLElement;
  protected enqueueControlElement!: HTMLElement;
  protected enqueueIconElement!: HTMLElement;
  protected titleAnimation!: Animation;
  protected enqueueAnimation!: Animation;
  protected enqueueControlAnimation!: Animation;
  protected enqueueIconAnimation!: Animation;
  protected imageDivAnimation!: Animation;
  protected headerAnimation!: Animation;
  protected animationsAdded = false;

  // Limit rendered rows to reduce memory usage
  // Current rendered index
  @state() protected currentIdx = 40;
  // Additional rows to render
  protected indexIncrease = 40;
  // Offset before rendering new rows
  protected listenOffset = -10;
  // Observer for element
  protected observer?: IntersectionObserver;
  // Has observer been added
  protected observerAdded = false;
  // Listen on elements
  @queryAll("mpc-track-row") trackElements!: HTMLElement[];

  // Set which enqueue elements are hidden
  @consume({
    context: mediaBrowserHiddenElementsConfigContext,
    subscribe: true,
  })
  protected hide!: MediaBrowserHiddenElementsConfig;
  protected _enqueue_buttons!: ListItems;

  public onEnqueueAction!: CardEnqueueService;

  // Used to get hidden elements, etc.
  @consume({ context: mediaBrowserConfigContext, subscribe: true })
  protected set browserConfig(config: MediaBrowserConfig | undefined) {
    this._browserConfig = config;
  }
  protected get browserConfig() {
    return this._browserConfig;
  }
  @consume({ context: activeEntityConfigContext, subscribe: true })
  protected set activeEntityConf(config: EntityConfig | undefined) {
    this._activeEntityConf = config;
  }
  protected get activeEntityConf() {
    return this._activeEntityConf;
  }

  // Make sure we're using the right icons
  @consume({ context: IconsContext, subscribe: true })
  protected set Icons(icons: Icons | undefined) {
    this._Icons = icons;
  }
  protected get Icons() {
    return this._Icons;
  }

  @state() public tracks?: Tracks | PodcastEpisode[];

  // Ensure style adjustments are handled
  @consume({ context: useExpressiveContext })
  protected useExpressive!: boolean;

  @consume({ context: useVibrantContext })
  protected useVibrant!: boolean;

  protected _browserActions?: BrowserActions;

  @consume({ context: hassContext, subscribe: true })
  public set hass(hass: ExtendedHass | undefined) {
    if (!this._hass) {
      this._hass = hass;
      void this.getTracks();
      return;
    }
    this._hass = hass;
  }
  public get hass() {
    return this._hass;
  }

  @consume({ context: activeMediaPlayerContext, subscribe: true })
  public set activePlayer(player: ExtendedHassEntity | undefined) {
    if (!this.activePlayer) {
      this._activePlayer = player;
      void this.getTracks();
      return;
    }
    this._activePlayer = player;
  }
  public get activePlayer() {
    return this._activePlayer;
  }

  @property({ attribute: false })
  public set collectionData(
    data:
      | mediaCardPlaylistData
      | mediaCardAlbumData
      | mediaCardArtistData
      | mediaCardPodcastData
      | undefined,
  ) {
    this._collectionData = data;
    void this.getTracks();
  }
  public get collectionData() {
    return this._collectionData;
  }

  protected _trackObserverCallback = (event_: IntersectionObserverEntry[]) => {
    const entry = event_[0];
    if (entry.isIntersecting) {
      this.observer?.disconnect();
      this.currentIdx = Math.min(
        this.currentIdx + this.indexIncrease,
        this.tracks?.length ?? 0,
      );
    }
  };

  protected async addObserver(retryDelay = 0) {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
    if (retryDelay > 6000) {
      throw new Error(`Exceeded max timeout creating observer`);
    }
    await delay(retryDelay);
    this._addObserver();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.observer) {
      retryDelay = retryDelay > 0 ? retryDelay * 2 : 50;
      await this.addObserver(retryDelay);
    }
  }
  protected _addObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }
    const listenIdx = this.currentIdx + this.listenOffset;
    const observer = new IntersectionObserver(this._trackObserverCallback);
    const element = this.trackElements[listenIdx];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!element) {
      return;
    }
    observer.observe(element);

    this.observer = observer;
    this.observerAdded = true;
  }

  protected setHiddenElements() {
    if (!this.activeEntityConf || !this.browserConfig) {
      return;
    }
    this.updateEnqueueButtons();
  }
  protected async getTracks() {
    // Implemented by components
  }

  public get browserActions() {
    this._browserActions ??= new BrowserActions(this.hass as ExtendedHass);
    return this._browserActions;
  }

  protected addScrollAnimation(transforms: Keyframe, element: HTMLElement) {
    const shrunkHdrHeight = (this.headerElement?.offsetHeight ?? 0) * (1 / 3);
    const scrollHeight = this.tracksElement?.scrollHeight ?? 1;
    const duration = shrunkHdrHeight / scrollHeight;
    const keyframes = [
      {
        ...transforms,
        offset: duration,
      },
      {
        ...transforms,
        offset: 1,
      },
    ];
    /* eslint-disable
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-assignment,
      @typescript-eslint/no-unsafe-call,
      @typescript-eslint/no-unsafe-member-access,
    */
    const timeline = new (window as any).ScrollTimeline({
      source: this.tracksElement,
    });
    const animation = element.animate(keyframes, {
      timeline,
      direction: "normal",
      iterations: 1,
    });
    /* eslint-enable
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-assignment,
      @typescript-eslint/no-unsafe-call,
      @typescript-eslint/no-unsafe-member-access,
    */
    animation.play();
    return animation;
  }
  protected animateHeaderElement() {
    const kf = {
      height: "var(--view-header-min-height)",
    };
    this.headerAnimation = this.addScrollAnimation(
      kf,
      this.headerElement as HTMLElement,
    );
  }
  protected animateHeaderTitle() {
    const kf = {
      fontSize: "2em",
      fontWeight: "500",
      top: "0em",
    };
    this.titleAnimation = this.addScrollAnimation(
      kf,
      this.titleElement as HTMLElement,
    );
  }
  protected animateHeaderEnqueue() {
    const iconElement = this.enqueueElement?.shadowRoot?.querySelector(
      ".svg-menu-expressive",
    );
    const selectElement = this.enqueueElement?.shadowRoot
      ?.querySelector("#menu-select-menu")
      ?.shadowRoot?.querySelector(".select-anchor");
    if (!iconElement || !selectElement) {
      return;
    }
    const iconKeyFrames = {
      height: "var(--header-collapsed-menu-icon-size)",
      width: "var(--header-collapsed-menu-icon-size)",
    };
    const selectKeyFrames = {
      height: "var(--header-collapsed-menu-control-size)",
    };
    this.enqueueIconElement = iconElement as HTMLElement;
    this.enqueueControlElement = selectElement as HTMLElement;
    this.enqueueIconAnimation = this.addScrollAnimation(
      iconKeyFrames,
      this.enqueueIconElement,
    );
    this.enqueueControlAnimation = this.addScrollAnimation(
      selectKeyFrames,
      this.enqueueControlElement,
    );
  }
  protected animateHeaderImage() {
    const imgDivKf = {
      height: "var(--collection-image-div-collapsed-height)",
    };
    this.imageDivAnimation = this.addScrollAnimation(
      imgDivKf,
      this.imageDivElement as HTMLElement,
    );
  }

  protected onEnqueue = (event_: MenuButtonEventData) => {
    if (!this.collectionData) {
      return;
    }
    event_.stopPropagation();
    const target = event_.detail;
    const value = target.option as EnqueueOptions;
    this.onEnqueueAction(this.collectionData, value);
  };

  protected updateEnqueueButtons() {
    if (!this.Icons) {
      return;
    }
    const default_buttons = getEnqueueButtons(
      this.Icons,
      this.hass as ExtendedHass,
    );
    const button_mapping = HIDDEN_BUTTON_VALUE;
    const options = default_buttons.filter((item) => {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const hide_value = button_mapping[item.option];
      //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return !this.hide[hide_value];
    });
    this._enqueue_buttons = options;
  }

  protected _renderImageFallback = (event_: HTMLImageElementEvent) => {
    event_.target.src = getThumbnail(this.hass, Thumbnail.PLAYLIST) as string;
  };
  protected renderImage(): TemplateResult {
    const img = this.collectionData?.media_image;
    return html`
      <img
        src="${img}"
        id="img-header"
        class="thumbnail"
        @error=${this._renderImageFallback}
        loading="lazy"
      />
    `;
  }
  protected renderTitle(): TemplateResult {
    return html`
      <mpc-marquee-text id="title">
        <div id="title-text">${this.collectionData?.media_title}</div>
      </mpc-marquee-text>
    `;
  }

  protected renderHeader(): TemplateResult {
    // Implemented by components
    return html``;
  }

  protected renderEnqueue(): TemplateResult {
    return html`
      <mass-menu-button
        id="enqueue-button"
        .iconPath=${this.Icons?.PLAY_CIRCLE}
        .items=${this._enqueue_buttons}
        @menu-item-selected=${this.onEnqueue}
        naturalMenuWidth
      ></mass-menu-button>
    `;
  }
  protected renderTrack(track: Track, divider: boolean) {
    return cache(html`
      <mpc-track-row
        .track=${track}
        ?divider=${divider}
        .collectionURI=${this.collectionData?.media_content_id}
        .enqueueButtons=${this._enqueue_buttons}
      ></mpc-track-row>
    `);
  }

  protected renderTracks() {
    if (!this.tracks?.length) {
      return html`
        <link
          href="https://cdn.jsdelivr.net/npm/beercss@3.12.11/dist/cdn/beer.min.css"
          rel="stylesheet"
        />
        <div class="shape loading-indicator extra"></div>
      `;
    }
    const trackCt = this.tracks.length;
    const tracks = this.tracks as Tracks;
    return tracks.map((track, idx) => {
      if (idx >= this.currentIdx) {
        return html``;
      }
      const div = idx < trackCt - 1;

      return this.renderTrack(track, div);
    });
  }
  protected render(): TemplateResult {
    const expressive_class = this.useExpressive ? `expressive` : ``;
    const vibrant_class = this.useVibrant ? `vibrant` : ``;
    return html`
      <div id="container" class="${expressive_class} ${vibrant_class}">
        <div id="header">
          ${this.renderHeader()}
        </div>
          <div id="tracks-container">
            <div id="tracks">
              <div id="tracks-padding"></div>
              ${this.renderTracks()}
            </div>
          </div>
        </div>
      </div>
    `;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }

  protected updated(_changedProperties: PropertyValues): void {
    if (!this.animationsAdded) {
      void this.testAnimation();
    }
    if (
      _changedProperties.has("currentIdx") ||
      (_changedProperties.has("tracks") && !this.observerAdded)
    ) {
      void this.addObserver();
    }
  }
  disconnectedCallback(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    super.disconnectedCallback();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async testAnimation(_delayMs = 50) {
    // Implemented by components
  }
}
