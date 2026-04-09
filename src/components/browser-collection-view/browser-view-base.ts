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
import { property, query, state } from "lit/decorators.js";
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
// import { delay } from "../../utils/utility";
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
  @query("#collection-image") protected imageDivElement?: HTMLElement;
  @query("lit-virtualizer") protected virtElement?: HTMLElement;
  @query("#virtualizer") protected virtDiv?: HTMLElement;
  @query("#tracks") protected tracksElement?: HTMLElement;
  @query("#tracks-padding") protected padElement?: HTMLElement;
  @query("#header") protected headerElement?: HTMLElement;
  protected enqueueControlElement!: HTMLElement;
  protected enqueueIconElement!: HTMLElement;
  protected animationsAdded = false;

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
      this.getTracks();
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
      this.getTracks();
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
    this.getTracks();
  }
  public get collectionData() {
    return this._collectionData;
  }

  protected setHiddenElements() {
    if (!this.activeEntityConf || !this.browserConfig) {
      return;
    }
    this.updateEnqueueButtons();
  }
  protected getTracks() {
    // Implemented by components
  }

  public get browserActions() {
    this._browserActions ??= new BrowserActions(this.hass as ExtendedHass);
    return this._browserActions;
  }

  protected addScrollAnimation(transforms: Keyframe, element: HTMLElement) {
    const shrunkHdrHeight = (this.headerElement?.offsetHeight ?? 0) * (1 / 3);
    const scrollHeight = this.virtElement?.scrollHeight ?? 1;
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
      source: this.virtDiv,
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
    this.addScrollAnimation(kf, this.headerElement as HTMLElement);
  }
  protected animateTracksElement() {
    const tracksKf = {
      top: "8em",
    };
    const paddingKf = {
      height: "4em",
    };
    this.addScrollAnimation(tracksKf, this.virtDiv as HTMLElement);
    this.addScrollAnimation(tracksKf, this.tracksElement as HTMLElement);
    this.addScrollAnimation(paddingKf, this.padElement as HTMLElement);
  }
  protected animateHeaderTitle() {
    const kf = {
      fontSize: "2em",
      fontWeight: "500",
      top: "0em",
    };
    this.addScrollAnimation(kf, this.titleElement as HTMLElement);
  }
  protected animateHeaderEnqueue() {
    const iconElement =
      this.enqueueElement?.shadowRoot?.querySelector(".svg-menu");
    const selectElement = this.enqueueElement?.shadowRoot
      ?.querySelector("#menu-select-menu")
      ?.shadowRoot?.querySelector(".select-anchor");
    if (iconElement) {
      this.enqueueIconElement = iconElement as HTMLElement;
      const iconKeyFrames = {
        height: "var(--header-collapsed-menu-icon-size)",
        width: "var(--header-collapsed-menu-icon-size)",
      };
      this.addScrollAnimation(iconKeyFrames, this.enqueueIconElement);
    }
    if (selectElement) {
      this.enqueueControlElement = selectElement as HTMLElement;

      const selectKeyFrames = {
        height: "var(--header-collapsed-menu-control-size)",
      };
      this.addScrollAnimation(selectKeyFrames, this.enqueueControlElement);
    }
  }
  protected animateHeaderImage() {
    const imgDivKf = {
      height: "var(--collection-image-div-collapsed-height)",
    };
    this.addScrollAnimation(imgDivKf, this.imageDivElement as HTMLElement);
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
    const expressiveClass = this.useExpressive ? `expressive` : ``;
    return html`
      <mpc-marquee-text id="title" class="${expressiveClass}">
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
      <mpc-menu-button
        id="enqueue-button"
        .iconPath=${this.Icons?.PLAY_CIRCLE}
        .items=${this._enqueue_buttons}
        @menu-item-selected=${this.onEnqueue}
        naturalMenuWidth
        elevation="1"
        scheme="plain"
      ></mpc-menu-button>
    `;
  }
  protected renderTrack(track: Track, divider: boolean) {
    return cache(html`
      <mpc-collection-track-row
        .track=${track}
        ?divider=${divider}
        .collectionURI=${this.collectionData?.media_content_id}
        .enqueueButtons=${this._enqueue_buttons}
      ></mpc-collection-track-row>
    `);
  }

  protected renderTracks(): TemplateResult {
    if (!this.tracks?.length) {
      return html`
        <link
          href="https://cdn.jsdelivr.net/npm/beercss@3.12.11/dist/cdn/beer.min.css"
          rel="stylesheet"
        />
        <div id="browser-view" style="height: 100%;">
          <div class="shape loading-indicator extra"></div>
        </div>
      `;
    }
    return html`
      <div id="virtualizer">
        <div id="tracks-padding"></div>
        <lit-virtualizer
          id="browser-view"
          .items=${this.tracks}
          .renderItem=${(item: Track) => {
            return this.renderTrack(item, true);
          }}
        ></lit-virtualizer>
      </div>
    `;
  }
  protected render(): TemplateResult {
    const expressiveClass = this.useExpressive ? `expressive` : ``;
    const vibrantClass = this.useVibrant ? `vibrant` : ``;
    const scrollClass = this.tracks?.length ? `` : `no-scroll`;
    return html`
      <div id="container" class="${expressiveClass} ${vibrantClass}">
        <div id="header">
          ${this.renderHeader()}
        </div>
          <div id="tracks-container">
            <div id="tracks" class="${scrollClass}">
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

  protected updated(): void {
    if (!this.animationsAdded) {
      void this.testAnimation();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async testAnimation(_delayMs = 50) {
    // Implemented by components
  }
}
