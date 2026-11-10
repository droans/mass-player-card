import "@shoelace-style/shoelace/dist/components/input/input.js";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import {
  MediaBrowserConfig,
  MediaBrowserHiddenElementsConfig,
} from "../config/media-browser";
import { customElement, property, state } from "lit/decorators.js";
import {
  DEFAULT_ACTIVE_SECTION,
  DEFAULT_ACTIVE_SUBSECTION,
  DEFAULT_SEARCH_LIMIT,
  EnqueueConfigMap,
  getSearchMediaButtons,
  MediaBrowserSection,
  MediaBrowserSubsection,
  SEARCH_SECTIONS,
  SEARCH_TERM_MIN_LENGTH,
  SEARCH_UPDATE_DELAY,
} from "../const/media-browser";
import { consume } from "@lit/context";

import "../components/section-header/section-header";
import "../components/browser-collection-view/browser-playlist-view";
import "../components/browser-collection-view/browser-album-view";
import "../components/browser-collection-view/browser-artist-view";
import "../components/browser-collection-view/browser-podcast-view";

import {
  activeEntityConfigContext,
  browserControllerContext,
  EntityConfig,
  hassContext,
  IconsContext,
  mediaBrowserCardsContext,
  mediaBrowserConfigContext,
  mediaBrowserHiddenElementsConfigContext,
} from "../const/context";
import { Icons } from "../const/icons";
import { jsonMatch } from "../utils/utility";
import {
  ExtendedHass,
  mediaCardCollectionType,
  mediaCardData,
  MediaCardItem,
  mediaCardItemData,
  mediaCardPlaylistData,
  mediaCardServiceData,
  MediaRecommendationSection,
  newMediaBrowserItemsConfig,
} from "../const/types";
import BrowserActions from "../actions/browser-actions";
import styles from "../styles/new-media-browser";
import {
  BrowserChip,
  BrowserChips,
  getBrowserChips,
} from "../utils/media-browser";
import { EnqueueOptions, MediaTypes } from "../const/enums";
import { MediaBrowserController } from "../controller/browser";
import { DirectiveResult } from "lit/directive.js";
import { cache } from "lit/directives/cache.js";
import { getMediaTypeSvg } from "../utils/thumbnails";
import { MenuButtonEventData, TargetValueEventData } from "../const/events";
import { getTranslation } from "../utils/translations";
// eslint-disable-next-line import/no-duplicates
import { SectionType } from "../components/new-media-browser-cards/media-browser-cards";
// eslint-disable-next-line import/no-duplicates
import "../components/new-media-browser-cards/media-browser-cards";

@customElement(`mpc-media-browser`)
export class MediaBrowser extends LitElement {
  @property({ attribute: false }) private _config!: MediaBrowserConfig;
  @property({ attribute: false }) public onMediaSelectedAction!: () => void;
  @property() private activeCollectionData!: mediaCardCollectionType;
  @property()
  private mediaType = "";

  @consume({
    context: mediaBrowserHiddenElementsConfigContext,
    subscribe: true,
  })
  private hiddenElements!: MediaBrowserHiddenElementsConfig;

  @state()
  private _activeEntityConfig!: EntityConfig;

  @state() public _cards?: newMediaBrowserItemsConfig;

  @state()
  public activeSection: MediaBrowserSection = DEFAULT_ACTIVE_SECTION;
  @state()
  public activeSubSection: MediaBrowserSubsection = DEFAULT_ACTIVE_SUBSECTION;
  @state()
  private _chips!: BrowserChips;
  @state()
  private recentsCards: MediaCardItem[] = [];
  @state()
  private favoriteCards: MediaCardItem[] = [];
  @state() private searchActivated = false;
  @state() private searchLoading = false;
  @state() private searchLibrary = false;
  @state() private recommendations: MediaRecommendationSection[] = [];
  @state() private drillCards: MediaCardItem[] = [];
  @state() private drillTitle = "";

  @consume({ context: IconsContext }) private Icons!: Icons;

  private _hass?: ExtendedHass;
  private actions?: BrowserActions;
  private _browserController?: MediaBrowserController;
  private searchTerm = "";
  private _searchTimeout!: number;
  private previousSections: MediaBrowserSection[] = [];
  private previousSubSections: MediaBrowserSubsection[] = [];
  private _cardsJSON = "{}";
  @state() private searchMediaTypeIcon!: string;
  @state() private searchMediaType: MediaTypes = MediaTypes.TRACK;

  @consume({ context: hassContext, subscribe: true })
  public set hass(hass: ExtendedHass | undefined) {
    if (!hass) {
      return;
    }
    this._hass = hass;
    this.actions ??= new BrowserActions(hass);
  }
  public get hass() {
    return this._hass;
  }

  protected onCardsUpdated = () => {
    this.createChips();
  };

  @consume({ context: mediaBrowserCardsContext, subscribe: true })
  public set cards(cards: newMediaBrowserItemsConfig | undefined) {
    if (jsonMatch(JSON.parse(this._cardsJSON), cards)) {
      return;
    }
    this._cards = cards;
    this._cardsJSON = JSON.stringify(this._cards);
    this.createChips();
  }
  public get cards() {
    return this._cards;
  }
  @consume({ context: mediaBrowserConfigContext, subscribe: true })
  public set config(config: MediaBrowserConfig) {
    if (jsonMatch(config, this._config)) {
      return;
    }
    this._config = config;
    this.activeSection = config.default_section;
    this.createChips();
  }
  public get config() {
    return this._config;
  }

  @consume({ context: browserControllerContext, subscribe: true })
  public set browserController(controller: MediaBrowserController | undefined) {
    if (!controller) {
      return;
    }
    this._browserController = controller;
  }
  public get browserController() {
    return this._browserController;
  }

  public set chips(chips: BrowserChips) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!chips || jsonMatch(chips, this._chips)) {
      return;
    }
    this._chips = chips;
    this.requestUpdate("chips", "updated");
  }
  public get chips() {
    return this._chips;
  }

  @consume({ context: activeEntityConfigContext, subscribe: true })
  private set activeEntityConfig(config: EntityConfig) {
    this._activeEntityConfig = config;
  }
  private get activeEntityConfig() {
    return this._activeEntityConfig;
  }

  private createChips() {
    if (!this.hass || !this.cards) {
      return;
    }
    this.chips = getBrowserChips(
      this.Icons,
      this.hass,
      this.config,
      this.cards,
    );
  }
  private setPreviousSection() {
    this.previousSections.push(this.activeSection);
    this.previousSubSections.push(this.activeSubSection);
  }

  private async searchMedia() {
    const search_term = this.searchTerm;
    if (!this.browserController || !this.cards) {
      return;
    }
    if (search_term.length < SEARCH_TERM_MIN_LENGTH) {
      return;
    }
    this.searchLoading = true;
    try {
      const cards = await this.browserController.search(
        this.activeEntityConfig.entity_id,
        search_term,
        this.searchMediaType,
        this.searchLibrary,
        DEFAULT_SEARCH_LIMIT,
      );
      this.cards.search = cards;
      this.searchLoading = false;
    } finally {
      this.searchLoading = false;
    }
  }
  private onBack = () => {
    const update =
      this.activeSubSection == "collection" && this.activeSection != "search";

    this.activeSection = this.previousSections.pop() ?? DEFAULT_ACTIVE_SECTION;
    this.activeSubSection =
      this.previousSubSections.pop() ?? DEFAULT_ACTIVE_SUBSECTION;
    if (update) {
      this.requestUpdate("collections", "back");
    }
  };
  private onDrillDown = (
    sectionType: SectionType,
    sectionId: string,
    sectionTitle: string,
  ) => {
    if (sectionType == "recommendation") {
      const recommendation = this.recommendations.find((rec) => {
        return rec.title == sectionId;
      });
      if (!recommendation) {
        return;
      }
      this.drillCards = recommendation.items;
      this.drillTitle = sectionTitle;
      this.setPreviousSection();
      this.activeSubSection = "drill";
      return;
    }
    const sectionCardMap: Partial<
      Record<SectionType, MediaCardItem[] | undefined>
    > = {
      favorite: this.cards?.favorites[this.mediaType],
      recent: this.cards?.recents[this.mediaType],
    };
    const sectionCards = sectionCardMap[sectionType];
    if (!sectionCards) {
      return;
    }
    this.drillCards = sectionCards;
    this.drillTitle = sectionTitle;
    this.setPreviousSection();
    this.activeSubSection = "drill";
  };
  private onSearchButtonPress = () => {
    if (!this.hass) {
      return;
    }
    this.setPreviousSection();
    if (!this.cards) {
      return;
    }
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
    this.searchActivated = true;
  };
  protected onMediaTypeSelection = (selection: string) => {
    this.mediaType = selection;
    this.recentsCards = this.cards?.recents[selection] ?? [];
    this.favoriteCards = this.cards?.favorites[selection] ?? [];
    if (this.browserController) {
      const usedSelection = selection == `track` ? `service` : selection;
      this.recommendations = this.browserController.getRecommendationsForMedia(
        usedSelection as MediaTypes,
      );
    }
  };
  private onEnqueue = (
    data: mediaCardPlaylistData,
    enqueue: EnqueueOptions,
  ) => {
    if (!this.actions) {
      return;
    }
    const content_id: string = data.media_content_id;
    const content_type = "playlist";
    const user = this.browserController?.massUser;
    void this.actions.actionEnqueueMedia(
      this.activeEntityConfig.entity_id,
      content_id,
      content_type,
      enqueue,
      user,
    );
  };

  private onServiceSelect = (data: mediaCardServiceData) => {
    if (!this.actions) {
      return;
    }
    if (data.service) {
      void this.actions.actionPlayMediaFromService(
        data.service,
        this.activeEntityConfig.entity_id,
      );
      return;
    }
    const enqueue = EnqueueConfigMap[this.config.default_enqueue_option];
    const user = this.browserController?.massUser;
    void this.actions.actionEnqueueMedia(
      this.activeEntityConfig.entity_id,
      data.media_content_id,
      data.media_content_type,
      enqueue,
      user,
    );
    this.onMediaSelectedAction();
  };
  private onItemSelect = (data: mediaCardItemData) => {
    if (!this.actions) {
      return;
    }
    const user = this._browserController?.massUser;
    void this.actions.actionPlayMedia(
      this.activeEntityConfig.entity_id,
      data.media_content_id,
      data.media_content_type,
      user,
    );
  };
  private onCollectionSelect = (data: mediaCardCollectionType) => {
    this.activeCollectionData = data;
    this.setPreviousSection();
    this.activeSubSection = "collection";
    if (SEARCH_SECTIONS.includes(this.activeSection)) {
      this.activeSection = "search-collection";
    }
    this.searchActivated = false;
    this.requestUpdate("collection", "selected");
  };
  private onSelect = (data: mediaCardData) => {
    const funcs = {
      // section: this.onSectionSelect,
      item: this.onItemSelect,
      service: this.onServiceSelect,
      playlist: this.onCollectionSelect,
      album: this.onCollectionSelect,
      artist: this.onCollectionSelect,
      podcast: this.onCollectionSelect,
    };
    const function_ = funcs[data.type as string] as (
      data: mediaCardData,
    ) => void;
    if (["playlist", "album", "artist"].includes(data.type)) {
      this.onCollectionSelect(data as mediaCardCollectionType);
      return;
    }
    function_(data);
  };
  private onPlaylistEnqueue = (
    data: mediaCardPlaylistData,
    enqueue: EnqueueOptions,
  ) => {
    if (!this.actions) {
      return;
    }
    const content_id: string = data.media_content_id;
    const content_type = "playlist";
    const user = this.browserController?.massUser;
    void this.actions.actionEnqueueMedia(
      this.activeEntityConfig.entity_id,
      content_id,
      content_type,
      enqueue,
      user,
    );
  };
  private onSearchMediaTypeSelect = async (event_: MenuButtonEventData) => {
    if (!this.hass) {
      return;
    }
    const value = event_.detail.option as MediaTypes;
    this.searchMediaType = value;
    this.searchMediaTypeIcon = getMediaTypeSvg(value, this.Icons, this.hass);
    await this.searchMedia();
  };
  private onSearchLibrarySelect = async () => {
    this.searchLibrary = !this.searchLibrary;
    await this.searchMedia();
  };
  private onSearchInput = (event_: TargetValueEventData) => {
    const value = event_.target.value.trim();
    if (value.length < SEARCH_TERM_MIN_LENGTH) {
      return;
    }
    this.searchTerm = value;
    if (this._searchTimeout) {
      try {
        clearTimeout(this._searchTimeout);
      } finally {
        this._searchTimeout = 0;
      }
    }
    this._searchTimeout = window.setTimeout(() => {
      this._searchTimeout = 0;
      void this.searchMedia();
    }, SEARCH_UPDATE_DELAY);
  };

  protected renderTitle(): TemplateResult {
    if (this.hiddenElements.header_title) {
      return html``;
    }
    return html`<span slot="label" id="title">${this.activeSection}</span>`;
  }
  protected renderSearchButton(): TemplateResult {
    if (this.hiddenElements.search_button) {
      return html``;
    }
    return html`
      <mpc-button
        .onPressService=${this.onSearchButtonPress}
        role="filled"
        size="small"
        elevation="1"
        id="button-search"
        class="button min expressive"
        slot="end"
      >
        <ha-svg-icon .path=${this.Icons.SEARCH} class="svg xs"></ha-svg-icon>
      </mpc-button>
    `;
  }
  protected renderSearchMediaTypeButton(): TemplateResult {
    if (!this.hass) {
      return html``;
    }
    if (SEARCH_SECTIONS.includes(this.activeSection)) {
      const icons = getSearchMediaButtons(this.Icons, this.hass);
      return html`
        <mpc-menu-button
          id="search-media-type-menu"
          class="search-media-type-menu expressive"
          scheme="plain"
          elevation="-1"
          .iconPath=${this.searchMediaTypeIcon}
          .initialSelection=${this.searchMediaType}
          .items=${icons}
          @menu-item-selected=${this.onSearchMediaTypeSelect}
          fixedMenuPosition
        ></mpc-menu-button>
      `;
    }
    return html``;
  }
  protected renderSearchLibraryButton(): TemplateResult {
    if (SEARCH_SECTIONS.includes(this.activeSection)) {
      return html`
        <mpc-button
          .onPressService=${this.onSearchLibrarySelect}
          role="plain"
          size="small"
          elevation="-1"
          id="search-favorite-button"
          class="search-library-button button min expressive"
        >
          <ha-svg-icon
            .path=${
              this.searchLibrary
                ? this.Icons.LIBRARY
                : this.Icons.LIBRARY_OUTLINED
            }
            class="svg xs menu expressive"
          ></ha-svg-icon>
        </mpc-button>
      `;
    }
    return html``;
  }
  protected renderSearchBar() {
    if (!this.hass) {
      return;
    }
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
  protected renderBackButton(): TemplateResult {
    const hide = this.hiddenElements.back_button;
    if (hide) {
      return html``;
    }
    return html`
      <span slot="start" id="back-button">
        <mpc-button
          .onPressService=${this.onBack}
          role="filled"
          size="small"
          elevation="1"
          id="button-back"
          class="button min expressive"
        >
          <ha-svg-icon
            .path=${this.Icons.ARROW_LEFT}
            class="header-icon"
          ></ha-svg-icon>
        </mpc-button>
      </span>
    `;
  }
  protected renderCollectionHeader(): TemplateResult {
    return html`
      <mpc-section-header>
        ${this.renderBackButton()} ${this.renderTitle()}
        ${this.renderSearchButton()}
      </mpc-section-header>
    `;
  }
  protected renderSearchHeader(): TemplateResult {
    return html`
      <mpc-section-header id="search">
        ${this.renderBackButton()} ${this.renderSearchBar()}
      </mpc-section-header>
    `;
  }
  protected renderBaseHeader(): TemplateResult {
    return html`
      <mpc-section-header>
        ${this.renderTitle()} ${this.renderSearchButton()}
      </mpc-section-header>
    `;
  }
  protected renderHeader(): TemplateResult {
    if (this.hiddenElements.header) {
      return html``;
    }
    if (["search", "search-collection"].includes(this.activeSection)) {
      return this.renderSearchHeader();
    }
    if (["collection", "drill"].includes(this.activeSubSection)) {
      return this.renderCollectionHeader();
    }
    return this.renderBaseHeader();
  }
  protected renderChip(chip: BrowserChip): TemplateResult {
    if (!chip.enabled) {
      return html``;
    }
    return html`
      <mpc-button
        .onPressService=${() => {
          this.onMediaTypeSelection(chip.name);
        }}
        role="${this.mediaType == chip.name ? `filled` : `accent`}"
        size="small"
        elevation="1"
        class="button chip"
      >
        <ha-svg-icon
          class="chip-icon"
          slot="start"
          .path=${chip.icon}
        ></ha-svg-icon>
        <div class="chip-title">${chip.title}</div>
      </mpc-button>
    `;
  }
  protected renderChips(): TemplateResult {
    if (
      !this.hass ||
      !this.cards ||
      ["search", "search-collection"].includes(this.activeSection) ||
      this.activeSubSection == "collection"
    ) {
      return html``;
    }
    const chips = this.chips;
    return html`
      <div class="button-group chips">
        ${this.renderChip(chips.playlist)} ${this.renderChip(chips.artist)}
        ${this.renderChip(chips.album)} ${this.renderChip(chips.track)}
        ${this.renderChip(chips.podcast)} ${this.renderChip(chips.radio)}
        ${this.renderChip(chips.audiobook)}
      </div>
    `;
  }
  protected renderAlbumView = (): TemplateResult => {
    return html`
      <mpc-collection-album-view
        .collectionData=${this.activeCollectionData}
        .onEnqueueAction=${this.onPlaylistEnqueue}
      ></mpc-collection-album-view>
    `;
  };
  protected renderArtistView = (): TemplateResult => {
    return html`
      <mpc-collection-artist-view
        .collectionData=${this.activeCollectionData}
        .onEnqueueAction=${this.onPlaylistEnqueue}
      ></mpc-collection-artist-view>
    `;
  };
  protected renderPodcastView = (): TemplateResult => {
    return html`
      <mpc-collection-podcast-view
        .collectionData=${this.activeCollectionData}
        .onEnqueueAction=${this.onPlaylistEnqueue}
      ></mpc-collection-podcast-view>
    `;
  };
  protected renderPlaylistView = (): TemplateResult => {
    return html`
      <mpc-collection-playlist-view
        .collectionData=${this.activeCollectionData}
        .onEnqueueAction=${this.onPlaylistEnqueue}
      ></mpc-collection-playlist-view>
    `;
  };
  protected renderCollectionView(): DirectiveResult {
    const collectionType = this.activeCollectionData.type;
    return cache(
      {
        album: this.renderAlbumView,
        artist: this.renderArtistView,
        playlist: this.renderPlaylistView,
        podcast: this.renderPodcastView,
      }[collectionType](),
    );
  }
  protected renderRecommendations(): TemplateResult[] {
    const recs = this.recommendations;
    return recs.map((rec) => {
      return html`
        <div class="browser-card-section recommendations">
          <mpc-browser-cards
            title="✨ ${rec.title}"
            direction="horizontal"
            .onEnqueueAction=${this.onEnqueue}
            .onSelectAction=${this.onSelect}
            .onDrillAction=${this.onDrillDown}
            .cards=${rec.items}
            section-type="recommendation"
            id=${rec.title}
          ></mpc-browser-cards>
        </div>
      `;
    });
  }
  protected renderDrillDown(): DirectiveResult {
    return html`
      <div class="browser-card-section drill">
        <mpc-browser-cards
          title=${this.drillTitle}
          direction="vertical"
          .onEnqueueAction=${this.onEnqueue}
          .onSelectAction=${this.onSelect}
          .cards=${this.drillCards}
          section-type="drill"
        ></mpc-browser-cards>
      </div>
    `;
  }
  protected renderBrowserCards(): DirectiveResult {
    /* eslint-disable unicorn/template-indent */
    const isCollectionView =
      this.activeSubSection == "collection" &&
      !["search", "search-collection"].includes(this.activeSection);
    if (isCollectionView) {
      return this.renderCollectionView();
    }
    const isDrillDown = this.activeSubSection == "drill";
    if (isDrillDown) {
      return this.renderDrillDown();
    }
    const recommendationsHtml = this.config.recommendations.enabled
      ? this.renderRecommendations()
      : html``;
    const recentsHtml = this.config.recents.enabled
      ? html`
          <div class="browser-card-section recents">
            <mpc-browser-cards
              title="🕑 Recently Played"
              id="recents"
              direction="horizontal"
              .onEnqueueAction=${this.onEnqueue}
              .onSelectAction=${this.onSelect}
              .onDrillAction=${this.onDrillDown}
              .cards=${this.recentsCards}
              section-type="recent"
            ></mpc-browser-cards>
          </div>
        `
      : html``;

    const favoritesHtml = this.config.recents.enabled
      ? html`
          <div class="browser-card-section favorites">
            <mpc-browser-cards
              title="Your Favorites"
              id="favorite"
              direction="horizontal"
              .onEnqueueAction=${this.onEnqueue}
              .onSelectAction=${this.onSelect}
              .onDrillAction=${this.onDrillDown}
              .cards=${this.favoriteCards}
              section-type="favorite"
            ></mpc-browser-cards>
          </div>
        `
      : html``;
    return html`
      <div class="browser-cards">
        ${recentsHtml} ${favoritesHtml} ${recommendationsHtml}
      </div>
    `;
    /* eslint-enable unicorn/template-indent */
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
  protected render(): TemplateResult {
    return html`
      <div id="container" class="container expressive">
        ${this.renderHeader()}
        <div id="mass-browser" class="mass-browser expressive">
          <div id="subsection-buttons">${this.renderChips()}</div>
          ${this.renderBrowserCards()}
        </div>
      </div>
    `;
  }

  connectedCallback(): void {
    // eslint-disable-next-line listeners/no-missing-remove-event-listener
    this.addEventListener("cards-full-updated", this.onCardsUpdated);
    super.connectedCallback();
  }
  disconnectedCallback(): void {
    this.removeEventListener("cards-full-updated", this.onCardsUpdated);
    super.disconnectedCallback();
  }

  static get styles() {
    return styles;
  }
}
