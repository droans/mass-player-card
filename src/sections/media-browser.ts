import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { FavoriteItemConfig, MediaBrowserConfig, MediaBrowserItemsConfig, MediaCardData, MediaCardItem } from "../const/media-browser";
import { HomeAssistant } from "custom-card-helpers";
import BrowserActions from "../actions/browser-actions";
import { Icons, MediaTypes } from "../const/common";
import { state } from "lit/decorators.js";
import '../components/media-browser-cards'
import styles from '../styles/media-browser';

class MediaBrowser extends LitElement {
  public activePlayer!: string;
  private _config!: MediaBrowserConfig;
  private _hass!: HomeAssistant;
  private _cards!: MediaBrowserItemsConfig;
  private _activeSection = 'main';
  private actions!: BrowserActions;
  private _activeCards: MediaCardItem[] = [];
  public onMediaSelectedAction!: () => void;
  @state() private code!: TemplateResult;
  /*
    TODO:
    * Generate main browser section
    * Create secondary sections on-demand
  */
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
    this._hass = hass;
    this.setupIfReady();
  }
  public get hass() {
    return this._hass;
  }
  public set activeSection(section: string) {
    if (!section) {
      return;
    }
    this._activeSection = section;
    this.activeCards = this._cards[section];
    this.setupIfReady();
  }
  public get activeSection() {
    return this._activeSection;
  }
  private set activeCards(activeCards: MediaCardItem[]) {
    if (!activeCards) {
      return;
    }
    this._activeCards = activeCards;
    this.generateCode();
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
    this.actions = new BrowserActions(this.hass);
    if (!this._cards || regenerate) {
      this.generateCards();
    }
    if (!this.activeCards.length) {
      this.activeCards = this._cards[this.activeSection];
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
  private generateFavoriteCard(media_type: MediaTypes): MediaCardItem {
    return {
      title: media_type,
      icon: Icons.CLEFT,
      fallback: Icons.CLEFT,
      data: {
        type: 'section',
        section: media_type
      }
    }
  }
  private generateFavoriteData(config: FavoriteItemConfig, media_type: MediaTypes) {
    if (config.enabled) {
      this._cards.main.push(this.generateFavoriteCard(media_type));
      this.getFavoriteSection(media_type).then(
        (result) => {
          this._cards[media_type] = result
        }
      ).catch( () => {return});
    }
  }
  private generateCards(){
    this._cards = {main: []};
    const favorites = this.config.favorites;
    this.generateFavoriteData(favorites.albums, MediaTypes.ALBUM);
    this.generateFavoriteData(favorites.artists, MediaTypes.ARTIST);
    this.generateFavoriteData(favorites.audiobooks, MediaTypes.AUDIOBOOK);
    this.generateFavoriteData(favorites.playlists, MediaTypes.PLAYLIST);
    this.generateFavoriteData(favorites.podcasts, MediaTypes.PODCAST);
    this.generateFavoriteData(favorites.radios, MediaTypes.RADIO);
    this.generateFavoriteData(favorites.tracks, MediaTypes.TRACK);
    this.generateCode();
  }
  private async getFavoriteSection(media_type: MediaTypes) {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const response: any[] = await this.actions.actionGetFavorites(this.activePlayer, media_type);
    return response.map(
      (item) => {
        const r: MediaCardItem = {
          title: item.name,
          icon: item.image,
          fallback: Icons.DISC,
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
  private generateCode() {
    const cards = this._activeCards;
    this.code = html`
      <div class="mass-browser">
        <mass-browser-cards
          .items=${cards}
          .onSelectAction=${this.onSelect}
        >
        </mass-browser-cards>
      </div>
    `
  }
  protected render() {
    return this.code;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
customElements.define('mass-media-browser', MediaBrowser);