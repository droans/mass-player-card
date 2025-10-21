import '@shoelace-style/shoelace/dist/components/input/input';
import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult
} from "lit";
import {
  ExtendedHass,
  MediaTypes,
  TargetValEventData,
} from "../const/common.js";
import { MediaBrowserConfig } from "../config/media-browser.js";
import { customElement, property, state } from "lit/decorators.js";
import {
  DEFAULT_ACTIVE_SECTION,
  DEFAULT_ACTIVE_SUBSECTION,
  DEFAULT_SEARCH_LIMIT,
  getFilterButtons,
  getSearchMediaButtons,
  MediaCardData,
  MediaCardItem,
  newMediaBrowserItemsConfig,
  SEARCH_TERM_MIN_LENGTH,
  SEARCH_UPDATE_DELAY
} from "../const/media-browser.js";
import { consume, provide } from "@lit/context";


import '../components/media-browser-cards.js';
import '../components/section-header.js';
import styles from '../styles/media-browser.js'

import {
  activeEntityConf,
  activeMediaBrowserCardsContext,
  browserControllerContext,
  EntityConfig,
  hassExt, 
  IconsContext,
  mediaBrowserCardsContext,
  mediaBrowserConfigContext,
  useExpressiveContext
} from "../const/context.js";
import { Icons } from "../const/icons.js";
import { MediaBrowserController } from "../controller/browser.js";
import BrowserActions from "../actions/browser-actions.js";
import { EnqueueOptions } from "../const/actions.js";
import { getMediaTypeSvg } from "../utils/thumbnails.js";
import { jsonMatch } from '../utils/util.js';

@customElement(`mass-media-browser`)
export class MediaBrowser extends LitElement {
  private _hass!: ExtendedHass;
  @property({ attribute: false }) private _config!: MediaBrowserConfig;
  @property({ attribute: false }) public onMediaSelectedAction!: () => void;

  @state() private _cards!: newMediaBrowserItemsConfig
  @provide({ context: activeMediaBrowserCardsContext })
  private _activeCards!: MediaCardItem[];

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
  @consume({ context: useExpressiveContext, subscribe: true}) private useExpressive!: boolean;
  @consume({ context: IconsContext}) private Icons!: Icons;
  @consume({ context: activeEntityConf, subscribe: true}) private activeEntityConfig!: EntityConfig;

  public activeSection = DEFAULT_ACTIVE_SECTION
  public activeSubSection = DEFAULT_ACTIVE_SUBSECTION
  private previousSections: string[] = [];
  private previousSubSections: string[] = [];

  private _browserController!: MediaBrowserController;
  private actions!: BrowserActions;

  @state() private searchMediaTypeIcon!: string;
  @state() private searchMediaType: MediaTypes = MediaTypes.TRACK; 
  @state() private searchLibrary = false;
  private searchTerm = '';
  private _searchTimeout!: number;

  @consume({ context: hassExt, subscribe: true})
  public set hass(hass: ExtendedHass) {
    this._hass = hass;
    if (!this.actions) {
      this.actions = new BrowserActions(hass);
    }
  }
  public get hass() {
    return this._hass;
  }

  @consume({ context: browserControllerContext, subscribe: true})
  public set browserController(controller: MediaBrowserController) {
    this._browserController = controller;
  }
  public get browserController() {
    return this._browserController;
  }

  @consume({ context: mediaBrowserConfigContext, subscribe: true})
  public set config(config: MediaBrowserConfig) {
    this._config = config;
  }
  public get config() {
    return this._config;
  }

  @consume({ context: mediaBrowserCardsContext, subscribe: true}) 
  public set cards(cards: newMediaBrowserItemsConfig) {
    if (jsonMatch(this._cards, cards)) {
      return;
    }
    this._cards = cards;
    if (this.activeSection == 'search') {
      this.activeCards = [];
      return;
    } 
    this.setActiveCards();
  }
  public get cards() {
     return this._cards
  }
  private setPreviousSection() {
    this.previousSections.push(this.activeSection);
    this.previousSubSections.push(this.activeSubSection);
  }
  /* eslint-disable 
    @typescript-eslint/no-unsafe-argument,
    @typescript-eslint/no-unsafe-assignment,
  */
  public setActiveCards() {
    const section = this.activeSection;
    const subsection = this.activeSubSection;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const new_cards = [...this.cards[section][subsection]];
    const cur_cards = this.activeCards;
    if (!jsonMatch(new_cards, cur_cards)) {
      this.activeCards = new_cards
    }
  }
  public resetActiveSections() {
    this.activeSection = DEFAULT_ACTIVE_SECTION;
    this.activeSubSection = DEFAULT_ACTIVE_SUBSECTION;
    this.previousSections = [];
    this.previousSubSections = [];
    this.setActiveCards();
  }
  private onServiceSelect = (data: MediaCardData) => {
    if (data.service) {
      void this.actions.actionPlayMediaFromService(
        data.service, 
        this.activeEntityConfig.entity_id
      )
      return;
    }
    void this.actions.actionPlayMedia(
      this.activeEntityConfig.entity_id,
      data.media_content_id,
      data.media_content_type
    )
    this.onMediaSelectedAction();
  }
  private onSectionSelect = (data: MediaCardData) => {
    this.setPreviousSection();
    this.activeSection = data.subtype;
    this.activeSubSection = data.section;
    this.setActiveCards();
  }
  private onItemSelect = (data: MediaCardData) => {
    void this.actions.actionPlayMedia(
      this.activeEntityConfig.entity_id,
      data.media_content_id,
      data.media_content_type
    )
  }
  /* eslint-enable 
    @typescript-eslint/no-unsafe-argument
  */
  private onSelect = (data: MediaCardData) => {
    const funcs = {
      section: this.onSectionSelect,
      item: this.onItemSelect,
      service: this.onServiceSelect
    }
    /* eslint-disable
      @typescript-eslint/no-unsafe-member-access,
      @typescript-eslint/no-unsafe-call,
    */
    const func = funcs[data.type];
    func(data);
    /* eslint-enable
      @typescript-eslint/no-unsafe-member-access,
      @typescript-eslint/no-unsafe-call,
      @typescript-eslint/no-unsafe-assignment,
    */
  }
  private onEnqueue = (data: MediaCardData, enqueue: EnqueueOptions) => {
    /* eslint-disable
      @typescript-eslint/no-unsafe-assignment
    */
    const content_id: string = data.media_content_id;
    const content_type: string = data.media_content_type;
    /* eslint-enable
      @typescript-eslint/no-unsafe-assignment
    */
    if (enqueue == EnqueueOptions.RADIO) {
      void this.actions.actionPlayRadio(
        this.activeEntityConfig.entity_id,
        content_id,
        content_type
      );
      return;
    }
    void this.actions.actionEnqueueMedia(
      this.activeEntityConfig.entity_id,
      content_id,
      content_type,
      enqueue
    )
  }
  private onBack = () => {
    this.activeSection = this.previousSections.pop() ?? DEFAULT_ACTIVE_SECTION;
    this.activeSubSection = this.previousSubSections.pop() ?? DEFAULT_ACTIVE_SUBSECTION;
    this.setActiveCards();
  }
  private onSearchButtonPress = () => {
    this.setPreviousSection();
    if (!this.searchMediaTypeIcon) {
      this.searchMediaTypeIcon = getMediaTypeSvg(MediaTypes.TRACK, this.Icons);
    }
    this.searchTerm = '';
    this.activeSection = 'search';
    this.cards.search = [];
    this.activeCards = this.cards.search;
    
  }
  private onSearchMediaTypeSelect = async (ev: TargetValEventData) => {
    const val = ev.target.value as MediaTypes;
    if (!val) {
      return;
    }
    ev.target.value = '';
    this.searchMediaType = val;
    this.searchMediaTypeIcon = getMediaTypeSvg(val, this.Icons);
    await this.searchMedia()
  }
  private onSearchLibrarySelect = async () => {
    this.searchLibrary = !this.searchLibrary;
    await this.searchMedia()
  }
  private onSearchInput = (ev: TargetValEventData) => {
    const val = ev.target.value.trim();
    if (val.length < SEARCH_TERM_MIN_LENGTH) {
      return;
    }
    this.searchTerm = val;
    if (this._searchTimeout) {
      try {
        clearTimeout(this._searchTimeout)
      } finally {
        this._searchTimeout = 0;
      }
    }
    this._searchTimeout = setTimeout(
      () => {
        this._searchTimeout = 0;
        void this.searchMedia()
      },
      SEARCH_UPDATE_DELAY
    )
  }
  private onFilterType = (ev: TargetValEventData) => {
    const val = ev.target.value;
    if (!val.length) {
      return;
    }
    ev.target.value = ``;
    if (!Object.keys(this.cards).includes(val)) {
      return;
    }
    this.activeSection = val;
    this.activeSubSection = 'main';
    /* eslint-disable-next-line
      @typescript-eslint/no-unsafe-assignment,
      @typescript-eslint/no-unsafe-member-access
    */
    this.activeCards = this.cards[val].main;
  }
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
      DEFAULT_SEARCH_LIMIT
    )
    this.activeCards = cards;    
  }
  private onCardsUpdated = () => {
    if (!this?.activeCards?.length) {
      this.setActiveCards();
    }
  }
  protected renderBrowserCards(): TemplateResult {
    return html`
      <mass-browser-cards
        .onSelectAction=${this.onSelect}
        .onEnqueueAction=${this.onEnqueue}
      ></mass-browser-cards>
    `
  }
  protected renderTitle(): TemplateResult {
    const title = this.activeSection;
    return html`
      <span slot="label" id="title">
        ${title}
      </span>
    `
  }
  protected renderSearchMediaTypeButton(): TemplateResult {
    if (this.activeSection == 'search') {
      const icons = getSearchMediaButtons(this.Icons);
      return html`
        <mass-menu-button
          id="search-media-type-menu"
          class="${this.useExpressive ? `search-media-type-menu-expressive` : ``}"
          .iconPath=${this.searchMediaTypeIcon}
          .initialSelection=${this.searchMediaType}
          .items=${icons}
          .onSelectAction=${this.onSearchMediaTypeSelect}
          fixedMenuPosition
        ></mass-menu-button>
      `
    }
    return html``
  }
  protected renderSearchLibraryButton(): TemplateResult {
    if (this.activeSection == 'search') {
      return html`
        <ha-button
          appearance="plain"
          variant="brand"
          size="medium"
          id="search-favorite-button"
          @click=${this.onSearchLibrarySelect}
          class="button-min"
        >
          <ha-svg-icon
            .path=${this.searchLibrary ? this.Icons.LIBRARY : this.Icons.LIBRARY_OUTLINED}
            class="svg-xs ${this.useExpressive ? `svg-menu-expressive`: ``}"
          ></ha-svg-icon>
        </ha-button>
      `
    }
    return html``
  }
  protected renderSearchBar() {
    const styles_base_url = 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/';
    const darkMode = this.hass.themes.darkMode;
    const styles_url = styles_base_url + (darkMode ? 'dark.css' : 'light.css');
    return html`
      <span slot="end" id="search-input"
      >
        <link rel="stylesheet" href="${styles_url}">
        <sl-input
          placeholder="Search Music Assistant"
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
    `
  }
  protected renderEndButtons(): TemplateResult {
    return html`
      <span slot="end" id="buttons-end">
        <div id="header-buttons-end">
          ${this.renderFilterButton()}
          ${this.renderSearchButton()}
        </div>
      </span>
    `
  }
  protected renderSearchButton(): TemplateResult {
    const hide = this.config.hide.search || this.activeEntityConfig.hide.media_browser.search;
    if (hide) {
      return html``
    }
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        id="button-search"
        class="button-min ${this.useExpressive ? `button-expressive` : ``}"
        @click=${this.onSearchButtonPress}
      >
        <ha-svg-icon
          .path=${this.Icons.SEARCH}
          class="header-icon"
        ></ha-svg-icon>
      </ha-button>
    `  
  }
  protected renderBackButton(): TemplateResult {
    const hide = this.config.hide.back_button || this.activeEntityConfig.hide.media_browser.back_button;
    if (hide) {
      return html``
    }
    return html`
      <span slot="start" id="back-button">
        <ha-button
          appearance="plain"
          variant="brand"
          size="medium"
          id="button-back"
          class="button-min ${this.useExpressive ? `button-expressive` : ``}"
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
  protected renderFilterButton(): TemplateResult {
    const icons = getFilterButtons(this.Icons, this.config);
    const icon = this.Icons.FILTER
    return html`
      <mass-menu-button
        id="filter-menu"
        class="hdr-menu ${this.useExpressive ? `filter-menu-expressive` : ``}"
        .iconPath=${icon}
        .initialSelection=${this.activeSection}
        .items=${icons}
        .onSelectAction=${this.onFilterType}
        fixedMenuPosition
      ></mass-menu-button>
    `
  }
  protected renderSearchHeader(): TemplateResult {
    return html`
      <mass-section-header id="search">
        ${this.renderBackButton()}
        ${this.renderSearchBar()}
      </mass-section-header>
    `
  }
  protected renderSubsectionHeader(): TemplateResult {
    return html`
      <mass-section-header>
        ${this.renderBackButton()}
        ${this.renderTitle()}
        ${this.renderEndButtons()}
      </mass-section-header>
    `
  }
  protected renderMainHeader(): TemplateResult {
    return html`
      <mass-section-header>
        ${this.renderTitle()}
        ${this.renderEndButtons()}
      </mass-section-header>
    `

  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
  protected renderHeader(): TemplateResult {
    if (this.activeSection == "search") {
      return this.renderSearchHeader();
    }
    if (this.activeSection == DEFAULT_ACTIVE_SECTION && this.activeSubSection == DEFAULT_ACTIVE_SUBSECTION) {
      return this.renderMainHeader();
    }
    return this.renderSubsectionHeader();
  }
  protected firstUpdated(): void {
    this.browserController._host.addEventListener('cards-updated', this.onCardsUpdated)
  }
  protected render(): TemplateResult {
    return html`
      <div id="container" class="${this.useExpressive ? `container-expressive` : ``}">
        ${this.renderHeader()}
        <div id="mass-browser" class="${this.useExpressive ? `mass-browser-expressive` : ``}">
          ${this.renderBrowserCards()}
        </div>
      </div>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
