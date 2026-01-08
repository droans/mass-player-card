import { ContextProvider } from "@lit/context";
import BrowserActions from "../actions/browser-actions";
import { Config } from "../config/config";
import {
  customSection,
  FavoriteItemConfig,
  MediaBrowserConfig,
} from "../config/media-browser";
import { MediaTypes, Thumbnail } from "../const/enums";
import { DEFAULT_SEARCH_LIMIT } from "../const/media-browser";
import {
  generateCustomSectionCards,
  generateFavoriteCard,
  generateFavoritesSectionCards,
  generateRecentsCard,
  generateRecommendationsCard,
  generateRecommendationSectionCards,
} from "../utils/media-browser";
import { mediaBrowserCardsContext } from "../const/context";
import { jsonMatch } from "../utils/utility";
import { CardsUpdatedEventDetail } from "../const/events";
import {
  ExtendedHass,
  MediaCardItem,
  MediaLibraryItem,
  newMediaBrowserItemsConfig,
  RecommendationSection,
} from "../const/types";

export class MediaBrowserController {
  private hass!: ExtendedHass;
  private config!: Config;
  public _host!: HTMLElement;
  private browserConfig!: MediaBrowserConfig;
  private actions!: BrowserActions;
  private _activeEntityId!: string;
  private _items!: ContextProvider<typeof mediaBrowserCardsContext>;
  private _updatingCards = false;
  constructor(
    hass: ExtendedHass,
    config: Config,
    activeEntityId: string,
    host: HTMLElement,
  ) {
    this.hass = hass;
    this.config = config;
    this._host = host;
    this._items = new ContextProvider(host, {
      context: mediaBrowserCardsContext,
      initialValue: {
        favorites: { main: [] },
        recents: { main: [] },
        recommendations: { main: [] },
        search: [],
      },
    });
    this.actions = new BrowserActions(hass);
    this.browserConfig = config.media_browser;
    this.activeEntityId = activeEntityId;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.items) {
      this.resetAndGenerateSections();
    }
  }
  private set items(items: newMediaBrowserItemsConfig) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!items) {
      return;
    }
    if (jsonMatch(this._items.value, items)) {
      return;
    }
    const x = { ...items };
    this._items.setValue(x);
  }
  public get items() {
    return this._items.value;
  }
  private resetAndGenerateSections() {
    if (this._updatingCards) {
      return;
    }
    this._updatingCards = true;
    this.items = {
      favorites: { main: [] },
      recents: { main: [] },
      recommendations: { main: [] },
      search: [],
    };
    this.generateAllSections();
  }
  public generateAllSections() {
    const promises = [
      this.generateAllFavorites(),
      this.generateAllRecents(),
      this.generateAllRecommendations(),
    ];
    void Promise.all(promises)
      .then(() => {
        this.generateCustomSections();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.items) {
          return;
        }
        const data: CardsUpdatedEventDetail = {
          section: "all",
          cards: this.items,
        };
        const ev = new CustomEvent("cards-updated", { detail: data });
        this._host.dispatchEvent(ev);
      })
      .finally(() => {
        this._updatingCards = false;
      });
  }

  public set activeEntityId(entityId: string) {
    if (entityId == this._activeEntityId) {
      return;
    }
    this._activeEntityId = entityId;
    this.resetAndGenerateSections();
  }
  public get activeEntityId() {
    return this._activeEntityId;
  }

  public async search(
    player_entity_id: string,
    search_term: string,
    media_type: MediaTypes,
    library_only = false as boolean,
    limit: number = DEFAULT_SEARCH_LIMIT,
  ) {
    const search_result = await this.actions.actionSearchMedia(
      player_entity_id,
      search_term,
      media_type,
      library_only,
      limit,
    );
    return generateFavoritesSectionCards(search_result, media_type);
  }

  // Favorites
  private async generateAllFavorites() {
    const favorites = this.browserConfig.favorites;
    const promises = [
      this.generateFavoriteData(favorites.albums, MediaTypes.ALBUM),
      this.generateFavoriteData(favorites.artists, MediaTypes.ARTIST),
      this.generateFavoriteData(favorites.audiobooks, MediaTypes.AUDIOBOOK),
      this.generateFavoriteData(favorites.playlists, MediaTypes.PLAYLIST),
      this.generateFavoriteData(favorites.podcasts, MediaTypes.PODCAST),
      this.generateFavoriteData(favorites.radios, MediaTypes.RADIO),
      this.generateFavoriteData(favorites.tracks, MediaTypes.TRACK),
    ];
    await Promise.all(promises);
    const data: CardsUpdatedEventDetail = {
      section: "favorites",
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
      cards: this.items!.favorites!,
    };
    const ev = new CustomEvent("cards-updated", { detail: data });
    this._host.dispatchEvent(ev);
  }
  private async getFavoriteSection(
    config: FavoriteItemConfig,
    media_type: MediaTypes,
    favorites_only = true,
  ) {
    const limit = config.limit;
    const custom_items = config.items;
    const resp: MediaLibraryItem[] = await this.actions.actionGetLibrary(
      this.activeEntityId,
      media_type,
      limit,
      favorites_only ? true : null,
    );
    return [
      ...generateFavoritesSectionCards(resp, media_type),
      ...generateCustomSectionCards(custom_items),
    ];
  }
  private async generateFavoriteData(
    config: FavoriteItemConfig,
    media_type: MediaTypes,
    favorites_only = true,
  ) {
    if (
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain, @typescript-eslint/no-unnecessary-condition
      (this.items?.favorites ?? {})[media_type] ||
      !config.enabled
    ) {
      return;
    }
    const items = await this.getFavoriteSection(
      config,
      media_type,
      favorites_only,
    );
    if (!items.length) {
      return;
    }
    const i = { ...this.items };
    i.favorites[media_type] = items;
    const card = generateFavoriteCard(this.hass, media_type, items);
    i.favorites.main.push(card);
    this.items = { ...i };
  }

  // Recents
  private async generateAllRecents() {
    const recents = this.browserConfig.recents;
    const promises = [
      this.generateRecentsData(recents.albums, MediaTypes.ALBUM),
      this.generateRecentsData(recents.artists, MediaTypes.ARTIST),
      this.generateRecentsData(recents.audiobooks, MediaTypes.AUDIOBOOK),
      this.generateRecentsData(recents.playlists, MediaTypes.PLAYLIST),
      this.generateRecentsData(recents.podcasts, MediaTypes.PODCAST),
      this.generateRecentsData(recents.radios, MediaTypes.RADIO),
      this.generateRecentsData(recents.tracks, MediaTypes.TRACK),
    ];
    await Promise.all(promises);
    const data: CardsUpdatedEventDetail = {
      section: "recents",
      cards: this.items.recents,
    };
    const ev = new CustomEvent("cards-updated", { detail: data });
    this._host.dispatchEvent(ev);
  }
  private async getRecentSection(
    config: FavoriteItemConfig,
    media_type: MediaTypes,
  ) {
    const limit = config.limit;
    const resp: MediaLibraryItem[] = await this.actions.actionGetLibraryRecents(
      this.activeEntityId,
      media_type,
      limit,
    );
    const items = generateFavoritesSectionCards(resp, media_type);
    return [...items];
  }
  private async generateRecentsData(
    config: FavoriteItemConfig,
    media_type: MediaTypes,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.items.recents[media_type] || !config.enabled) {
      return;
    }

    const items = await this.getRecentSection(config, media_type);
    if (items.length) {
      const card = generateRecentsCard(this.hass, media_type, items);
      const i = { ...this.items };
      i.recents.main.push(card);
      i.recents[media_type] = items;
      this.items = { ...i };
    }
  }

  //Recommendations
  private generateRecommendationSection(section: RecommendationSection) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.items.recommendations[section.name]) {
      return;
    }
    const items = generateRecommendationSectionCards(section);
    if (items.length) {
      const card = generateRecommendationsCard(this.hass, section, items);
      const i = { ...this.items };
      i.recommendations.main.push(card);
      i.recommendations[section.name] = items;
      this.items = { ...i };
    }
  }
  private async generateAllRecommendations() {
    const providers = this.browserConfig.recommendations.providers ?? null;
    const data = await this.actions.actionGetRecommendations(
      this.activeEntityId,
      providers,
    );
    const resp = data.response.response;
    resp.forEach((item) => {
      this.generateRecommendationSection(item);
    });
    const detail: CardsUpdatedEventDetail = {
      section: "recommendations",
      cards: this.items.recommendations,
    };
    const ev = new CustomEvent("cards-updated", { detail });
    this._host.dispatchEvent(ev);
  }

  //Custom Sections
  private generateCustomSections() {
    this.browserConfig.sections.forEach((item) => {
      this.generateCustomSectionData(item);
    });
  }
  private generateCustomSectionData(config: customSection) {
    const section_card: MediaCardItem = {
      title: config.name,
      thumbnail: config.image,
      fallback: Thumbnail.CLEFT,
      data: {
        type: "section",
        subtype: "favorites",
        section: `custom-${config.name}`,
      },
    };
    const cards = generateCustomSectionCards(config.items);
    const i = { ...this.items };
    i.favorites[`custom-${config.name}`] = cards;
    i.favorites.main.push(section_card);
    this.items = { ...i };
  }
  public disconnected() {
    return;
  }
  public reconnected(hass: ExtendedHass) {
    this.hass = hass;
    this.resetAndGenerateSections();
  }
}
