import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { FavoriteItems, MediaBrowserConfig, MediaBrowserItem } from "../types";
import { HomeAssistant } from "custom-card-helpers";
import BrowserActions from "../actions/browser-actions";
import { MediaTypes, DEFAULT_MEDIA_BROWSER_CONFIG } from "../const";
import { keyed } from "lit/directives/keyed.js";

import '../components/browser-row'
import styles from '../styles/media-browser';

class MediaBrowserCard extends LitElement {
  private _favorites!: FavoriteItems;
  private _hass!: HomeAssistant;
  private _player_entity!: string;
  private actions!: BrowserActions;
  private _config!: MediaBrowserConfig;
  public onMediaSelectedAction!: () => void;
  @state() private favoritesCode!: TemplateResult;
  
  private set favorites (favorites: FavoriteItems) {
    if (favorites) {
      this._favorites = favorites;
      this.favoritesCode = this.renderFavorites()
    }
  }
  @property({ attribute: false })
  public set config (config: MediaBrowserConfig) {
    if (config) {
      this._config = {
        ...DEFAULT_MEDIA_BROWSER_CONFIG,
        ...config
      };
    } else {
      this._config = DEFAULT_MEDIA_BROWSER_CONFIG;
    }
    this.setupIfReady('config');
  }

  public set hass(hass: HomeAssistant) {
    if (hass) {
      this._hass = hass;
      this.setupIfReady('hass');
    }
  }
  
  public set player_entity(player_entity: string) {
    if (player_entity) {
      this._player_entity = player_entity;
      this.setupIfReady('player_entity');
    }
  }
  private setupIfReady(ready: string) {
    if (this._hass && this._player_entity) {
      if (!this.actions) {
        this.actions = new BrowserActions(this._hass);
      }
      if (ready !== 'hass' || !this._favorites) {
        this.updateItems()
      }
    }
  }
  private async updateItems() {
    this.getAllFavorites();
  }
  private formatMediaBrowserItems(media_browser_items: any[]) {
    return media_browser_items.map( (item) => {
      const r: MediaBrowserItem = {
        name: item.name,
        uri: item.uri,
        image: item.image,
        media_type: item.media_type
      };
      return r;
    })
  }
  private async getFavorites(media_type: MediaTypes) {
    const response = await this.actions.actionGetFavorites(this._player_entity, media_type);
    const result = this.formatMediaBrowserItems(response);
    return result;
  }
  private async getAllFavorites() {
    this.favorites = {
      albums: await this.getFavorites(MediaTypes.ALBUM),
      artists: await this.getFavorites(MediaTypes.ARTIST),
      audiobooks: await this.getFavorites(MediaTypes.AUDIOBOOK),
      playlists: await this.getFavorites(MediaTypes.PLAYLIST),
      podcasts: await this.getFavorites(MediaTypes.PODCAST),
      radios: await this.getFavorites(MediaTypes.RADIO),
      tracks: await this.getFavorites(MediaTypes.TRACK), 
    }
  }
  private onItemSelectedAction = async (content_id: string, content_type: string) => {
    await this.actions.actionPlayMedia(this._player_entity, content_id, content_type);
    this.onMediaSelectedAction();

  }
  protected renderFavoriteItems(favorites: MediaBrowserItem[], section_name: string) {
    if (!favorites.length) {
      return html``
    }
    const result = favorites.map(
      (item) => {
        return keyed(
          item.uri,
          html`
            <mass-track-row
              .mediaItem=${item}
              .onSelectAction=${this.onItemSelectedAction}
            >
            </mass-track-row>
          `
        )
      }
    )
    return html`
      <ha-expansion-panel
        class="mass-panel"
        header=${section_name}
      >
      ${result}
      </ha-expansion-panel>
    `;
  }
  protected renderFavoriteAlbums() {
    if (this._config.favorites.albums.enabled) {
      return html` 
        ${this.renderFavoriteItems(this._favorites.albums, 'Albums')}
      `;
    }
    return html``;
  }
  protected renderFavoriteArtists() {
    if (this._config.favorites.artists.enabled) {
      return html` 
        ${this.renderFavoriteItems(this._favorites.artists, 'Artists')}
      `;
    }
    return html``;
  }
  protected renderFavoriteAudiobooks() {
    if (this._config.favorites.audiobooks.enabled) {
      return html` 
        ${this.renderFavoriteItems(this._favorites.audiobooks, 'Audiobooks')}
      `;
    }
    return html``;
  }
  protected renderFavoritePlaylists() {
    if (this._config.favorites.playlists.enabled) {
      return html` 
        ${this.renderFavoriteItems(this._favorites.playlists, 'Playlists')}
      `;
    }
    return html``;
  }
  protected renderFavoritePodcasts() {
    if (this._config.favorites.podcasts.enabled) {
      return html` 
        ${this.renderFavoriteItems(this._favorites.podcasts, 'Podcasts')}
      `;
    }
    return html``;
  }
  protected renderFavoriteRadios() {
    if (this._config.favorites.radios.enabled) {
      return html` 
        ${this.renderFavoriteItems(this._favorites.radios, 'Radios')}
      `;
    }
    return html``;
  }
  protected renderFavoriteTracks() {
    if (this._config.favorites.tracks.enabled) {
      return html` 
        ${this.renderFavoriteItems(this._favorites.tracks, 'Tracks')}
      `;
    }
    return html``;
  }
  protected renderFavorites() {
    if (this._config.favorites.enabled) {
      return html`
        ${this.renderFavoriteAlbums()}
        ${this.renderFavoriteArtists()}
        ${this.renderFavoriteAudiobooks()}
        ${this.renderFavoritePlaylists()}
        ${this.renderFavoritePodcasts()}
        ${this.renderFavoriteRadios()}
        ${this.renderFavoriteTracks()}
      `
    }
    return html``
  }
  protected render() {
    return html`
      <ha-card>
        <ha-md-list class="list">
          ${this.favoritesCode}
        </ha-md-list>
      </ha-card>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-browser-card', MediaBrowserCard);
