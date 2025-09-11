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
  MediaTypeIcons 
} from "../const/media-browser";
import { HomeAssistant } from "custom-card-helpers";
import BrowserActions from "../actions/browser-actions";
import { Icons, MediaTypes } from "../const/common";
import { property, state } from "lit/decorators.js";
import '../components/media-browser-cards'
import styles from '../styles/media-browser';
import { backgroundImageFallback } from "../utils/icons";
import { testMixedContent } from "../utils/util";
import { FavoriteItemConfig, MediaBrowserConfig, processMediaBrowserConfig } from "../config/media-browser";

export class MediaBrowser extends LitElement {
  public activePlayer!: string;
  private _config!: MediaBrowserConfig;
  private _hass!: HomeAssistant;
  @state() private cards: MediaBrowserItemsConfig = {main: []};
  private _activeSection = 'main';
  private actions!: BrowserActions;
  private _activeCards: MediaCardItem[] = [];
  public onMediaSelectedAction!: () => void;
  /*
    TODO:
    * Generate main browser section
    * Create secondary sections on-demand
  */
 @property({attribute: false})
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
  public set hass(hass: HomeAssistant) {
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
  private onFavoriteItemSelected = (data: MediaCardData) => {
    const content_id: string = data.uri;
    const content_type: string = data.media_type;
    void this.actions.actionPlayMedia(this.activePlayer, content_id, content_type);
    this.onMediaSelectedAction();
  }
  private onSectionSelect = (data: MediaCardData) => {
    this.activeSection = data.section;
  }
  private onSelect = (data: MediaCardData) => {
    const funcs = {
      section: this.onSectionSelect,
      favorites: this.onFavoriteItemSelected
    }
    const func = funcs[data.type];
    func(data);
  }
  private _generateSectionBackgroundPart(icon: string, fallback: Icons = Icons.DISC) {
    const image = backgroundImageFallback(icon, fallback)
    return html`
      <div class="thumbnail-section" style="${image};"></div>
    `
  }
  private generateSectionBackground(cards: MediaCardItem[], fallback: Icons) {
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
    const icon: Icons = MediaTypeIcons[media_type];
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
      const result = await this.getFavoriteSection(media_type);
      if (!result.length) {
        return;
      }
      this.cards[media_type] = result;
      const card = this.generateFavoriteCard(media_type, result);
      this.cards.main.push(card);
    }
  }
  private generateCards = async () => {
    const favorites = this.config.favorites;
    await this.generateFavoriteData(favorites.albums, MediaTypes.ALBUM);
    await this.generateFavoriteData(favorites.artists, MediaTypes.ARTIST);
    await this.generateFavoriteData(favorites.audiobooks, MediaTypes.AUDIOBOOK);
    await this.generateFavoriteData(favorites.playlists, MediaTypes.PLAYLIST);
    await this.generateFavoriteData(favorites.podcasts, MediaTypes.PODCAST);
    await this.generateFavoriteData(favorites.radios, MediaTypes.RADIO);
    await this.generateFavoriteData(favorites.tracks, MediaTypes.TRACK);
    this.activeCards = this.cards[this.activeSection];
    this.requestUpdate();
  }
  private getFavoriteSection = async (media_type: MediaTypes) => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const response: any[] = await this.actions.actionGetFavorites(this.activePlayer, media_type);
    const icon: Icons = MediaTypeIcons[media_type];
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
  // private generateCode() {
  //   if (!this.activeCards.length) {
  //     this.activeCards = this.cards[this.activeSection];
  //   }
  //   this.code = html`
  //     <div class="mass-browser">
  //       <mass-browser-cards
  //         .items=${this.activeCards}
  //         .onSelectAction=${this.onSelect}
  //       >
  //       </mass-browser-cards>
  //     </div>
  //   `
  // }
  protected render() {
    if (!this.cards) {
      return;
    }
    const activeCards = this.cards[this.activeSection];
    return html`
      <div class="mass-browser">
        <mass-browser-cards
          .items=${activeCards}
          .onSelectAction=${this.onSelect}
        >
        </mass-browser-cards>
      </div>
    `;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
customElements.define('mass-media-browser', MediaBrowser);