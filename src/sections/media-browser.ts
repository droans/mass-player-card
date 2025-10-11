import '@shoelace-style/shoelace/dist/components/input/input';

import { consume, provide } from "@lit/context";
import {
  mdiMusic
} from "@mdi/js";
import {
  CSSResultGroup,
  html,
  LitElement,
} from "lit";
import {
  property,
  state
} from "lit/decorators.js";

import BrowserActions from "../actions/browser-actions";

import '../components/media-browser-cards';
import '../components/section-header';

import {
  customItem,
  customSection,
  FavoriteItemConfig,
  MediaBrowserConfig,
} from "../config/media-browser";

import { EnqueueOptions } from "../const/actions";
import {
  ExtendedHass,
  Thumbnail,
  MediaTypes
} from "../const/common";
import {
  activeEntityConf,
  activeEntityID,
  EntityConfig,
  hassExt,
  IconsContext,
  mediaBrowserConfigContext,
  useExpressiveContext
} from "../const/context";
import {
  DEFAULT_SEARCH_LIMIT,
  getSearchMediaButtons,
  MediaBrowserItemsConfig,
  MediaCardData,
  MediaCardItem,
  MediaLibraryItem,
  SEARCH_TERM_MIN_LENGTH,
  SEARCH_UPDATE_DELAY
} from "../const/media-browser";

import styles from '../styles/media-browser';

import { getMediaTypeSvg } from "../utils/thumbnails";
import {
  generateCustomSectionCards,
  generateFavoriteCard,
  generateFavoritesSectionCards,
  generateRecentsCard
} from '../utils/media-browser';
import { Icons } from '../const/icons.js';

export class MediaBrowser extends LitElement {
  @provide( { context: mediaBrowserConfigContext })
  @property({attribute: false}) 
  private _config!: MediaBrowserConfig;
  @state() private cards: MediaBrowserItemsConfig = {main: [], recents: []};
  @state() private _searchLibrary= false;
  @state() private _searchMediaTypeIcon: string = mdiMusic;
  @consume({ context: IconsContext}) private Icons!: Icons;
  @consume({ context: useExpressiveContext}) private useExpressive!: boolean;

  @consume( { context: activeEntityID, subscribe: true})
  public activePlayer!: string;
  @consume( { context: activeEntityConf, subscribe: true})
  public playerConfig!: EntityConfig;

  public onMediaSelectedAction!: () => void;

  private _activeCards: MediaCardItem[] = [];
  private _activeSection = 'main';
  private _hass!: ExtendedHass;
  private _lastSearchInputTs= 0;
  private _searchMediaTerm = "";
  private _searchMediaType: MediaTypes = MediaTypes.TRACK;
  private actions!: BrowserActions;
  private previousSection = '';
  private _hideBackButton!: boolean;
  private _hideSearch!: boolean;

  public set config(config: MediaBrowserConfig) {
    if (!config) {
      return;
    }
    this._config = config;
    this.setupIfReady();
  }
  public get config() {
    return this._config;
  }

  @consume({context: hassExt, subscribe: true})
  public set hass(hass: ExtendedHass) {
    if (!hass) {
      return;
    }
    const hassUnset = !this._hass
    this._hass = hass;
    if (hassUnset) {
      this.setupIfReady();
    }
  }
  public get hass() {
    return this._hass;
  }
  public set activeSection(section: string) {
    if (!section) {
      return;
    }
    this._activeSection = section;
    this.activeCards = this.cards[section];
    this.setupIfReady();
  }
  public get activeSection() {
    return this._activeSection;
  }
  private set activeCards(activeCards: MediaCardItem[]) {
    if (!activeCards?.length && this.activeSection != 'search') {
      return;
    }
    this._activeCards = activeCards;
    this.requestUpdate();
  }
  public get activeCards() {
    return this._activeCards;
  }
  private setupIfReady(regenerate=false) {
    if (
      !this.config
      || !this.hass
    ) {
      return;
    }
    if (!this.actions){
      this.actions = new BrowserActions(this.hass)
    };
    if (!this.cards.main.length) {
      this.generateCards().catch( () => {return});
      this.requestUpdate();
    }
    this.cards.search = [];
    if (regenerate) {
      this.generateCards().catch( () => {return});
      this.activeCards = this.cards[this.activeSection]
      this.requestUpdate();
    }
    this.setHiddenElements();
  }
  private setHiddenElements() {
    if (!this.config || !this.playerConfig) {
      return;
    }
    const card = this.config.hide;
    const entity = this.playerConfig.hide.media_browser;
    this._hideBackButton = card.back_button || entity.back_button;
    this._hideSearch = card.search || entity.search;
  }
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  private onFavoriteItemSelected = (data: MediaCardData) => {
    const content_id: string = data.media_content_id;
    const content_type: string = data.media_content_type;
    void this.actions.actionPlayMedia(this.activePlayer, content_id, content_type);
    this.onMediaSelectedAction();
  }
  private onSectionSelect = (data: MediaCardData) => {
    const subtype: string = data?.subtype ?? 'custom';
    const section = data.section;
    if (subtype == 'favorite') {
      this._searchMediaType = section;
      this._searchMediaTypeIcon = getMediaTypeSvg((section as MediaTypes), this.Icons);
    }
    if (subtype == 'recents') {
      const recent_section = section.split('-')[1]
      this._searchMediaType = recent_section;
      this._searchMediaTypeIcon = getMediaTypeSvg((recent_section as MediaTypes), this.Icons);
      
    }
    this.activeSection = data.section;
  }
  private onServiceSelect = (data: MediaCardData) => {
    if (data.service) {
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
      void this.actions.actionPlayMediaFromService(data.service, this.activePlayer);
    } else {
      void this.actions.actionPlayMedia(this.activePlayer, data.media_content_id, data.media_content_type);
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
    }
    this.onMediaSelectedAction();
  }
  private onSelect = (data: MediaCardData) => {
    const funcs = {
      section: this.onSectionSelect,
      favorites: this.onFavoriteItemSelected,
      service: this.onServiceSelect,
    }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */
    const func = funcs[data.type];
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-call */
    func(data);
  }
  private onEnqueue = (data: MediaCardData, enqueue: EnqueueOptions) => {
    const content_id: string = data.media_content_id;
    const content_type: string = data.media_content_type;
    void this.actions.actionEnqueueMedia(
      this.activePlayer,
      content_id,
      content_type,
      enqueue
    );
  }
  private onBack = () => {
    if (['search', 'recents'].includes(this.activeSection)  && this.previousSection.length) {
      this.activeSection = this.previousSection;
      return;
    }
    this.activeSection = 'main';
  }
  private onRecentsPress = () => {
    this.previousSection = this.activeSection;
    this.activeSection = 'recents';
  }
  private onSearchPress = () => {
    this._searchMediaTerm = '';
    this.cards.search = [];
    this.previousSection = this.activeSection;
    this.activeSection = 'search';
  }
  private onSearchInput = (ev: Event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    const val = ((ev.target as any).value as string).trim();
    if (val.length < SEARCH_TERM_MIN_LENGTH) {
      return;
    }
    const cur_ts = Date.now();
    this._lastSearchInputTs = cur_ts;
    this._searchMediaTerm = val;
    setTimeout(
      async () => {
        await this.searchIfNotUpdated(cur_ts, val, this._searchMediaType);
      },
      SEARCH_UPDATE_DELAY
    )
  }
  private onSearchMediaTypeSelect = async (ev: CustomEvent) => {
    /* eslint-disable
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-member-access,
    */
    const target = ev.target as any;
    const value = target.value as MediaTypes;
    if (!value) {
      return;
    }
    target.value = "";
    /* eslint-enable
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-member-access,
    */
    this._searchMediaType = value;
    this._searchMediaTypeIcon = getMediaTypeSvg(value, this.Icons);
    await this.generateSearchResults(this._searchMediaTerm, this._searchMediaType, this._searchLibrary);
    this.activeCards = this.cards.search;
  }
  private onSearchLibrarySelect = async () => {
    this._searchLibrary = !this._searchLibrary;
    await this.generateSearchResults(this._searchMediaTerm, this._searchMediaType, this._searchLibrary);
    this.activeCards = this.cards.search;

  }
  private async searchIfNotUpdated(last_ts: number, search_term: string, media_type: MediaTypes) {
    if (last_ts != this._lastSearchInputTs) {
      return;
    }
    await this.generateSearchResults(search_term, media_type, this._searchLibrary);
    this.activeCards = this.cards.search;
  }
  private async generateSearchResults(
    search_term: string,
    media_type: MediaTypes,
    library_only = false as boolean,
    limit: number = DEFAULT_SEARCH_LIMIT
  ) {
    if (search_term.length < SEARCH_TERM_MIN_LENGTH) {
      return;
    }
    const search_result = await this.actions.actionSearchMedia(
      this.activePlayer,
      search_term,
      media_type,
      library_only,
      limit
    );
    const items = generateFavoritesSectionCards(search_result, media_type);
    this.cards.search = items;
  }
  private generateFavoriteData = async (config: FavoriteItemConfig, media_type: MediaTypes) => {
    if (config.enabled) {
      const result = await this.getFavoriteSection(media_type, config.limit, config.items, config.favorites_only);
      if (!result.length) {
        return;
      }
      this.cards[media_type] = result;
      const card = generateFavoriteCard(this.hass, media_type, result);
      this.cards.main.push(card);
    }
  }
  private generateRecentsData = async (config: FavoriteItemConfig, media_type: MediaTypes) => {
    const hide = this.config.hide.recents || this.playerConfig.hide.media_browser.recents;
    if (config.enabled && !hide) {
      const result = await this.getRecentSection(media_type, config.limit)
      this.cards[`recents-${media_type}`] = result;
      const card = generateRecentsCard(this.hass, media_type, result);
      this.cards.recents.push(card);
    }
  }
  private generateCustomSectionData = (config: customSection) => {
    const section_card = {
      title: config.name,
      thumbnail: config.image,
      fallback: Thumbnail.CLEFT,
      data: {
        type: 'section',
        subtype: 'custom',
        section: config.name
      }
    };
    const cards = generateCustomSectionCards(config.items);
    this.cards[config.name] = cards;
    this.cards.main.push(section_card);
  }
  private generateCustomSectionsData = (config: customSection[]) => {
    config.forEach(
      (item) => {
        this.generateCustomSectionData(item);
      }
    )
  }

  private generateCards = async () => {
    const favorites = this.config.favorites;
    const promises = Promise.all( [
        this.generateFavoriteData(favorites.albums, MediaTypes.ALBUM),
        this.generateFavoriteData(favorites.artists, MediaTypes.ARTIST),
        this.generateFavoriteData(favorites.audiobooks, MediaTypes.AUDIOBOOK),
        this.generateFavoriteData(favorites.playlists, MediaTypes.PLAYLIST),
        this.generateFavoriteData(favorites.podcasts, MediaTypes.PODCAST),
        this.generateFavoriteData(favorites.radios, MediaTypes.RADIO),
        this.generateFavoriteData(favorites.tracks, MediaTypes.TRACK),
        
        this.generateRecentsData(favorites.albums, MediaTypes.ALBUM),
        this.generateRecentsData(favorites.artists, MediaTypes.ARTIST),
        this.generateRecentsData(favorites.audiobooks, MediaTypes.AUDIOBOOK),
        this.generateRecentsData(favorites.playlists, MediaTypes.PLAYLIST),
        this.generateRecentsData(favorites.podcasts, MediaTypes.PODCAST),
        this.generateRecentsData(favorites.radios, MediaTypes.RADIO),
        this.generateRecentsData(favorites.tracks, MediaTypes.TRACK),

    ]);
    await promises;
    this.generateCustomSectionsData(this.config.sections);
    this.activeCards = this.cards[this.activeSection];
    this.requestUpdate();
  }
  private getFavoriteSection = async (
    media_type: MediaTypes,
    limit: number,
    custom_items: customItem[],
    favorites_only = true
  ) => {
    const response: MediaLibraryItem[] = await this.actions.actionGetLibrary(this.activePlayer, media_type, limit, favorites_only);
    const items = generateFavoritesSectionCards(response, media_type);
    const customs = generateCustomSectionCards(custom_items);
    return [...items, ...customs];
  }
  private getRecentSection = async (
    media_type: MediaTypes,
    limit: number,
  ) => {
    const response: MediaLibraryItem[] = await this.actions.actionGetLibraryRecents(this.activePlayer, media_type, limit);
    const items = generateFavoritesSectionCards(response, media_type);
    return [...items];
  }
  protected renderBackButton() {
    if (this._hideBackButton) {
      return html``
    }
    return html`
      <span slot="start" id="back-button">
        <ha-button
          appearance="plain"
          variant="brand"
          size="medium"
          class="button-back button-min ${this.useExpressive ? `button-expressive` : ``}"
          @click=${this.onBack}
        >
          <ha-svg-icon
            .path=${this.Icons.ARROW_LEFT}
            class="header-icon"
          ></ha-svg-icon>
        </ha-button>
      </span>
    `
  }
  protected renderRecentsButton() {
    if (this.config.hide.recents || this.playerConfig.hide.media_browser.recents) {
      return html``
    }
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        class="button-recents button-min ${this.useExpressive ? `button-expressive` : ``}"
        @click=${this.onRecentsPress}
      >
        <ha-svg-icon
          .path=${this.Icons.RECENTS}
          class="header-icon"
        ></ha-svg-icon>
      </ha-button>
    `
  }
  protected renderSearchButton() {
    if (this._hideSearch) {
      return html``
    }
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        class="button-search button-min ${this.useExpressive ? `button-expressive` : ``}"
        @click=${this.onSearchPress}
      >
        <ha-svg-icon
          .path=${this.Icons.SEARCH}
          class="header-icon"
        ></ha-svg-icon>
      </ha-button>
    `
  }
  protected renderEndButtons() {
    return html`
      <span slot="end" id="search-button">
        ${this.renderRecentsButton()}
        ${this.renderSearchButton()}
      </span>
    `

  }
  protected renderTitle() {
    const title = this.activeSection == 'main' ? 'Media Browser' : this.activeSection;
    return html`
      <span slot="label" id="title">
        ${title}
      </span>
    `
  }
  protected renderSearchMediaTypesButton() {
    if (this.activeSection == 'search') {
      const icons = getSearchMediaButtons(this.Icons);
      return html`
        <mass-menu-button
          id="search-media-type-menu"
          .iconPath=${this._searchMediaTypeIcon}
          .items=${icons}
          .onSelectAction=${this.onSearchMediaTypeSelect}
          fixedMenuPosition
        ></mass-menu-button>
      `
    }
    return html``
  }
  protected renderSearchLibraryButton() {
    if (this.activeSection == 'search') {
      return html`
        <ha-button
          appearance="plain"
          variant="brand"
          size="medium"
          class="search-favorite-button"
          @click=${this.onSearchLibrarySelect}
        >
          <ha-svg-icon
            .path=${this._searchLibrary ? this.Icons.LIBRARY : this.Icons.LIBRARY_OUTLINED}
            style="height: 1.5rem; width: 1.5rem;"
          ></ha-svg-icon>
        </ha-button>
      `
    } return html``
  }
  protected renderSearchBar() {
    const styles_base_url = 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/';
    const styles_url = styles_base_url + (this.hass.themes.darkMode ? 'dark.css' : 'light.css');
    return html`
      <span
        slot="end"
        id="search-input"
      >
        <link rel="stylesheet" href="${styles_url}" />
        <sl-input
          placeholder="Search"
          type="search"
          class="${this.hass.themes.darkMode ? 'sl-theme-dark' : 'sl-theme-light'}"
          inputmode="search"
          size="medium"
          clearable
          pill
        >
          <span slot="suffix" id="search-options">
            ${this.renderSearchMediaTypesButton()}
            ${this.renderSearchLibraryButton()}
          </span>
        </sl-input>
      </span>
    `
  }
  protected renderSearchHeader() {
    return html`
      <mass-section-header id="search">
        ${this.renderBackButton()}
        ${this.renderSearchBar()}
      </mass-section-header>
    `
  }
  protected renderSectionHeader() {
    return html`
      <mass-section-header>
        ${this.renderBackButton()}
        ${this.renderTitle()}
        ${this.renderEndButtons()}
      </mass-section-header>
    `
  }
  protected renderMainHeader() {
    return html`
      <mass-section-header>
        ${this.renderTitle()}
        ${this.renderEndButtons()}
      </mass-section-header>
    `
  }
  protected renderBrowserCards() {
    const activeCards = this.cards[this.activeSection];
    return html`
      <mass-browser-cards
        .items=${activeCards}
        .onSelectAction=${this.onSelect}
        .onEnqueueAction=${this.onEnqueue}
      >
      </mass-browser-cards>
    `
  }
  protected renderHeader() {
    switch (this.activeSection) {
      case "main":
        return this.renderMainHeader();
      case "search":
        return this.renderSearchHeader();
    default:
      return this.renderSectionHeader();
    }
  }
  protected render() {
    if (!this.cards) {
      return;
    }
    return html`
      <div
        id="container"
        class="${this.useExpressive ? `container-expressive` : ``}"
      >
        ${this.renderHeader()}
        <wa-animation 
          name="fadeIn"
          easing="ease-in"
          iterations=1
          play=${this.checkVisibility()}
          playback-rate=4
        >
          <div class="mass-browser ${this.useExpressive ? `mass-browser-expressive` : ``}">
            ${this.renderBrowserCards()}
          </div>
        </wa-animation>
      </div>
    `;
  }
  protected updated() {
    if (!(this.activeSection == 'search')) {
      return;
    }
    const element = this.shadowRoot?.getElementById('search-input');
    element?.addEventListener('sl-input', this.onSearchInput);
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
customElements.define('mass-media-browser', MediaBrowser);