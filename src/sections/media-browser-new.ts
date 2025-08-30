import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import styles from '../styles/media-browser';
import { MediaBrowserConfig } from "../types";
import { HomeAssistant } from "custom-card-helpers";
import { state } from "lit/decorators";
import MediaBrowserActions from "../actions/browser-actions";
import './media-browser-favorites-items'
import { MediaTypes } from "../const";

class MediaBrowserCard extends LitElement {
  @state() _code!: TemplateResult;
  private _config!: MediaBrowserConfig;
  private _hass!: HomeAssistant;
  private _player_entity!: string;
  
  public set config(config: MediaBrowserConfig) {
    if (!config) {
      return;
    }
    this._config = config;
    this.setupIfReady();
  }
  public set hass(hass: HomeAssistant) {
    if (!hass) {
      return;
    }
    this._hass = hass;
    this.setupIfReady();
  }
  public set playerEntity(playerEntity: string) {
    if (!playerEntity) {
      return;
    }
    this._player_entity = playerEntity;
    this.setupIfReady();
  }
  private setupIfReady() {
    if (
      !this._config 
      || !this._hass
      || !this._player_entity
    ) {
      return
    }
  }
  protected renderSections() {
    this._code = html`
      ${this.renderSection(MediaTypes.ALBUM)}
      ${this.renderSection(MediaTypes.ARTIST)}
      ${this.renderSection(MediaTypes.AUDIOBOOK)}
      ${this.renderSection(MediaTypes.PLAYLIST)}
      ${this.renderSection(MediaTypes.PODCAST)}
      ${this.renderSection(MediaTypes.RADIO)}
      ${this.renderSection(MediaTypes.TRACK)}
    `
  }
  protected renderSection(section: MediaTypes) {
    if (!this._config.favorites[section].enabled) {
      return html``
    }
    return html`
      <mass-browser-item
        .mediaItem=${section}
        .playerEntity=${this._player_entity}
        @click=
      >
      </mass-browser-item>
    `
  }
  protected render() {
    return html`
      <ha-card>
        ${this._code}
      </ha-card>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-browser-card', MediaBrowserCard);