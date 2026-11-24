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
  tracksCollectionContext,
} from "../const/context";
import { MediaTypes } from "../const/enums";
import { CardsUpdatedEventDetail } from "../const/events";
import { DEFAULT_SEARCH_LIMIT } from "../const/media-browser";
import {
  customSectionConfig,
  ExtendedHass,
  mediaBrowserSectionConfig,
  mediaCardAlbumData,
  mediaCardArtistData,
  MediaCardItem,
  mediaCardTracksData,
  MediaLibraryItem,
  MediaRecommendationSection,
  newMediaBrowserItemsConfig,
  RecommendationSection,
} from "../const/types";
import {
  generateCardFromAlbum,
  generateCardFromArtist,
  generateCustomSectionCards,
  generateFavoritesSectionCards,
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
  private _activeTracksCollectionData: ContextProvider<
    typeof tracksCollectionContext
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
        custom: [],
      },
    });
    this._activeAlbumCollectionData = new ContextProvider(host, {
      context: activeAlbumCollectionContext,
    });
    this._activeArtistCollectionData = new ContextProvider(host, {
      context: activeArtistCollectionContext,
    });
    this._activeTracksCollectionData = new ContextProvider(host, {
      context: tracksCollectionContext,
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
      (Object.keys(items.favorites).length === 0 &&
        Object.keys(items.recents).length === 0 &&
        Object.keys(items.recommendations).length === 0)
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
  public set activeTracksCollectionData(
    collectionData: mediaCardTracksData | undefined,
  ) {
    this._activeTracksCollectionData.setValue(collectionData);
  }
  public get activeTracksCollectionData() {
    return this._activeTracksCollectionData.value;
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
      custom: [],
    };
    void this.generateAllSections();
  }
  public async generateAllSections() {
    const promises = [
      this.generateAllFavorites(),
      this.generateAllRecents(),
      this.generateAllRecommendations(),
    ];
    this._updatingCards = true;
    const customSections = this.generateCustomSections();
    const [favorites, recents, recommendations] = await Promise.all(promises);
    const items: newMediaBrowserItemsConfig = {
      favorites,
      recents,
      recommendations,
      search: { main: [] },
      custom: customSections,
    };
    this.items = items;
    const data: CardsUpdatedEventDetail = {
      section: "all",
      cards: this.items,
    };
    const event_ = new CustomEvent("cards-updated", { detail: data });
    const updatedEvent_ = new CustomEvent("cards-full-updated", {
      detail: data,
    });
    this._host.dispatchEvent(event_);
    this._host.dispatchEvent(updatedEvent_);
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
  private async generateAllFavorites(): Promise<mediaBrowserSectionConfig> {
    const favoriteConfig = this.browserConfig.favorites;
    const promises = [
      this.generateFavoriteData(
        favoriteConfig.albums,
        MediaTypes.ALBUM,
        favoriteConfig.albums.favorites_only,
      ),
      this.generateFavoriteData(
        favoriteConfig.artists,
        MediaTypes.ARTIST,
        favoriteConfig.artists.favorites_only,
      ),
      this.generateFavoriteData(
        favoriteConfig.audiobooks,
        MediaTypes.AUDIOBOOK,
        favoriteConfig.audiobooks.favorites_only,
      ),
      this.generateFavoriteData(
        favoriteConfig.playlists,
        MediaTypes.PLAYLIST,
        favoriteConfig.playlists.favorites_only,
      ),
      this.generateFavoriteData(
        favoriteConfig.podcasts,
        MediaTypes.PODCAST,
        favoriteConfig.podcasts.favorites_only,
      ),
      this.generateFavoriteData(
        favoriteConfig.radios,
        MediaTypes.RADIO,
        favoriteConfig.radios.favorites_only,
      ),
      this.generateFavoriteData(
        favoriteConfig.tracks,
        MediaTypes.TRACK,
        favoriteConfig.tracks.favorites_only,
      ),
    ];
    const [albums, artists, audiobooks, playlists, podcasts, radios, tracks] =
      await Promise.all(promises);
    const favorites: mediaBrowserSectionConfig = { main: [] };
    if (albums.length > 0) {
      favorites.album = albums;
    }
    if (artists.length > 0) {
      favorites.artist = artists;
    }
    if (audiobooks.length > 0) {
      favorites.audiobook = audiobooks;
    }
    if (playlists.length > 0) {
      favorites.playlist = playlists;
    }
    if (podcasts.length > 0) {
      favorites.podcast = podcasts;
    }
    if (radios.length > 0) {
      favorites.radio = radios;
    }
    if (tracks.length > 0) {
      favorites.track = tracks;
    }
    return favorites;
  }
  private async getFavoriteSection(
    config: FavoriteItemConfig,
    mediaType: MediaTypes,
    favoritesOnly = DEFAULT_FAVORITES_ONLY,
  ) {
    const limit = config.limit;
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
    ];
  }
  private async generateFavoriteData(
    config: FavoriteItemConfig,
    mediaType: MediaTypes,
    favoritesOnly = DEFAULT_FAVORITES_ONLY,
  ): Promise<MediaCardItem[]> {
    if (
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain, @typescript-eslint/no-unnecessary-condition
      (this.items?.favorites ?? {})[mediaType] ||
      !config.enabled
    ) {
      return [];
    }
    const items = await this.getFavoriteSection(
      config,
      mediaType,
      favoritesOnly,
    );
    return items;
  }

  // Recents
  private async generateAllRecents(): Promise<mediaBrowserSectionConfig> {
    const recentsConfig = this.browserConfig.recents;
    const promises = [
      this.generateRecentsData(recentsConfig.albums, MediaTypes.ALBUM),
      this.generateRecentsData(recentsConfig.artists, MediaTypes.ARTIST),
      this.generateRecentsData(recentsConfig.audiobooks, MediaTypes.AUDIOBOOK),
      this.generateRecentsData(recentsConfig.playlists, MediaTypes.PLAYLIST),
      this.generateRecentsData(recentsConfig.podcasts, MediaTypes.PODCAST),
      this.generateRecentsData(recentsConfig.radios, MediaTypes.RADIO),
      this.generateRecentsData(recentsConfig.tracks, MediaTypes.TRACK),
    ];
    const [albums, artists, audiobooks, playlists, podcasts, radios, tracks] =
      await Promise.all(promises);
    const recents: mediaBrowserSectionConfig = { main: [] };
    if (albums.length > 0) {
      recents.album = albums;
    }
    if (artists.length > 0) {
      recents.artist = artists;
    }
    if (audiobooks.length > 0) {
      recents.audiobook = audiobooks;
    }
    if (playlists.length > 0) {
      recents.playlist = playlists;
    }
    if (podcasts.length > 0) {
      recents.podcast = podcasts;
    }
    if (radios.length > 0) {
      recents.radio = radios;
    }
    if (tracks.length > 0) {
      recents.track = tracks;
    }
    return recents;
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
  ): Promise<MediaCardItem[]> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.items.recents[mediaType] || !config.enabled) {
      return [];
    }

    const items = await this.getRecentSection(config, mediaType);
    return items;
  }

  //Recommendations
  private generateRecommendationSection(
    section: RecommendationSection,
  ): MediaCardItem[] {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.items.recommendations[section.name]) {
      return [];
    }
    const items = generateRecommendationSectionCards(
      section,
      this.browserConfig.recommendations.show_collection_view,
    );
    return items;
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

    const cards: mediaBrowserSectionConfig = { main: [] };
    resp.forEach((item) => {
      const sectionCards = this.generateRecommendationSection(item);
      cards[item.name] = sectionCards;
    });
    return cards;
  }

  //Custom Sections
  private generateCustomSections() {
    const result: customSectionConfig[] = this.browserConfig.sections.map(
      (item) => {
        const customCards = this.generateCustomSectionData(item);
        return {
          name: item.name,
          mediaType: item.media_type,
          cards: customCards,
        };
      },
    );
    return result;
  }
  private x = generateCustomSectionCards;
  private generateCustomSectionData(config: customSection): MediaCardItem[] {
    return generateCustomSectionCards(config.items);
  }
  public getCustomSectionForMedia(
    mediaType: MediaTypes,
  ): customSectionConfig[] {
    return this.items.custom.filter((section) => {
      return section.mediaType == mediaType;
    });
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
