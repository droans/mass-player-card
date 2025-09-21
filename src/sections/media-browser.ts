import { 
  CSSResultGroup, 
  html, 
  LitElement, 
  TemplateResult 
} from "lit";
import { property, state } from "lit/decorators.js";
import { 
  mdiArrowLeft, 
  mdiLibrary, 
  mdiLibraryOutline, 
  mdiMagnify, 
  mdiMusic
} from "@mdi/js";
import '@shoelace-style/shoelace/dist/components/input/input';

import BrowserActions from "../actions/browser-actions";
import '../components/media-browser-cards'
import { 
  customItem, 
  customSection, 
  FavoriteItemConfig, 
  MediaBrowserConfig, 
} from "../config/media-browser";

import { 
  DEFAULT_SEARCH_LIMIT,
  MediaBrowserItemsConfig, 
  MediaCardData, 
  MediaCardItem, 
  MediaLibraryItem, 
  MediaTypeIcons, 
  SEARCH_MEDIA_TYPE_BUTTONS, 
  SEARCH_TERM_MIN_LENGTH, 
  SEARCH_UPDATE_DELAY
} from "../const/media-browser";
import { ExtendedHass, Icon, MediaTypes } from "../const/common";

import styles from '../styles/media-browser';

import { backgroundImageFallback } from "../utils/icons";
import { testMixedContent } from "../utils/util";
import { EnqueueOptions } from "../const/actions";

export class MediaBrowser extends LitElement {
  public activePlayer!: string;
  @property({attribute: false}) private _config!: MediaBrowserConfig;
  private _hass!: ExtendedHass;
  @state() private cards: MediaBrowserItemsConfig = {main: []};
  private _activeSection = 'main';
  private previousSection = '';
  private actions!: BrowserActions;
  private _activeCards: MediaCardItem[] = [];
  public onMediaSelectedAction!: () => void;
  private _lastSearchInputTs= 0;
  @state() private _searchLibrary= false;
  private _searchMediaType: MediaTypes = MediaTypes.TRACK;
  private _searchMediaTerm = "";
  @state() private _searchMediaTypeIcon: string = mdiMusic;
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
  }
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  private onFavoriteItemSelected = (data: MediaCardData) => {
    const content_id: string = data.media_content_id;
    const content_type: string = data.media_content_type;
    void this.actions.actionPlayMedia(this.activePlayer, content_id, content_type);
    this.onMediaSelectedAction();
  }
  private onSectionSelect = (data: MediaCardData) => {
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
    if (this.activeSection == 'search' && this.previousSection.length) {
      this.activeSection = this.previousSection;
      return;
    }
    this.activeSection = 'main';
  }
  private onSearchPress = () => {
    this._searchFavorites = true;
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
  private getMediaTypeSvg(media_type: MediaTypes) {
    const data = SEARCH_MEDIA_TYPE_BUTTONS;
    const result = data.find(
      (item) => {
        return (item.option as MediaTypes) == media_type;
      }
    );
    return result?.icon ?? Icon.CLEFT;
  }
  private onSearchMediaTypeSelect = (ev: CustomEvent) => {
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
    this._searchMediaTypeIcon = this.getMediaTypeSvg(value);
    void this.generateSearchResults(this._searchMediaTerm, this._searchMediaType, this._searchLibrary);
  }
  private onSearchLibrarySelect = () => {
    this._searchLibrary = !this._searchLibrary;
    void this.generateSearchResults(this._searchMediaTerm, this._searchMediaType, this._searchLibrary);

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
    const items = search_result.map(
      (item) => {
        const r: MediaCardItem = {
          title: item.name,
          icon: item.image,
          fallback: Icon.CLEFT,
          data: {
            type: 'favorites',
            media_content_id: item.uri,
            media_content_type: item.media_type
          }
        };
        return r;
      }
    )
    this.cards.search = items;
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  private _generateSectionBackgroundPart(icon: string, fallback: Icon = Icon.DISC) {
    const image = backgroundImageFallback(this.hass, icon, fallback)
    return html`
      <div class="thumbnail-section" style="${image};"></div>
    `
  }
  private generateSectionBackground(cards: MediaCardItem[], fallback: Icon) {
    const rng = [...Array(4).keys()];
    const icons: TemplateResult[] = []
    const filteredCards = cards.filter(
      (item) =>{
        if (item.icon) {
          return testMixedContent(item.icon || "")
        }
        return false;
      }
    )
    rng.forEach(
      (i) => {
        const idx = i % filteredCards.length;
        icons.push(this._generateSectionBackgroundPart(filteredCards[idx]?.icon ?? fallback, fallback));
      }
    )
    let icons_html = html``;
    icons.forEach( 
      (icon) => {
        icons_html = html`
          ${icons_html}
          ${icon}
        `
      }
    );
    return html`
      <div class="thumbnail" style="display: grid; grid-template-areas: 'bg-1 bg-2' 'bg-3 bg-4'; padding-bottom: 0%; height: unset; width: unset; padding-left: unset; padding-right: unset;">
        ${icons_html}
      </div>
    `
  }
  private generateFavoriteCard(media_type: MediaTypes, cards: MediaCardItem[]): MediaCardItem {
    const icon: Icon = MediaTypeIcons[media_type];
    return {  
      title: media_type,
      background: this.generateSectionBackground(cards, icon),
      icon: icon,
      fallback: icon,
      data: {
        type: 'section',
        section: media_type
      }
    }
  }
  private generateFavoriteData = async (config: FavoriteItemConfig, media_type: MediaTypes) => {
    if (config.enabled) {
      const result = await this.getFavoriteSection(media_type, config.limit, config.items);
      if (!result.length) {
        return;
      }
      this.cards[media_type] = result;
      const card = this.generateFavoriteCard(media_type, result);
      this.cards.main.push(card);
    }
  }
  private generateCustomSectionData = (config: customSection) => {
    const section_card = {
      title: config.name,
      icon: config.image,
      fallback: Icon.CLEFT,
      data: {
        type: 'section',
        section: config.name
      }
    };
    const cards = this.generateCustomSectionCards(config.items);
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
        
    ]);
    await promises;
    this.generateCustomSectionsData(this.config.sections);
    this.activeCards = this.cards[this.activeSection];
    this.requestUpdate();
  }
  private generateCustomSectionCards = (config: customItem[])  => {
    return config.map( 
      (item) => {
        const r: MediaCardItem = {
          title: item.name,
          icon: item.image,
          fallback: Icon.CLEFT,
          data: {
            type: 'service',
            media_content_id: item.media_content_id,
            media_content_type: item.media_content_type,
            service: item.service
          }
        };
        return r;
      }
    )
  }
  private getFavoriteSection = async (media_type: MediaTypes, limit: number, custom_items: customItem[]) => {
    const response: MediaLibraryItem[] = await this.actions.actionGetFavorites(this.activePlayer, media_type, limit);
    const icon: Icon = MediaTypeIcons[media_type];
    const items = response.map(
      (item) => {
        const r: MediaCardItem = {
          title: item.name,
          icon: item.image,
          fallback: icon,
          data: {
            type: 'favorites',
            media_content_id: item.uri,
            media_content_type: item.media_type,
          }
        }
        return r;
      }
    )
    const customs = custom_items.map( 
      (item) => {
        const r: MediaCardItem = {
          title: item.name,
          icon: item.image,
          fallback: Icon.CLEFT,
          data: {
            type: 'service',
            media_content_id: item.media_content_id,
            media_content_type: item.media_content_type,
            service: item.service
          }
        };
        return r;
      }
    )
    return [...items, ...customs];
  }
  protected renderBackButton() {
    return html`
      <div id="back-button">
        <ha-button
          appearance="plain"
          variant="brand"
          size="medium"
          class="button-back"
          @click=${this.onBack}
        >
          <ha-svg-icon
            .path=${mdiArrowLeft}
            style="height: 2rem; width: 2rem;"
          ></ha-svg-icon>
        </ha-button>
      </div>
    `
  }
  protected renderSearchButton() {
    return html`
      <div id="search-button">
        <ha-button
          appearance="plain"
          variant="brand"
          size="medium"
          class="button-search"
          @click=${this.onSearchPress}
        >
          <ha-svg-icon
            .path=${mdiMagnify}
            style="height: 2rem; width: 2rem;"
          ></ha-svg-icon>
        </ha-button>
      </div>
    `
  }
  protected renderTitle() {
    const title = this.activeSection == 'main' ? 'Media Browser' : this.activeSection;
    return html`
      <div id="title">
        ${title}
      </div>
    `
  }
  protected renderSearchMediaTypeList() {
    const buttons = SEARCH_MEDIA_TYPE_BUTTONS;
    return buttons.map(
      (item) => {
        return html`
          <ha-list-item
            class="search-media-type-list-item"
            .value="${item.option}"
            .graphic=${item.icon}
          >
            <ha-svg-icon
              class="search-media-type-item-svg"
              slot="graphic"
              .path=${item.icon}
            ></ha-svg-icon>
            ${item.title}
          </ha-list-item>
        `
      }
    )
  }
  protected renderSearchMediaTypesButton() {
    return html`
      <ha-control-select-menu
        id="search-media-type-menu-control"
        fixedMenuPosition
        naturalMenuWidth
        @selected=${this.onSearchMediaTypeSelect}
      >
        <ha-svg-icon
          slot="icon"
          id="search-media-type-menu-svg"
          .path=${this._searchMediaTypeIcon}
        ></ha-svg-icon>
        ${this.renderSearchMediaTypeList()}
      </ha-control-select-menu>
    `
  }
  protected renderSearchFavoritesButton() {
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        class="search-favorite-button"
        @click=${this.onSearchLibrarySelect}
      >
        <ha-svg-icon
          .path=${this._searchLibrary ? mdiLibrary : mdiLibraryOutline}
          style="height: 1.5rem; width: 1.5rem;"
        ></ha-svg-icon>
      </ha-button>
    `
  }
  protected renderSearchBar() {
    const styles_base_url = 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/';
    const styles_url = styles_base_url + (this.hass.themes.darkMode ? 'dark.css' : 'light.css');
    return html`
      <div id="search-input">
        <link rel="stylesheet" href="${styles_url}" />
        <sl-input
          placeholder="Search"
          type="search"
          class="${this.hass.themes.darkMode ? 'sl-theme-dark' : 'sl-theme-light'}"
          inputmode="search"
          size="medium"
          clearable
          pill
          autofocus
        >
          <span slot="suffix">
            ${this.renderSearchMediaTypesButton()}
            ${this.renderSearchFavoritesButton()}
          </span>
        </sl-input>
      </div>
    `
  }
  protected renderSearchHeader() {
    return html`
      <div id="header-search" class="header">
        ${this.renderBackButton()}
        ${this.renderSearchBar()}
      </div>
    `
  }
  protected renderSectionHeader() {
    return html`
      <div id="header-section" class="header">
        ${this.renderBackButton()}
        ${this.renderTitle()}
        ${this.renderSearchButton()}
      </div>
    `
  }
  protected renderMainHeader() {
    return html`
      <div id="header-main" class="header">
        ${this.renderTitle()}
        ${this.renderSearchButton()}
      </div>
    `    
  }
  protected renderBrowserCards() {
    const activeCards = this.cards[this.activeSection];
    return html`
      <mass-browser-cards
        .items=${activeCards}
        .onSelectAction=${this.onSelect}
        .hass=${this.hass}
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
      <ha-card>
        ${this.renderHeader()}
        <div class="mass-browser">
          ${this.renderBrowserCards()}
        </div>
      </ha-card>
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