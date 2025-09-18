import { 
  CSSResultGroup, 
  html, 
  LitElement, 
  TemplateResult 
} from "lit";
import { 
  MediaBrowserItemsConfig, 
  MediaCardData, 
  MediaCardItem, 
  MediaLibraryItem, 
  MediaTypeIcons 
} from "../const/media-browser";
import BrowserActions from "../actions/browser-actions";
import { ExtendedHass, Icon, MediaTypes } from "../const/common";
import { property, state } from "lit/decorators.js";
import '../components/media-browser-cards'
import styles from '../styles/media-browser';
import { backgroundImageFallback } from "../utils/icons";
import { testMixedContent } from "../utils/util";
import { 
  customItem, 
  customSection, 
  FavoriteItemConfig, 
  MediaBrowserConfig, 
} from "../config/media-browser";
import { mdiArrowLeft } from "@mdi/js";

export class MediaBrowser extends LitElement {
  public activePlayer!: string;
  @property({attribute: false}) private _config!: MediaBrowserConfig;
  private _hass!: ExtendedHass;
  @state() private cards: MediaBrowserItemsConfig = {main: []};
  private _activeSection = 'main';
  private actions!: BrowserActions;
  private _activeCards: MediaCardItem[] = [];
  public onMediaSelectedAction!: () => void;
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
    if (!activeCards?.length) {
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
    if (regenerate) {
      this.generateCards().catch( () => {return});
      this.activeCards = this.cards[this.activeSection]
      this.requestUpdate();
    }
  }
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  private onFavoriteItemSelected = (data: MediaCardData) => {
    const content_id: string = data.uri;
    const content_type: string = data.media_type;
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
      void this.actions.actionPlayMedia(this.activePlayer, data.media_content_id, data.media_type);
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
  private onBack = () => {
    this.activeSection = 'main';
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
      <div class="thumbnail" style="display: grid; grid-template-areas: 'bg-1 bg-2' 'bg-3 bg-4'; padding-bottom: 0%; height: unset; width: unset">
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
      const result = await this.getFavoriteSection(media_type, config.limit);
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
            media_type: item.media_content_type,
            service: item.service
          }
        };
        return r;
      }
    )
  }
  private getFavoriteSection = async (media_type: MediaTypes, limit: number) => {
    const response: MediaLibraryItem[] = await this.actions.actionGetFavorites(this.activePlayer, media_type, limit);
    const icon: Icon = MediaTypeIcons[media_type];
    return response.map(
      (item) => {
        const r: MediaCardItem = {
          title: item.name,
          icon: item.image,
          fallback: icon,
          data: {
            type: 'favorites',
            uri: item.uri,
            media_type: item.media_type
          }
        }
        return r;
      }
    )
  }
  protected renderSubSectionHeader() {
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
      <div id="title" style="padding-right: 2.5em;">
        ${this.activeSection}
      </div>
    `
  }
  protected renderSectionHeader() {
    return html`
      <div id="title">
        ${this.activeSection}
      </div>
    `    
  }
  protected render() {
    if (!this.cards) {
      return;
    }
    const activeCards = this.cards[this.activeSection];
    return html`
      <ha-card>
        <div class="header">
          ${this.activeSection == 'main' ? this.renderSectionHeader() : this.renderSubSectionHeader()}
        </div>
        <div class="mass-browser">
          <mass-browser-cards
            .items=${activeCards}
            .onSelectAction=${this.onSelect}
            .hass=${this.hass}
          >
          </mass-browser-cards>
        </div>
      </ha-card>
    `;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
customElements.define('mass-media-browser', MediaBrowser);