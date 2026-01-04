import "@shoelace-style/shoelace/dist/components/input/input";
import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import {
  MediaTypes,
} from "../const/enums";
import { MediaBrowserConfig } from "../config/media-browser";
import { customElement, property, query, state } from "lit/decorators.js";
import {
  DEFAULT_ACTIVE_SECTION,
  DEFAULT_ACTIVE_SUBSECTION,
  DEFAULT_SEARCH_LIMIT,
  getFilterButtons,
  getSearchMediaButtons,
  SEARCH_TERM_MIN_LENGTH,
  SEARCH_UPDATE_DELAY,
} from "../const/media-browser";
import { consume, provide } from "@lit/context";

import "../components/media-browser-cards";
import "../components/section-header";
import "../components/browser-playlist-view"
import "../components/browser-album-view"
import "../components/browser-artist-view"
import styles from "../styles/media-browser";

import {
  activeEntityConfContext,
  activeMediaBrowserCardsContext,
  browserControllerContext,
  EntityConfig,
  hassContext,
  IconsContext,
  mediaBrowserCardsContext,
  mediaBrowserConfigContext,
  useExpressiveContext,
} from "../const/context";
import { Icons } from "../const/icons";
import { MediaBrowserController } from "../controller/browser";
import BrowserActions from "../actions/browser-actions";
import { EnqueueOptions } from "../const/enums";
import { getMediaTypeSvg } from "../utils/thumbnails";
import { jsonMatch } from "../utils/util";
import { getTranslation } from "../utils/translations";
import { CardsUpdatedEvent, MenuButtonEventData, TargetValEventData } from "../const/events";
import { MediaBrowserCards } from "../components/media-browser-cards";
import {
  ExtendedHass,
  mediaCardData,
  MediaCardItem,
  newMediaBrowserItemsConfig,
  mediaCardPlaylistData,
  mediaCardServiceData,
  mediaCardSectionData,
  mediaCardItemData,
  mediaCardEnqueueType,
  mediaCardCollectionType,
} from "../const/types";

@customElement(`mass-media-browser`)
export class MediaBrowser extends LitElement {
  @property({ attribute: false }) private _config!: MediaBrowserConfig;
  @property({ attribute: false }) public onMediaSelectedAction!: () => void;

  @state() public _cards!: newMediaBrowserItemsConfig;
  @state() private searchMediaTypeIcon!: string;
  @state() private searchMediaType: MediaTypes = MediaTypes.TRACK;
  @state() private searchLibrary = false;
  @query('mass-browser-cards') cardsElement?: MediaBrowserCards;

  @provide({ context: activeMediaBrowserCardsContext })
  @state()
  public _activeCards!: MediaCardItem[];

  @consume({ context: useExpressiveContext, subscribe: true })
  private useExpressive!: boolean;
  @consume({ context: IconsContext }) private Icons!: Icons;
  @consume({ context: activeEntityConfContext, subscribe: true })
  private activeEntityConfig!: EntityConfig;

  public activeSection = DEFAULT_ACTIVE_SECTION;
  public activeSubSection = DEFAULT_ACTIVE_SUBSECTION;
  @property() private collectionViewActive = false;
  @property() private activeCollectionData!: mediaCardCollectionType;
  private previousSections: string[] = [];
  private previousSubSections: string[] = [];

  private _hass!: ExtendedHass;
  private _browserController!: MediaBrowserController;
  private actions!: BrowserActions;
  private searchTerm = "";
  private _searchTimeout!: number;
  private searchActivated = false;

  @state()
  public set activeCards(cards: MediaCardItem[]) {
    if (jsonMatch(this._activeCards, cards)) {
      return;
    }
    this._activeCards = cards;
  }
  public get activeCards() {
    return this._activeCards;
  }

  @consume({ context: hassContext, subscribe: true })
  public set hass(hass: ExtendedHass) {
    this._hass = hass;
    if (!this.actions) {
      this.actions = new BrowserActions(hass);
    }
  }
  public get hass() {
    return this._hass;
  }

  @consume({ context: browserControllerContext, subscribe: true })
  public set browserController(controller: MediaBrowserController) {
    this._browserController = controller;
  }
  public get browserController() {
    return this._browserController;
  }

  @consume({ context: mediaBrowserConfigContext, subscribe: true })
  public set config(config: MediaBrowserConfig) {
    this._config = config;
  }
  public get config() {
    return this._config;
  }

  @consume({ context: mediaBrowserCardsContext, subscribe: true })
  public set cards(cards: newMediaBrowserItemsConfig) {
    if (jsonMatch(this._cards, cards)) {
      return;
    }
    this._cards = cards;
    if (this.activeSection == "search") {
      this.activeCards = [];
      return;
    }
    if (!this.activeCards) {
      this.setActiveCards();
    }
  }
  public get cards() {
    return this._cards;
  }
  private setPreviousSection() {
    this.previousSections.push(this.activeSection);
    this.previousSubSections.push(this.activeSubSection);
  }
  public setActiveCards() {
    const section = this.activeSection;
    const subsection = this.activeSubSection;
    this.collectionViewActive = false;
    let new_cards: MediaCardItem[] = [];
    if (!this.cards) {
      return;
    }
    try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      new_cards = [...this.cards[section][subsection] as MediaCardItem[]];
    } catch {
      return;
    }
    const cur_cards = this.activeCards;
    if (!jsonMatch(new_cards, cur_cards)) {
      this.activeCards = new_cards;
    }
    this.scrollCardsToTop();
  }
  public scrollCardsToTop() {
    if (this.offsetHeight) {
      this?.cardsElement?.resetScroll();
    } 
  }
  public resetActiveSections() {
    this.activeSection = DEFAULT_ACTIVE_SECTION;
    this.activeSubSection = DEFAULT_ACTIVE_SUBSECTION;
    this.previousSections = [];
    this.previousSubSections = [];
    this.setActiveCards();
  }
  private onServiceSelect = (data: mediaCardServiceData) => {
    if (data.service) {
      void this.actions.actionPlayMediaFromService(
        data.service,
        this.activeEntityConfig.entity_id,
      );
      return;
    }
    void this.actions.actionPlayMedia(
      this.activeEntityConfig.entity_id,
      data.media_content_id,
      data.media_content_type,
    );
    this.onMediaSelectedAction();
  };
  private onSectionSelect = (data: mediaCardSectionData) => {
    this.setPreviousSection();
    this.activeSection = data.subtype;
    this.activeSubSection = data.section;
    this.setActiveCards();
  };
  private onItemSelect = (data: mediaCardItemData) => {
    void this.actions.actionPlayMedia(
      this.activeEntityConfig.entity_id,
      data.media_content_id,
      data.media_content_type,
    );
  };
  private onCollectionSelect = (data: mediaCardCollectionType) => {
    this.collectionViewActive = true;
    this.activeCollectionData = data;
  }
  private onSelect = (data: mediaCardData) => {
    const funcs = {
      section: this.onSectionSelect,
      item: this.onItemSelect,
      service: this.onServiceSelect,
      playlist: this.onCollectionSelect,
      album: this.onCollectionSelect,
      artist: this.onCollectionSelect,
    };
    const func = funcs[data.type as string] as (data: mediaCardData) => void;
    if (["playlist", "album", "artist"].includes(data.type)) {
      this.onCollectionSelect(data as mediaCardCollectionType);
    }
    this.collectionViewActive = false;
    func(data);
  };
  private onEnqueue = (data: mediaCardEnqueueType, enqueue: EnqueueOptions) => {

    const content_id = data.type == 'playlist' ? data.media_content_id : data.media_content_id;
    const content_type = data.type == 'playlist' ? 'music' : data.media_content_id;
    if (enqueue == EnqueueOptions.RADIO) {
      void this.actions.actionPlayRadio(
        this.activeEntityConfig.entity_id,
        content_id,
        content_type,
      );
      return;
    }
    void this.actions.actionEnqueueMedia(
      this.activeEntityConfig.entity_id,
      content_id,
      content_type,
      enqueue,
    );
  };
  private onPlaylistEnqueue = (data: mediaCardPlaylistData, enqueue: EnqueueOptions) => {
    const content_id: string = data.media_content_id;
    const content_type = 'playlist';
    void this.actions.actionEnqueueMedia(
      this.activeEntityConfig.entity_id,
      content_id,
      content_type,
      enqueue,
    );
  }
  private onBack = () => {
    if (!this.collectionViewActive) {
    this.activeSection = this.previousSections.pop() ?? DEFAULT_ACTIVE_SECTION;
    this.activeSubSection =
      this.previousSubSections.pop() ?? DEFAULT_ACTIVE_SUBSECTION;
    }
    this.setActiveCards();
  };
  private onSearchButtonPress = () => {
    this.setPreviousSection();
    if (!this.searchMediaTypeIcon) {
      this.searchMediaTypeIcon = getMediaTypeSvg(
        MediaTypes.TRACK,
        this.Icons,
        this.hass,
      );
    }
    this.searchTerm = "";
    this.activeSection = "search";
    this.cards.search = [];
    this.activeCards = this.cards.search;
    this.searchActivated = true;
  };
  private onSearchMediaTypeSelect = async (ev: MenuButtonEventData) => {
    const val = ev.detail.option as MediaTypes;
    if (!val) {
      return;
    }
    this.searchMediaType = val;
    this.searchMediaTypeIcon = getMediaTypeSvg(val, this.Icons, this.hass);
    await this.searchMedia();
  };
  private onSearchLibrarySelect = async () => {
    this.searchLibrary = !this.searchLibrary;
    await this.searchMedia();
  };
  private onSearchInput = (ev: TargetValEventData) => {
    const val = ev.target.value.trim();
    if (val.length < SEARCH_TERM_MIN_LENGTH) {
      return;
    }
    this.searchTerm = val;
    if (this._searchTimeout) {
      try {
        clearTimeout(this._searchTimeout);
      } finally {
        this._searchTimeout = 0;
      }
    }
    this._searchTimeout = setTimeout(() => {
      this._searchTimeout = 0;
      void this.searchMedia();
    }, SEARCH_UPDATE_DELAY);
  };
  private onFilterType = (ev: MenuButtonEventData) => {
    const val = ev.detail.option;
    if (!val.length) {
      return;
    }
    if (!Object.keys(this.cards).includes(val)) {
      return;
    }
    this.activeSection = val;
    this.activeSubSection = "main";
    /* eslint-disable-next-line
      @typescript-eslint/no-unsafe-member-access
    */
    this.activeCards = this.cards[val].main as MediaCardItem[];
  };
  private async searchMedia() {
    const search_term = this.searchTerm;
    if (search_term.length < SEARCH_TERM_MIN_LENGTH) {
      return;
    }
    const cards = await this.browserController.search(
      this.activeEntityConfig.entity_id,
      search_term,
      this.searchMediaType,
      this.searchLibrary,
      DEFAULT_SEARCH_LIMIT,
    );
    this.activeCards = cards;
  }
  private onCardsUpdated = (ev: Event) => {
    const _ev = ev as CardsUpdatedEvent;
    const detail = _ev.detail;
    const section = detail.section;
    if (section == "all") {
      this._cards = detail.cards as newMediaBrowserItemsConfig;
    }
    if (!this.cards) {
      return;
    }
    if (
      !this?.activeCards?.length &&
      (section == "all" || section == this.activeSection)
    ) {
      this.setActiveCards();
    }
  };
  protected renderCollectionView(): TemplateResult {
    const collType = this.activeCollectionData.type;
    if (collType == 'album') {
      return html`
      <mpc-browser-album-view
        .albumData=${this.activeCollectionData}
        .onEnqueueAction=${this.onPlaylistEnqueue}
      ></mpc-browser-playlist-view>
      `
    }
    if (collType == 'artist') {
      return html`
      <mpc-browser-artist-view
        .artistData=${this.activeCollectionData}
        .onEnqueueAction=${this.onPlaylistEnqueue}
      ></mpc-browser-playlist-view>
      `
    }
    return html`
      <mpc-browser-playlist-view
        .playlistData=${this.activeCollectionData}
        .onEnqueueAction=${this.onPlaylistEnqueue}
      ></mpc-browser-playlist-view>
    `
  }
  protected renderBrowserCards(): TemplateResult {
    if (this.collectionViewActive) {
      return this.renderCollectionView();
    }
    return html`
      <mass-browser-cards
        .onSelectAction=${this.onSelect}
        .onEnqueueAction=${this.onEnqueue}
      ></mass-browser-cards>
    `;
  }
  protected renderTitle(): TemplateResult {
    const title = this.activeSection;
    return html` <span slot="label" id="title"> ${title} </span> `;
  }
  protected renderSearchMediaTypeButton(): TemplateResult {
    if (this.activeSection == "search") {
      const icons = getSearchMediaButtons(this.Icons, this.hass);
      return html`
        <mass-menu-button
          id="search-media-type-menu"
          class="${this.useExpressive
            ? `search-media-type-menu-expressive`
            : ``}"
          .iconPath=${this.searchMediaTypeIcon}
          .initialSelection=${this.searchMediaType}
          .items=${icons}
          @menu-item-selected=${this.onSearchMediaTypeSelect}
          fixedMenuPosition
        ></mass-menu-button>
      `;
    }
    return html``;
  }
  protected renderSearchLibraryButton(): TemplateResult {
    if (this.activeSection == "search") {
    return html`
      <mass-player-card-button
        .onPressService=${this.onSearchLibrarySelect}
        role="plain"
        size="small"
        elevation=0
        id="search-favorite-button"
        class="button-min ${this.useExpressive ? `search-library-button-expressive` : ``}"
      >
        <ha-svg-icon
          .path=${this.searchLibrary
            ? this.Icons.LIBRARY
            : this.Icons.LIBRARY_OUTLINED}
          class="svg-xs ${this.useExpressive ? `svg-menu-expressive` : ``}"
        ></ha-svg-icon>
      </mass-player-card-button>
    `;
    }
    return html``;
  }
  protected renderSearchBar() {
    const styles_base_url =
      "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/";
    const darkMode = this.hass.themes.darkMode;
    const styles_url = styles_base_url + (darkMode ? "dark.css" : "light.css");
    const placeholder = getTranslation(
      "browser.search.placeholder",
      this.hass,
    ) as string;
    return html`
      <span slot="end" id="search-input">
        <link rel="stylesheet" href="${styles_url}" />
        <sl-input
          placeholder="${placeholder}"
          type="search"
          class="${darkMode ? `sl-theme-dark` : `sl-theme-light`}"
          inputmode="search"
          size="medium"
          clearable
          pill
          @sl-input=${this.onSearchInput}
        >
          <span slot="suffix">
            <div id="search-options">
              ${this.renderSearchMediaTypeButton()}
              ${this.renderSearchLibraryButton()}
            </div>
          </span>
        </sl-input>
      </span>
    `;
  }
  protected renderEndButtons(): TemplateResult {
    return html`
      <span slot="end" id="buttons-end">
        <div id="header-buttons-end">
          ${this.renderFilterButton()} ${this.renderSearchButton()}
        </div>
      </span>
    `;
  }
  protected renderSearchButton(): TemplateResult {
    const hide =
      this.config.hide.search ||
      this.activeEntityConfig.hide.media_browser.search;
    if (hide) {
      return html``;
    }
    return html`
      <mass-player-card-button
        .onPressService=${this.onSearchButtonPress}
        role="filled"
        size="small"
        elevation=1
        id="button-search"
        class="button-min ${this.useExpressive ? `button-expressive` : ``}"
      >
        <ha-svg-icon
          .path=${this.Icons.SEARCH}
          class="svg-xs"
        ></ha-svg-icon>
      </mass-player-card-button>
    `;
  }
  protected renderBackButton(): TemplateResult {
    const hide =
      this.config.hide.back_button ||
      this.activeEntityConfig.hide.media_browser.back_button;
    if (hide) {
      return html``;
    }
    return html`
      <span slot="start" id="back-button">
        <mass-player-card-button
          .onPressService=${this.onBack}
          role="filled"
          size="small"
          elevation=1
          id="button-back"
          class="button-min ${this.useExpressive ? `button-expressive` : ``}"
        >
          <ha-svg-icon
            .path=${this.Icons.ARROW_LEFT}
            class="header-icon"
          ></ha-svg-icon>
        </mass-player-card-button>
      </span>
    `;
  }
  protected renderFilterButton(): TemplateResult {
    const icons = getFilterButtons(this.Icons, this.hass, this.config);
    const icon = this.Icons.FILTER;
    return html`
      <mass-menu-button
        id="filter-menu"
        class="hdr-menu ${this.useExpressive ? `filter-menu-expressive` : ``}"
        .iconPath=${icon}
        .initialSelection=${this.activeSection}
        .items=${icons}
        @menu-item-selected=${this.onFilterType}
        fixedMenuPosition
      ></mass-menu-button>
    `;
  }
  protected renderSearchHeader(): TemplateResult {
    return html`
      <mass-section-header id="search">
        ${this.renderBackButton()} ${this.renderSearchBar()}
      </mass-section-header>
    `;
  }
  protected renderSubsectionHeader(): TemplateResult {
    return html`
      <mass-section-header>
        ${this.renderBackButton()} ${this.renderTitle()}
        ${this.renderEndButtons()}
      </mass-section-header>
    `;
  }
  protected renderMainHeader(): TemplateResult {
    return html`
      <mass-section-header>
        ${this.renderTitle()} ${this.renderEndButtons()}
      </mass-section-header>
    `;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
  protected renderHeader(): TemplateResult {
    if (this.activeSection == "search") {
      return this.renderSearchHeader();
    }
    if (
      this.activeSection == DEFAULT_ACTIVE_SECTION &&
      this.activeSubSection == DEFAULT_ACTIVE_SUBSECTION
    ) {
      return this.renderMainHeader();
    }
    return this.renderSubsectionHeader();
  }
  protected firstUpdated(): void {
    this.browserController._host.addEventListener(
      "cards-updated",
      this.onCardsUpdated,
    );
  }
  protected render(): TemplateResult {
    return html`
      <div
        id="container"
        class="${this.useExpressive ? `container-expressive` : ``}"
      >
        ${this.renderHeader()}
        <div
          id="mass-browser"
          class="${this.useExpressive ? `mass-browser-expressive` : ``}"
        >
          ${this.renderBrowserCards()}
        </div>
      </div>
    `;
  }

  protected updated(): void {
    if (this.searchActivated) {
      setTimeout(
        () => {
          this?.shadowRoot?.querySelector('#search')?.querySelector('sl-input')?.shadowRoot?.querySelector('input')?.focus();
          this.searchActivated = false;
        },
        50
      )
    }
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
