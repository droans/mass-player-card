import { consume } from "@lit/context";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  ConfigMediaTypes,
  DEFAULT_FAVORITE_ITEM_CONFIG,
  FavoriteItemConfig,
  MediaBrowserConfig,
  MediaBrowserHiddenElementsConfig,
} from "../config/media-browser";
import {
  DEFAULT_ACTIVE_SECTION,
  DEFAULT_ACTIVE_SUBSECTION,
  DEFAULT_SEARCH_LIMIT,
  EnqueueConfigMap,
  MediaBrowserSection,
  MediaBrowserSubsection,
  SEARCH_SECTIONS,
  SEARCH_TERM_MIN_LENGTH,
  SEARCH_UPDATE_DELAY,
} from "../const/media-browser";

import "../components/browser-collection-view/browser-album-view";
import "../components/browser-collection-view/browser-artist-view";
import "../components/browser-collection-view/browser-playlist-view";
import "../components/browser-collection-view/browser-podcast-view";
import "../components/section-header/section-header";

import { DirectiveResult } from "lit/directive.js";
import { cache } from "lit/directives/cache.js";
import {
  activeAlbumCollectionContext,
  activeArtistCollectionContext,
  activeEntityConfigContext,
  browserControllerContext,
  EntityConfig,
  hassUIServicesContext,
  IconsContext,
  mediaBrowserCardsContext,
  mediaBrowserConfigContext,
  mediaBrowserHiddenElementsConfigContext,
} from "../const/context";
import { EnqueueOptions, MediaTypes } from "../const/enums";
import { TargetValueEventData } from "../const/events";
import { Icons } from "../const/icons";
import {
  customSectionConfig,
  mediaCardAlbumData,
  mediaCardArtistData,
  mediaCardCollectionType,
  mediaCardData,
  MediaCardItem,
  mediaCardItemData,
  mediaCardPlaylistData,
  mediaCardPodcastData,
  mediaCardServiceData,
  MediaRecommendationSection,
  newMediaBrowserItemsConfig,
  UIServicesHass,
} from "../const/types";
import { MediaBrowserController } from "../controller/browser";
import styles from "../styles/new-media-browser";
import {
  BrowserChip,
  BrowserChips,
  getBrowserChips,
} from "../utils/media-browser";
import { getTranslation } from "../utils/translations";
import { jsonMatch } from "../utils/utility";
// eslint-disable-next-line import/no-duplicates
import { SectionType } from "../components/new-media-browser-cards/media-browser-cards";
// eslint-disable-next-line import/no-duplicates
import "../components/new-media-browser-cards/media-browser-cards";

const MEDIA_TYPE_TRANSLATION_KEYS: Record<ConfigMediaTypes, string> = {
  album: "browser.sections.album",
  artist: "browser.sections.artist",
  audiobook: "browser.sections.audiobook",
  playlist: "browser.sections.playlist",
  podcast: "browser.sections.podcast",
  radio: "browser.sections.radio",
  track: "browser.sections.track",
};

@customElement(`mpc-media-browser`)
export class MediaBrowser extends LitElement {
  @property({ attribute: false }) private _config!: MediaBrowserConfig;
  @property({ attribute: false }) public onMediaSelectedAction!: () => void;
  @property() private activeCollectionData!: mediaCardCollectionType;
  @property()
  private mediaType: ConfigMediaTypes | "" = "";

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
  @state() private customSections: customSectionConfig[] = [];
  @state() private drillCards: MediaCardItem[] = [];
  @state() private drillTitle = "";

  @consume({ context: IconsContext }) private Icons!: Icons;

  private _browserController?: MediaBrowserController;
  private searchTerm = "";
  private _searchTimeout!: number;
  private previousSections: MediaBrowserSection[] = [];
  private previousSubSections: MediaBrowserSubsection[] = [];
  @consume({ context: hassUIServicesContext, subscribe: true })
  private hassUI?: UIServicesHass;

  protected onCardsUpdated = () => {
    this.createChips();
  };

  @consume({ context: mediaBrowserCardsContext, subscribe: true })
  public set cards(cards: newMediaBrowserItemsConfig | undefined) {
    if (cards === this._cards) {
      return;
    }
    this._cards = cards;
    this.createChips();
    this.setActiveCards();
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
    if (!this.mediaType) {
      this.mediaType = config.initial_media_selection;
    }
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
    this.setActiveCards();
  }
  public get browserController() {
    return this._browserController;
  }

  public set chips(chips: BrowserChips) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!chips) {
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

  @consume({ context: activeAlbumCollectionContext, subscribe: true })
  private set activeAlbumCollection(
    collectionData: mediaCardAlbumData | undefined,
  ) {
    if (!collectionData) {
      return;
    }
    this.loadCollection(collectionData);
  }
  @consume({ context: activeArtistCollectionContext, subscribe: true })
  private set activeArtistCollection(
    collectionData: mediaCardArtistData | undefined,
  ) {
    if (!collectionData) {
      return;
    }
    this.loadCollection(collectionData);
  }

  private setActiveCards() {
    if (!this.mediaType || !this.cards || !this.browserController) {
      return;
    }
    const mediaType = this.mediaType;
    this.recentsCards = this.cards.recents[mediaType];
    this.recommendations = this.browserController.getRecommendationsForMedia(
      mediaType as MediaTypes,
    );
    this.customSections = this.browserController.getCustomSectionForMedia(
      mediaType as MediaTypes,
    );
    this.favoriteCards = this.cards.favorites[mediaType];
  }

  private getMediaTypeFavoriteConfig(): FavoriteItemConfig {
    const favoritesConfig = this.config.favorites;
    const configs: Record<ConfigMediaTypes, FavoriteItemConfig> = {
      album: favoritesConfig.albums,
      artist: favoritesConfig.artists,
      audiobook: favoritesConfig.audiobooks,
      playlist: favoritesConfig.playlists,
      podcast: favoritesConfig.podcasts,
      radio: favoritesConfig.radios,
      track: favoritesConfig.tracks,
    };
    if (this.mediaType == "") {
      return DEFAULT_FAVORITE_ITEM_CONFIG;
    }
    return configs[this.mediaType];
  }
  private getMediaTypeRecentsConfig(): FavoriteItemConfig {
    const recentsConfig = this.config.recents;
    const configs: Record<ConfigMediaTypes, FavoriteItemConfig> = {
      album: recentsConfig.albums,
      artist: recentsConfig.artists,
      audiobook: recentsConfig.audiobooks,
      playlist: recentsConfig.playlists,
      podcast: recentsConfig.podcasts,
      radio: recentsConfig.radios,
      track: recentsConfig.tracks,
    };
    if (this.mediaType == "") {
      return DEFAULT_FAVORITE_ITEM_CONFIG;
    }
    return configs[this.mediaType];
  }

  private createChips() {
    if (!this.hassUI || !this.cards) {
      return;
    }
    this.chips = getBrowserChips(
      this.Icons,
      this.hassUI,
      this.config,
      this.cards,
    );
    this.setActiveCards();
  }
  private setPreviousSection() {
    this.previousSections.push(this.activeSection);
    this.previousSubSections.push(this.activeSubSection);
  }

  private async searchMedia() {
    const searchTerm = this.searchTerm;
    if (!this.browserController || !this.cards) {
      return;
    }
    if (searchTerm.length < SEARCH_TERM_MIN_LENGTH) {
      return;
    }
    this.searchLoading = true;
    try {
      const cards = await this.browserController.search(
        this.activeEntityConfig.entity_id,
        searchTerm,
        this.searchLibrary,
        DEFAULT_SEARCH_LIMIT,
      );
      this.cards.search = cards;
      this.searchLoading = false;
    } finally {
      this.searchLoading = false;
    }
  }

  public loadCollection(
    collectionData:
      | mediaCardPlaylistData
      | mediaCardAlbumData
      | mediaCardArtistData
      | mediaCardPodcastData
      | undefined,
  ) {
    if (!collectionData) {
      return;
    }
    this.activeCollectionData = collectionData;
    this.setPreviousSection();
    this.activeSubSection = "collection";
  }

  public resetActiveSections() {
    this.activeSection = DEFAULT_ACTIVE_SECTION;
    this.activeSubSection = DEFAULT_ACTIVE_SUBSECTION;
  }

  private onBack = () => {
    const update =
      this.activeSubSection == "collection" && this.activeSection != "search";
    const currentSection = this.activeSection;
    this.activeSection = this.previousSections.pop() ?? DEFAULT_ACTIVE_SECTION;
    this.activeSubSection =
      this.previousSubSections.pop() ?? DEFAULT_ACTIVE_SUBSECTION;
    if (
      SEARCH_SECTIONS.includes(currentSection) &&
      !SEARCH_SECTIONS.includes(this.activeSection)
    ) {
      this.searchActivated = false;
    }
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
      search: this.cards?.search[sectionId],
    };
    const sectionCards = sectionCardMap[sectionType];
    if (!sectionCards) {
      return;
    }
    this.drillCards = sectionCards;
    this.drillTitle = sectionTitle;
    this.setPreviousSection();
    this.activeSubSection = SEARCH_SECTIONS.includes(this.activeSection)
      ? `drill-search`
      : "drill";
  };
  private onSearchButtonPress = () => {
    this.setPreviousSection();
    if (!this.cards) {
      return;
    }
    this.searchTerm = "";
    this.activeSection = "search";
    this.cards.search = { main: [] };
    this.searchActivated = true;
  };
  protected onMediaTypeSelection = (selection: string) => {
    this.mediaType = selection as ConfigMediaTypes;
    this.setActiveCards();
  };
  private onEnqueue = (
    data: mediaCardPlaylistData,
    enqueue: EnqueueOptions,
  ) => {
    if (!this.browserController?.actions) {
      return;
    }
    const contentId: string = data.media_content_id;
    const contentType = "playlist";
    const user = this.browserController.massUser;
    void this.browserController.actions.actionEnqueueMedia(
      this.activeEntityConfig.entity_id,
      contentId,
      contentType,
      enqueue,
      user,
    );
  };

  private onServiceSelect = (data: mediaCardServiceData) => {
    if (!this.browserController?.actions) {
      return;
    }
    if (data.service) {
      void this.browserController.actions.actionPlayMediaFromService(
        data.service,
        this.activeEntityConfig.entity_id,
      );
      return;
    }
    const enqueue = EnqueueConfigMap[this.config.default_enqueue_option];
    const user = this.browserController.massUser;
    void this.browserController.actions.actionEnqueueMedia(
      this.activeEntityConfig.entity_id,
      data.media_content_id,
      data.media_content_type,
      enqueue,
      user,
    );
    this.onMediaSelectedAction();
  };
  private onItemSelect = (data: mediaCardItemData) => {
    if (!this.browserController?.actions) {
      return;
    }
    const user = this._browserController?.massUser;
    void this.browserController.actions.actionPlayMedia(
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
    if (!this.browserController?.actions) {
      return;
    }
    const contentId: string = data.media_content_id;
    const contentType = "playlist";
    const user = this.browserController.massUser;
    void this.browserController.actions.actionEnqueueMedia(
      this.activeEntityConfig.entity_id,
      contentId,
      contentType,
      enqueue,
      user,
    );
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
    return html`<span slot="label" id="title">My Library</span>`;
  }
  protected renderSearchButton(): TemplateResult {
    if (this.hiddenElements.search_button) {
      return html``;
    }
    return html`
      <mpc-button
        .onPressService=${this.onSearchButtonPress}
        role="tonal"
        size="small"
        elevation="1"
        id="button-search"
        class="button min"
        slot="end"
      >
        <ha-svg-icon .path=${this.Icons.SEARCH} class="svg xs"></ha-svg-icon>
      </mpc-button>
    `;
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
          class="search-library-button button min"
        >
          <ha-svg-icon
            .path=${
              this.searchLibrary
                ? this.Icons.LIBRARY
                : this.Icons.LIBRARY_OUTLINED
            }
            class="svg xs menu"
          ></ha-svg-icon>
        </mpc-button>
      `;
    }
    return html``;
  }
  protected renderSearchBar() {
    if (!this.hassUI) {
      return;
    }
    const stylesBaseUrl =
      "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/";
    const darkMode = this.hassUI.themes.darkMode;
    const stylesUrl = stylesBaseUrl + (darkMode ? "dark.css" : "light.css");
    const placeholder = getTranslation(
      "browser.search.placeholder",
      this.hassUI,
    ) as string;
    return html`
      <span slot="end" id="search-input">
        <link rel="stylesheet" href="${stylesUrl}" />
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
            <div id="search-options">${this.renderSearchLibraryButton()}</div>
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
          class="button min"
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
    if (SEARCH_SECTIONS.includes(this.activeSection)) {
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
      !this.cards ||
      SEARCH_SECTIONS.includes(this.activeSection) ||
      this.activeSubSection == "collection" ||
      this.hiddenElements.chips
    ) {
      return html``;
    }
    const chips = this.chips;
    const chipsHtml = this.config.chip_sort.map((chipName) => {
      const chip = chips[chipName];
      return this.renderChip(chip);
    });
    return html`
      <div id="subsection-buttons">
        <div class="button-group chips">${chipsHtml}</div>
      </div>
    `;
  }
  protected renderAlbumView = (): TemplateResult => {
    return html`
      <mpc-collection-album-view
        class="collection-view"
        .collectionData=${this.activeCollectionData}
        .onEnqueueAction=${this.onPlaylistEnqueue}
      ></mpc-collection-album-view>
    `;
  };
  protected renderArtistView = (): TemplateResult => {
    return html`
      <mpc-collection-artist-view
        class="collection-view"
        .collectionData=${this.activeCollectionData}
        .onEnqueueAction=${this.onPlaylistEnqueue}
        .onCollectionSelectAction=${this.onSelect}
        .onCollectionDrillAction=${this.onDrillDown}
      ></mpc-collection-artist-view>
    `;
  };
  protected renderPodcastView = (): TemplateResult => {
    return html`
      <mpc-collection-podcast-view
        class="collection-view"
        .collectionData=${this.activeCollectionData}
        .onEnqueueAction=${this.onPlaylistEnqueue}
      ></mpc-collection-podcast-view>
    `;
  };
  protected renderPlaylistView = (): TemplateResult => {
    return html`
      <mpc-collection-playlist-view
        class="collection-view"
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
  protected renderCustomSections(): DirectiveResult {
    const sections = this.cards?.custom;
    if (!sections) {
      return html``;
    }
    return sections.map((section) => {
      return html`
        <div class="browser-card-section custom-section">
          <mpc-browser-cards
            title="${section.name}"
            direction="horizontal"
            .onEnqueueAction=${this.onEnqueue}
            .onSelectAction=${this.onSelect}
            .onDrillAction=${this.onDrillDown}
            .cards=${section.cards}
            section-type="recommendation"
            id=${section.name}
          ></mpc-browser-cards>
        </div>
      `;
    });
  }
  protected renderRecommendations(): DirectiveResult {
    if (!this.config.recommendations.enabled) {
      return html``;
    }
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
  protected renderSearchSection(
    translationKey: string,
    id: string,
    cards: MediaCardItem[] | undefined | null,
  ): TemplateResult {
    if (!cards || cards.length === 0) {
      return html``;
    }
    const translation = getTranslation(translationKey, this.hassUI);
    return html`
      <mpc-browser-cards
        title="${translation}"
        id="${id}"
        section-type="search"
        .cards=${cards}
        direction="horizontal"
        .onEnqueueAction=${this.onEnqueue}
        .onSelectAction=${this.onSelect}
        .onDrillAction=${this.onDrillDown}
      ></mpc-browser-cards>
    `;
  }
  protected renderSearch(): DirectiveResult {
    if (this.searchLoading) {
      return html`
        <div class="browser-card-section search">
          <mpc-browser-cards
            title=""
            id=""
            section-type="search"
            hide-drilldown
            .cards=${[]}
            skeleton
          ></mpc-browser-cards>
        </div>
      `;
    }
    if (!this.cards) {
      return html``;
    }
    const cards = this.cards.search;
    const searchOrder = this.config.search_sort;
    const cardsHtml = searchOrder.map((item) => {
      const translationKey = MEDIA_TYPE_TRANSLATION_KEYS[item];
      const mediaCards = cards[item];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if ((mediaCards?.length ?? 0) > 0) {
        return this.renderSearchSection(translationKey, item, mediaCards);
      }
      return html``;
    });
    return html` <div class="browser-card-section search">${cardsHtml}</div> `;
  }
  protected renderRecentsCards(): DirectiveResult {
    const recentsMediaTypeConfig = this.getMediaTypeRecentsConfig();
    if (!this.config.recents.enabled || !recentsMediaTypeConfig.enabled) {
      return html``;
    }
    const translation = getTranslation("browser.label.recents", this.hassUI);
    return html`
      <div class="browser-card-section recents">
        <mpc-browser-cards
          title="🕑 ${translation}"
          id="recents"
          direction="horizontal"
          .onEnqueueAction=${this.onEnqueue}
          .onSelectAction=${this.onSelect}
          .onDrillAction=${this.onDrillDown}
          .cards=${this.recentsCards}
          section-type="recent"
        ></mpc-browser-cards>
      </div>
    `;
  }
  protected renderFavoritesCards(): DirectiveResult {
    const favoritesMediaTypeConfig = this.getMediaTypeFavoriteConfig();
    if (!this.config.recents.enabled || !favoritesMediaTypeConfig.enabled) {
      return html``;
    }
    const translation = getTranslation("browser.label.favorites", this.hassUI);
    return html`
      <div class="browser-card-section favorites">
        <mpc-browser-cards
          title="❤️ ${translation}"
          id="favorite"
          direction="horizontal"
          .onEnqueueAction=${this.onEnqueue}
          .onSelectAction=${this.onSelect}
          .onDrillAction=${this.onDrillDown}
          .cards=${this.favoriteCards}
          section-type="favorite"
        ></mpc-browser-cards>
      </div>
    `;
  }

  protected renderBrowserCards(): DirectiveResult {
    if (this.searchActivated && this.activeSubSection != "drill-search") {
      return this.renderSearch();
    }
    const isCollectionView =
      this.activeSubSection == "collection" &&
      !SEARCH_SECTIONS.includes(this.activeSection);
    if (isCollectionView) {
      return this.renderCollectionView();
    }
    const isDrillDown = ["drill", "drill-search"].includes(
      this.activeSubSection,
    );
    if (isDrillDown) {
      return this.renderDrillDown();
    }
    return html`
      <div class="browser-cards">
        ${this.renderFavoritesCards()} ${this.renderRecentsCards()}
        ${this.renderCustomSections()} ${this.renderRecommendations()}
      </div>
    `;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
  protected render(): TemplateResult {
    return html`
      <div id="container" class="container">
        ${this.renderHeader()}
        <div id="mass-browser" class="mass-browser">
          ${this.renderChips()} ${this.renderBrowserCards()}
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
