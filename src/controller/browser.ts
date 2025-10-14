import { ContextProvider } from "@lit/context";
import BrowserActions from "../actions/browser-actions.js";
import { Config } from "../config/config.js";
import {
  customSection,
  FavoriteItemConfig,
  MediaBrowserConfig
} from "../config/media-browser.js";
import {
  ExtendedHass,
  MediaTypes,
  Thumbnail
} from "../const/common.js";
import {
  DEFAULT_SEARCH_LIMIT,
  MediaCardItem,
  MediaLibraryItem,
  newMediaBrowserItemsConfig,
  RecommendationSection
} from "../const/media-browser.js";
import {
  generateCustomSectionCards,
  generateFavoriteCard,
  generateFavoritesSectionCards,
  generateRecentsCard,
  generateRecommendationsCard,
  generateRecommendationSectionCards
} from "../utils/media-browser.js";
import { mediaBrowserCardsContext } from "../const/context.js";

export class MediaBrowserController {
  private hass!: ExtendedHass
  private config!: Config;
  private browserConfig!: MediaBrowserConfig;
  // public _items!: newMediaBrowserItemsConfig;
  private actions!: BrowserActions;
  private _activeEntityId!: string;
  private _items = new ContextProvider(document.body, { context: mediaBrowserCardsContext })

  constructor(hass: ExtendedHass, config: Config, activeEntityId: string) {
    this.hass = hass;
    this.config = config;
    this.activeEntityId = activeEntityId;
    this.actions = new BrowserActions(hass);
    this.browserConfig = config.media_browser;
    this.items = {
      favorites: {main: []},
      recents: {main: []},
      recommendations: {main: []},
      search: []
    }
    this.generateAllSections()
  }
  private set items(items: newMediaBrowserItemsConfig) {
    const x = {...items}
    const old_items = JSON.stringify(this._items);
    const new_items = JSON.stringify(items);
    if (old_items != new_items){
      this._items.setValue(x);
    }
  }
  public get items() {
    return this._items.value;
  }
  public generateAllSections() {
    const promises = [
      this.generateAllFavorites(),
      this.generateAllRecents(),
      this.generateAllRecommendations(),
    ]
    void Promise.all(promises);
    this.generateCustomSections();
    
  }

  public set activeEntityId(entityId: string) {
    this._activeEntityId = entityId;
  }
  public get activeEntityId() {
    return this._activeEntityId;
  }

  public async search(
    player_entity_id: string,
    search_term: string,
    media_type: MediaTypes,
    library_only = false as boolean,
    limit: number = DEFAULT_SEARCH_LIMIT
  ) {
    const search_result = await this.actions.actionSearchMedia(
      player_entity_id,
      search_term,
      media_type,
      library_only,
      limit
    )
    return generateFavoritesSectionCards(search_result, media_type)
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
  }
  private async getFavoriteSection(
    config: FavoriteItemConfig,
    media_type: MediaTypes,
    favorites_only = true
  ) {
    const limit = config.limit;
    const custom_items = config.items;

    const resp: MediaLibraryItem[] = await this.actions.actionGetLibrary(this.activeEntityId, media_type, limit, favorites_only);
    return [
      ...generateFavoritesSectionCards(resp, media_type),
      ...generateCustomSectionCards(custom_items)
    ]
  }
  private async generateFavoriteData(
    config: FavoriteItemConfig,
    media_type: MediaTypes,
    favorites_only = true
  ) {
    
    const items = await this.getFavoriteSection(config, media_type, favorites_only);
    if (!items.length) {
      return;
    }
    const i = {...this.items};
    i.favorites[media_type] = items;
    i.favorites.main = [
      generateFavoriteCard(this.hass, media_type, items),
      ...i.favorites.main
    ]
    this.items = {...i};
  }

  // Recents
  private async generateAllRecents() {
   const favorites = this.browserConfig.favorites;
   const promises = [
    this.generateRecentsData(favorites.albums, MediaTypes.ALBUM),
    this.generateRecentsData(favorites.artists, MediaTypes.ARTIST),
    this.generateRecentsData(favorites.audiobooks, MediaTypes.AUDIOBOOK),
    this.generateRecentsData(favorites.playlists, MediaTypes.PLAYLIST),
    this.generateRecentsData(favorites.podcasts, MediaTypes.PODCAST),
    this.generateRecentsData(favorites.radios, MediaTypes.RADIO),
    this.generateRecentsData(favorites.tracks, MediaTypes.TRACK),
   ]
   await Promise.all(promises);
    
  }
  private async getRecentSection(config: FavoriteItemConfig, media_type: MediaTypes) {
    const limit = config.limit;
    const resp: MediaLibraryItem[] = await this.actions.actionGetLibraryRecents(this.activeEntityId, media_type, limit);
    const items = generateFavoritesSectionCards(resp, media_type);
    return [...items];

  }
  private async generateRecentsData(config: FavoriteItemConfig, media_type: MediaTypes) {
    
    const items = await this.getRecentSection(config, media_type);
    if (items.length) {
      const card = generateRecentsCard(this.hass, media_type, items);
      const i = {...this.items};
      i.recents.main.push(card);
      i.recents[media_type] = items;
      this.items = {...i};
    }
  }

  //Recommendations
  private generateRecommendationSection(section: RecommendationSection) {
    const items = generateRecommendationSectionCards(section);
    if (items.length) {
      const card = generateRecommendationsCard(this.hass, section, items);
      const i = {...this.items};
      i.recommendations.main.push(card)
      i.recommendations[section.name] = items
      this.items = {...i};
    }
    
  }
  private async generateAllRecommendations() {
    const data = await this.actions.actionGetRecommendations(this.activeEntityId, null);
    const resp = data.response.response;
    resp.forEach(
      (item) => {
        this.generateRecommendationSection(item)
      }
    )
  }

  //Custom Sections
  private generateCustomSections() {
    this.browserConfig.sections.forEach(
      (item) => {
        this.generateCustomSectionData(item)
      }
    )
  }
  private generateCustomSectionData(config: customSection) {
    const section_card: MediaCardItem = {
      title: config.name,
      thumbnail: config.image,
      fallback: Thumbnail.CLEFT,
      data: {
        type: 'section',
        subtype: 'favorites',
        section: `custom-${config.name}`
      }
    };
    const cards = generateCustomSectionCards(config.items);
    const i = {...this.items};
    i.favorites[`custom-${config.name}`] = cards;
    i.favorites.main.push(section_card);
    this.items = {...i};
  }
}