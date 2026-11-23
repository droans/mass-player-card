import { ContextProvider } from "@lit/context";
import { getUserInfoWSResponseSchema } from "mass-queue-types/packages/mass_queue/ws/get_user_info";
import BrowserActions from "../actions/browser-actions";
import { Config } from "../config/config";
import {
  customSection,
  DEFAULT_FAVORITES_ONLY,
  FavoriteItemConfig,
  MediaBrowserConfig,
} from "../config/media-browser";
import {
  activeAlbumCollectionContext,
  activeArtistCollectionContext,
  mediaBrowserCardsContext,
} from "../const/context";
import { MediaTypes, Thumbnail } from "../const/enums";
import { CardsUpdatedEventDetail } from "../const/events";
import { DEFAULT_SEARCH_LIMIT } from "../const/media-browser";
import {
  ExtendedHass,
  mediaBrowserSectionConfig,
  mediaCardAlbumData,
  mediaCardArtistData,
  MediaCardItem,
  MediaLibraryItem,
  MediaRecommendationSection,
  newMediaBrowserItemsConfig,
  RecommendationSection,
} from "../const/types";
import {
  generateCardFromAlbum,
  generateCardFromArtist,
  generateCustomSectionCards,
  generateFavoriteCard,
  generateFavoritesSectionCards,
  generateRecentsCard,
  generateRecommendationsCard,
  generateRecommendationSectionCards,
} from "../utils/media-browser";

export class MediaBrowserController {
  public hass!: ExtendedHass;
  private config!: Config;
  public _host!: HTMLElement;
  private browserConfig!: MediaBrowserConfig;
  public actions!: BrowserActions;
  private _activeEntityId!: string;
  private _items!: ContextProvider<typeof mediaBrowserCardsContext>;
  private _updatingCards = false;
  private _massUser?: string | null;
  private _massUserInfo?: getUserInfoWSResponseSchema;
  private _activeAlbumCollectionData: ContextProvider<
    typeof activeAlbumCollectionContext
  >;
  private _activeArtistCollectionData: ContextProvider<
    typeof activeArtistCollectionContext
  >;
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
        search: { main: [] },
      },
    });
    this._activeAlbumCollectionData = new ContextProvider(host, {
      context: activeAlbumCollectionContext,
    });
    this._activeArtistCollectionData = new ContextProvider(host, {
      context: activeArtistCollectionContext,
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
    if (
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      !items ||
      (items.favorites.main.length === 0 &&
        items.recents.main.length === 0 &&
        items.recommendations.main.length === 0)
    ) {
      return;
    }
    this._items.setValue(items);
  }
  public get items() {
    return this._items.value;
  }

  public set massUser(user: string | null | undefined) {
    this._massUser = user;
  }
  public get massUser() {
    return this._massUser;
  }
  public set massUserInfo(userInfo: getUserInfoWSResponseSchema | undefined) {
    this._massUserInfo = userInfo;
    if (this.items.recommendations.main.length > 0) {
      this.resetAndGenerateSections();
    }
  }
  public get massUserInfo() {
    return this._massUserInfo;
  }

  public set activeAlbumCollectionData(
    collectionData: mediaCardAlbumData | undefined,
  ) {
    this._activeAlbumCollectionData.setValue(collectionData);
  }
  public get activeAlbumCollectionData() {
    return this._activeAlbumCollectionData.value;
  }

  public set activeArtistCollectionData(
    collectionData: mediaCardArtistData | undefined,
  ) {
    this._activeArtistCollectionData.setValue(collectionData);
  }
  public get activeArtistCollectionData() {
    return this._activeArtistCollectionData.value;
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
      search: { main: [] },
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
        const event_ = new CustomEvent("cards-updated", { detail: data });
        this._host.dispatchEvent(event_);
        const updatedEvent_ = new CustomEvent("cards-full-updated", {
          detail: data,
        });
        this._host.dispatchEvent(updatedEvent_);
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
    playerEntityId: string,
    searchTerm: string,
    libraryOnly = false as boolean,
    limit: number = DEFAULT_SEARCH_LIMIT,
    mediaType?: MediaTypes,
  ): Promise<mediaBrowserSectionConfig> {
    const user = this.massUser;
    const searchResult = await this.actions.actionSearchMedia(
      playerEntityId,
      searchTerm,
      libraryOnly,
      limit,
      user,
      mediaType,
    );
    const showCollectionView =
      this.browserConfig.recommendations.show_collection_view;
    return {
      main: [],
      album: generateFavoritesSectionCards(
        searchResult.albums,
        MediaTypes.ALBUM,
        showCollectionView,
      ),
      artist: generateFavoritesSectionCards(
        searchResult.artists,
        MediaTypes.ARTIST,
        showCollectionView,
      ),
      audiobook: generateFavoritesSectionCards(
        searchResult.audiobooks,
        MediaTypes.AUDIOBOOK,
        showCollectionView,
      ),
      playlist: generateFavoritesSectionCards(
        searchResult.playlists,
        MediaTypes.PLAYLIST,
        showCollectionView,
      ),
      podcast: generateFavoritesSectionCards(
        searchResult.podcasts,
        MediaTypes.PODCAST,
        showCollectionView,
      ),
      radio: generateFavoritesSectionCards(
        searchResult.radio,
        MediaTypes.RADIO,
        showCollectionView,
      ),
      track: generateFavoritesSectionCards(
        searchResult.tracks,
        MediaTypes.TRACK,
        showCollectionView,
      ),
    };
  }
  public async getSimilarArtistsCards(
    artistUri: string,
  ): Promise<MediaCardItem[]> {
    const resp = await this.actions.actionGetSimilarArtists(
      this.activeEntityId,
      artistUri,
    );

    const result: MediaCardItem[] = [];
    resp.response.artists.forEach((artist) => {
      const card = generateCardFromArtist(artist);
      if (card) {
        result.push(card);
      }
    });
    return result;
  }
  public async getArtistAlbumsCards(
    artistUri: string,
  ): Promise<MediaCardItem[]> {
    const resp = await this.actions.actionGetArtistAlbums(
      this.activeEntityId,
      artistUri,
    );

    const result: MediaCardItem[] = [];
    resp.response.albums.forEach((album) => {
      const card = generateCardFromAlbum(album);
      if (card) {
        result.push(card);
      }
    });
    return result;
  }

  // Favorites
  private async generateAllFavorites() {
    const favorites = this.browserConfig.favorites;
    const downloadLocal = this.config.download_local;
    const proxyAll = this.config.proxy_all_artwork;
    const promises = [
      this.generateFavoriteData(
        favorites.albums,
        MediaTypes.ALBUM,
        favorites.albums.favorites_only,
        downloadLocal,
        proxyAll,
      ),
      this.generateFavoriteData(
        favorites.artists,
        MediaTypes.ARTIST,
        favorites.artists.favorites_only,
        downloadLocal,
        proxyAll,
      ),
      this.generateFavoriteData(
        favorites.audiobooks,
        MediaTypes.AUDIOBOOK,
        favorites.audiobooks.favorites_only,
        downloadLocal,
        proxyAll,
      ),
      this.generateFavoriteData(
        favorites.playlists,
        MediaTypes.PLAYLIST,
        favorites.playlists.favorites_only,
        downloadLocal,
        proxyAll,
      ),
      this.generateFavoriteData(
        favorites.podcasts,
        MediaTypes.PODCAST,
        favorites.podcasts.favorites_only,
        downloadLocal,
        proxyAll,
      ),
      this.generateFavoriteData(
        favorites.radios,
        MediaTypes.RADIO,
        favorites.radios.favorites_only,
        downloadLocal,
        proxyAll,
      ),
      this.generateFavoriteData(
        favorites.tracks,
        MediaTypes.TRACK,
        favorites.tracks.favorites_only,
        downloadLocal,
        proxyAll,
      ),
    ];
    await Promise.all(promises);
    const data: CardsUpdatedEventDetail = {
      section: "favorites",
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
      cards: this.items!.favorites!,
    };
    const event_ = new CustomEvent("cards-updated", { detail: data });
    this._host.dispatchEvent(event_);
  }
  private async getFavoriteSection(
    config: FavoriteItemConfig,
    mediaType: MediaTypes,
    favoritesOnly = DEFAULT_FAVORITES_ONLY,
  ) {
    const limit = config.limit;
    const customItems = config.items;
    const sortOrder = this.config.media_browser.favorites.sort_order;
    const user = this.massUser;
    const resp: MediaLibraryItem[] = await this.actions.actionGetLibrary(
      this.activeEntityId,
      mediaType,
      limit,
      favoritesOnly ? true : null,
      sortOrder,
      user,
    );
    return [
      ...generateFavoritesSectionCards(
        resp,
        mediaType,
        this.browserConfig.favorites.show_collection_view,
      ),
      ...generateCustomSectionCards(customItems),
    ];
  }
  private async generateFavoriteData(
    config: FavoriteItemConfig,
    mediaType: MediaTypes,
    favoritesOnly = DEFAULT_FAVORITES_ONLY,
    downloadLocal: boolean,
    proxyAll: boolean,
  ) {
    if (
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain, @typescript-eslint/no-unnecessary-condition
      (this.items?.favorites ?? {})[mediaType] ||
      !config.enabled
    ) {
      return;
    }
    const items = await this.getFavoriteSection(
      config,
      mediaType,
      favoritesOnly,
    );
    if (items.length === 0) {
      return;
    }
    const i = { ...this.items };
    i.favorites[mediaType] = items;
    const card = await generateFavoriteCard(
      this.hass,
      mediaType,
      items,
      downloadLocal,
      proxyAll,
    );
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
    const event_ = new CustomEvent("cards-updated", { detail: data });
    this._host.dispatchEvent(event_);
  }
  private async getRecentSection(
    config: FavoriteItemConfig,
    mediaType: MediaTypes,
  ) {
    const limit = config.limit;
    const sortOrder = this.config.media_browser.recents.sort_order;
    const user = this.massUser;
    const resp: MediaLibraryItem[] = await this.actions.actionGetLibraryRecents(
      this.activeEntityId,
      mediaType,
      limit,
      sortOrder,
      user,
    );
    const items = generateFavoritesSectionCards(
      resp,
      mediaType,
      this.browserConfig.recents.show_collection_view,
    );
    return [...items];
  }
  private async generateRecentsData(
    config: FavoriteItemConfig,
    mediaType: MediaTypes,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.items.recents[mediaType] || !config.enabled) {
      return;
    }

    const items = await this.getRecentSection(config, mediaType);
    if (items.length > 0) {
      const card = await generateRecentsCard(
        this.hass,
        mediaType,
        items,
        this.config.download_local,
        this.config.proxy_all_artwork,
      );
      const i = { ...this.items };
      i.recents.main.push(card);
      i.recents[mediaType] = items;
      this.items = { ...i };
    }
  }

  //Recommendations
  private async generateRecommendationSection(section: RecommendationSection) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.items.recommendations[section.name]) {
      return;
    }
    const items = generateRecommendationSectionCards(
      section,
      this.browserConfig.recommendations.show_collection_view,
    );
    if (items.length > 0) {
      const card = await generateRecommendationsCard(
        this.hass,
        section,
        items,
        this.config.download_local,
        this.config.proxy_all_artwork,
      );
      const i = { ...this.items };
      i.recommendations.main.push(card);
      i.recommendations[section.name] = items;
      this.items = { ...i };
    }
  }
  private _createRecommendationProviderFilter(
    configProviders: string[] | null,
    userProviders: string[] | null,
  ) {
    if (!configProviders?.length) {
      return userProviders;
    }
    if (!userProviders?.length) {
      return configProviders;
    }

    const result = userProviders.filter((userProvider) => {
      return configProviders.find((configProvider) => {
        return userProvider.startsWith(configProvider);
      });
    });
    return result;
  }
  private async generateAllRecommendations() {
    const configProviders =
      this.browserConfig.recommendations.providers ?? null;
    const userProviders = this.massUserInfo?.provider_filter ?? [];
    const providers = this._createRecommendationProviderFilter(
      configProviders,
      userProviders,
    );

    const data = await this.actions.actionGetRecommendations(
      this.activeEntityId,
      providers,
    );
    const resp = data.response.response;
    const allItems: Promise<void>[] = [];

    resp.forEach((item) => {
      allItems.push(this.generateRecommendationSection(item));
    });
    await Promise.all(allItems);
    const detail: CardsUpdatedEventDetail = {
      section: "recommendations",
      cards: this.items.recommendations,
    };
    const event_ = new CustomEvent("cards-updated", { detail });
    this._host.dispatchEvent(event_);
  }

  //Custom Sections
  private generateCustomSections() {
    this.browserConfig.sections.forEach((item) => {
      this.generateCustomSectionData(item);
    });
  }
  private generateCustomSectionData(config: customSection) {
    const sectionCard: MediaCardItem = {
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
    i.favorites.main.push(sectionCard);
    this.items = { ...i };
  }
  public getRecommendationsForMedia(
    mediaType: MediaTypes,
  ): MediaRecommendationSection[] {
    const recommendations = Object.entries(this.items.recommendations).filter(
      (rec) => {
        return rec[0] != "main";
      },
    );
    const filteredRecs: MediaRecommendationSection[] = recommendations
      .map((rec) => {
        const title = rec[0];
        const recItems = rec[1];
        const filteredRecItems = recItems.filter((recItem) => {
          return (recItem.data.type as MediaTypes) == mediaType;
        });
        return {
          title,
          items: filteredRecItems,
        };
      })
      .filter((rec) => {
        return rec.items.length > 0;
      });
    return filteredRecs;
  }
  public disconnected() {
    return;
  }
  public reconnected(hass: ExtendedHass) {
    this.hass = hass;
    this.resetAndGenerateSections();
  }
}
