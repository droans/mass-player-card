import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, query, queryAll, state } from "lit/decorators.js";
import styles from '../styles/browser-playlist-view';
import { consume } from "@lit/context";
import { activeEntityConfContext, activeMediaPlayerContext, EntityConfig, hassContext, IconsContext, mediaBrowserConfigContext, useExpressiveContext, useVibrantContext } from "../const/context.js";
import { ExtendedHass, ExtendedHassEntity, ListItems, mediaCardPlaylistData } from "../const/types.js";
import BrowserActions from "../actions/browser-actions.js";
import { DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG, HIDDEN_BUTTON_VALUE, MediaBrowserConfig, MediaBrowserHiddenElementsConfig } from "../config/media-browser.js";
import "../components/section-header";
import { Icons } from "../const/icons.js";
import { getThumbnail } from "../utils/thumbnails.js";
import { EnqueueOptions, Thumbnail } from "../const/enums.js";
import { getEnqueueButtons } from "../const/media-browser.js";
import { HTMLImageElementEvent, MenuButtonEventData } from "../const/events.js";
import { CardEnqueueService } from "../const/actions.js";
import './browser-playlist-track-row';
import { delay, formatDuration } from "../utils/util.js";
import { Track, Tracks } from "mass-queue-types/packages/mass_queue/utils.js";
import { getPlaylistServiceResponse } from "mass-queue-types/packages/mass_queue/actions/get_playlist.js";
import { cache } from "lit/directives/cache.js";

@customElement('mpc-browser-playlist-view')
export class MassBrowserPlaylistView extends LitElement {
  // See setter
  private _playlistData!: mediaCardPlaylistData;
  private _hass!: ExtendedHass;
  private _activePlayer!: ExtendedHassEntity;
  private _browserConfig!: MediaBrowserConfig;
  private _activeEntityConf!: EntityConfig;
  private _Icons!: Icons;

  // Header is animated on scroll - query elements for animation
  @query('#title') private titleElement!: HTMLElement
  @query('#playlist-info') private infoElement!: HTMLElement
  @query('#enqueue-button') private enqueueElement!: HTMLElement
  @query('#img-header') private imageElement!: HTMLElement
  @query('#playlist-image') private imageDivElement!: HTMLElement;
  @query('#tracks') private tracksElement!: HTMLElement;
  @query('#header') private headerElement!: HTMLElement;
  private enqueueControlElement!: HTMLElement;
  private enqueueIconElement!: HTMLElement;
  private titleAnimation!: Animation;
  private infoAnimation!: Animation;
  private enqueueControlAnimation!: Animation;
  private enqueueIconAnimation!: Animation;
  private imageAnimation!: Animation;
  private imageDivAnimation!: Animation;
  private headerAnimation!: Animation;
  private animationsAdded = false;

  // Duration of playlist
  private playlistDuration = 0;

  // Metadata for playlist
  @state() private playlistMetadata!: getPlaylistServiceResponse

  // Limit rendered rows to reduce memory usage
  // Current rendered index
  @state() private currentIdx = 40;
  // Additional rows to render
  private indexIncrease = 40;
  // Offset before rendering new rows
  private listenOffset = -10;
  // Observer for element
  private observer!: IntersectionObserver;
  // Has observer been added
  private observerAdded = false;
  // Listen on elements
  @queryAll('mpc-playlist-track-row') trackElements!: HTMLElement[];

  // Set which enqueue elements are hidden
  private hide: MediaBrowserHiddenElementsConfig = DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG;
  private _enqueue_buttons!: ListItems;

  public onEnqueueAction!: CardEnqueueService;

  // Used to get hidden elements, etc.
  @consume({ context: mediaBrowserConfigContext, subscribe: true })
  private set browserConfig(config: MediaBrowserConfig) {
    this._browserConfig = config;
  }
  private get browserConfig() {
    return this._browserConfig;
  }
  @consume({ context: activeEntityConfContext, subscribe: true })
  private set activeEntityConf(config: EntityConfig) {
    this._activeEntityConf = config;
  }
  private get activeEntityConf() {
    return this._activeEntityConf;
  }

  // Make sure we're using the right icons
  @consume({ context: IconsContext, subscribe: true })
  private set Icons(icons: Icons) {
    this._Icons = icons;
  }
  private get Icons() {
    return this._Icons;
  }
  
  // Data for all tracks - URI, image, title, album, artist, etc.
  // Set when playlistData changes.
  @state() public tracks!: Tracks;

  // Ensure style adjustments are handled
  @consume({context: useExpressiveContext})
  private useExpressive!: boolean;

  @consume({context: useVibrantContext})
  private useVibrant!: boolean;

  private _browserActions!: BrowserActions;

  @consume({ context: hassContext, subscribe: true })
  public set hass(hass: ExtendedHass) {
    if (!this._hass) {
      this._hass = hass;
      void this.getPlaylistTracks();
      return;
    }
    this._hass = hass;
  }
  public get hass() {
    return this._hass;
  }

  @consume({ context: activeMediaPlayerContext, subscribe: true })
  public set activePlayer(player: ExtendedHassEntity) {
    if (!this.activePlayer) {
      this._activePlayer = player;
      void this.getPlaylistTracks();
      return;
    }
    this._activePlayer = player;
  }
  public get activePlayer() {
    return this._activePlayer;
  }

  // Data about playlist - URI, name, thumbnail, etc.
  @property({ attribute: false })
  public set playlistData(data: mediaCardPlaylistData) {
    this._playlistData = data;
    void this.getPlaylistTracks();
  }
  public get playlistData() {
    return this._playlistData;
  }

  private _trackObserverCallback = (e: IntersectionObserverEntry[]) => {
    const entry = e[0];
    if (entry.isIntersecting) {
      this.observer.disconnect();
      this.currentIdx = Math.min(this.currentIdx + this.indexIncrease, this.tracks.length);
    }
  }

  private addObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (!this.trackElements?.length) {
      return;
    }
    const listenIdx = this.currentIdx + this.listenOffset;
    const observer = new IntersectionObserver(this._trackObserverCallback)
    const elem = this.trackElements[listenIdx];
    observer.observe(elem);
    
    this.observer = observer;
    this.observerAdded = true;
  }

  private setHiddenElements() {
    if (!this.activeEntityConf || !this.browserConfig) {
      return;
    }
    const entity = this.activeEntityConf.hide.media_browser;
    const card = this.browserConfig.hide;
    this.hide = {
      back_button: entity.back_button || card.back_button,
      search: entity.search || card.search,
      titles: entity.titles || card.titles,
      enqueue_menu: entity.enqueue_menu || card.enqueue_menu,
      add_to_queue_button:
        entity.add_to_queue_button || card.add_to_queue_button,
      play_next_button: entity.play_next_button || card.play_next_button,
      play_now_button: entity.play_now_button || card.play_now_button,
      play_next_clear_queue_button:
        entity.play_next_clear_queue_button ||
        card.play_next_clear_queue_button,
      play_now_clear_queue_button:
        entity.play_now_clear_queue_button || card.play_now_clear_queue_button,
      recents: entity.recents || card.recents,
    };
    this.updateEnqueueButtons();
  }

  // Ask HA to return the tracks in the playlist
  public async getPlaylistTracks() {
    if (
      !this.hass 
      || !this.playlistData
      || !this.activePlayer
    ) {
      return;
    }
    const tracks = await this.browserActions.actionGetPlaylistTracks(this.playlistData.playlist_uri, this.activePlayer.entity_id);
    this.tracks = tracks.response.tracks;
    let dur = 0;
    this.tracks.forEach(
      (track) => {
        dur += track.duration ?? 0;
      }
    )
    this.playlistDuration = dur;
    this.setHiddenElements()
    await this.getPlaylistMetadata();
  }
  public async getPlaylistMetadata() {
    if (
      !this.hass 
      || !this.playlistData
      || !this.activePlayer
    ) {
      return;
    }
    const metadata = await this.browserActions.actionGetPlaylistData(this.playlistData.playlist_uri, this.activePlayer.entity_id);
    this.playlistMetadata = metadata;
  }

  public get browserActions() {
    if (!this._browserActions) {
      this._browserActions = new BrowserActions(this.hass);
    }
    return this._browserActions;
  }
  

  private addScrollAnimation(transforms: Keyframe, elem: HTMLElement) {
    const shrunkHdrHeight = this.headerElement.offsetHeight / 2;
    const scrollHeight = this.tracksElement.scrollHeight;
    const duration = shrunkHdrHeight / scrollHeight;
    const keyframes = [
      {
        ...transforms,
        offset: duration,
      },
      {
        ...transforms,
        offset: 1,
      }
    ]
    /* eslint-disable
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-assignment,
      @typescript-eslint/no-unsafe-call,
      @typescript-eslint/no-unsafe-member-access,
    */
    const timeline = new (window as any).ScrollTimeline({
      source: this.tracksElement
    })
    const animation = elem.animate(
      keyframes,
      {
        timeline: timeline,
        direction: 'normal',
        iterations: 1,
      }
    )
    /* eslint-enable
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-assignment,
      @typescript-eslint/no-unsafe-call,
      @typescript-eslint/no-unsafe-member-access,
    */
    animation.play();
    return animation;
  }
  private animateHeaderElement() {
    const kf = {
      height: 'var(--playlist-header-min-height)'
    }
    this.headerAnimation = this.addScrollAnimation(kf, this.headerElement);

  }
  private animateHeaderTitle() {
    const kf = {
      fontSize: '2em',
      fontWeight: '500',
    }
    this.titleAnimation = this.addScrollAnimation(kf, this.titleElement)
  }
  private animateHeaderInfo() {
    const kf = {
      fontSize: '1em'
    }
    this.infoAnimation = this.addScrollAnimation(kf, this.infoElement)
  }
  private animateHeaderEnqueue() {
    const iconElem = this?.enqueueElement?.shadowRoot?.querySelector('.svg-menu-expressive');
    const selectElem = this?.enqueueElement?.shadowRoot?.querySelector('#menu-select-menu')?.shadowRoot?.querySelector('.select-anchor')
    if (!iconElem || !selectElem) {
      return;
    }
    const iconKeyFrames = {
      'height': 'var(--header-collapsed-menu-icon-size)',
      'width': 'var(--header-collapsed-menu-icon-size)',
    }
    const selectKeyFrames = {
      'height': 'var(--header-collapsed-menu-control-size)',
    }
    this.enqueueIconElement = iconElem as HTMLElement
    this.enqueueControlElement = selectElem as HTMLElement
    this.enqueueIconAnimation = this.addScrollAnimation(iconKeyFrames, this.enqueueIconElement);
    this.enqueueControlAnimation = this.addScrollAnimation(selectKeyFrames, this.enqueueControlElement);
  }
  private animateHeaderImage() {
    const kf = {
      transform: 'scale(0.5)  translateX(-2em) translateY(-4em)'
    }
    this.imageDivAnimation = this.addScrollAnimation(kf, this.imageDivElement)
  }
  private animateHeader() {
    this.animateHeaderElement();
    this.animateHeaderImage();
    this.animateHeaderTitle();
    this.animateHeaderInfo();
    this.animateHeaderEnqueue();
  }
  
  private onEnqueue = (ev: MenuButtonEventData) => {
    ev.stopPropagation();
    const target = ev.detail;
    const value = target.option as EnqueueOptions;
    if (!value) {
      return;
    }
    this.onEnqueueAction(this.playlistData, value);
  };

  private updateEnqueueButtons() {
    const default_buttons = getEnqueueButtons(this.Icons, this.hass);
    const button_mapping = HIDDEN_BUTTON_VALUE;
    const opts = default_buttons.filter((item) => {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const hide_val = button_mapping[item.option];
      //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return !this.hide[hide_val];
    });
    this._enqueue_buttons = opts;
  }

  protected renderHeader(): TemplateResult {
    return html`
      <div id="playlist-image">
        ${this.renderImage()}
        <div id="enqueue">
          ${this.renderEnqueue()}
        </div>
      </div>
      <div id="overview">
        ${this.renderOverview()}
      </div>
    `
  }
  private _renderImageFallback = (ev: HTMLImageElementEvent) => {
    ev.target.src = getThumbnail(this.hass, Thumbnail.PLAYLIST);
  }
  protected renderImage(): TemplateResult {
    const img = this.playlistData.playlist_image;
    return html`
        <img
          src="${img}"
          id="img-header"
          class="thumbnail"
          @error=${this._renderImageFallback}
          loading="lazy"
        >
    `
  }
  protected renderOverview(): TemplateResult {
    const trackStr = this.tracks?.length ? `${this.tracks.length.toString()} Tracks` : `Loading...`
    const owner = this?.playlistMetadata?.response?.owner ?? `Unknown`;
    return html`
      <div id="title">
        <ha-marquee-text>
          ${this.playlistData.playlist_title}
        </ha-marquee-text>
      </div>
      <div id="playlist-info">
        <div id="tracks-length">
          ${trackStr}
        </div>
        <div id="playlist-duration">
          ${formatDuration(this.playlistDuration)}
        </div>
        <div id="playlist-owner">
          ${owner}
        </div>
      </div>
    `
  }
  protected renderEnqueue(): TemplateResult {
    return html`
      <mass-menu-button
        id="enqueue-button"
        .iconPath=${this.Icons.PLAY_CIRCLE}
        .items=${this._enqueue_buttons}
        @menu-item-selected=${this.onEnqueue}
        naturalMenuWidth
      ></mass-menu-button>
    `;
  }
  protected renderTrack(track: Track, divider: boolean) {
    return cache(html`
      <mpc-playlist-track-row
        .track=${track}
        ?divider=${divider}
        .playlistURI=${this.playlistData.playlist_uri}
        .enqueueButtons=${this._enqueue_buttons}
      ></mpc-playlist-track-row>
    `)
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

    return this.tracks.map(
      (track, idx) => {
        if (idx >= this.currentIdx) {
          return html``;
        }
        const div = idx < trackCt - 1;

        return this.renderTrack(track, div)
      }
    )
  }
  protected render(): TemplateResult {
    const expressive_class = this.useExpressive ? `expressive` : ``
    const vibrant_class = this.useVibrant ? `vibrant` : ``
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
    `
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }

  protected updated(_changedProperties: PropertyValues): void {
    if (!this.animationsAdded) {
    void this.testAnimation()
    }
    if (
      _changedProperties.has('currentIdx') 
      || ( 
        _changedProperties.has('tracks') && !this.observerAdded)
    ) {
      this.addObserver();
    }
  }

  disconnectedCallback(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    super.disconnectedCallback();
  }

  private async testAnimation(delayMs=50) {
    await delay(delayMs);
    if (!this.animationsAdded
      && this?.tracksElement?.scrollHeight > this?.tracksElement?.offsetHeight
      && this.titleElement
      && this.infoElement
      && this.enqueueElement
      && this.imageElement
    ) {
      this.animationsAdded = true;
      this.animateHeader()
    } else {
      if (delayMs > 1000 ) {
        return;
      }
      await this.testAnimation(delayMs * 2);
    }
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}