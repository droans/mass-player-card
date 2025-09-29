import { consume } from "@lit/context";
import { mdiHeart, mdiHeartPlusOutline, mdiPower, mdiVolumeHigh, mdiVolumeMute } from "@mdi/js";
import {
  CSSResultGroup,
  html,
  LitElement,
  TemplateResult
} from "lit";

import { DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG, PlayerConfig, PlayerHiddenElementsConfig } from "../config/player";

import {
  ServiceCustomEvent,
  ServiceNoParams
} from "../const/common";
import {
  activeEntityConf,
  activePlayerDataContext,
  EntityConfig,
  musicPlayerConfigContext
} from "../const/context";
import { PlayerData } from "../const/music-player";

import styles from '../styles/volume-row';

class VolumeRow extends LitElement {

  public maxVolume!: number;
  public onPowerToggleSelect!: ServiceNoParams;
  public onVolumeMuteToggleSelect!: ServiceNoParams;
  public onVolumeChange!: ServiceCustomEvent;
  public onFavoriteToggleSelect!: ServiceNoParams;

  private _config!: PlayerConfig;
  private _entityConfig!: EntityConfig;
  private hide: PlayerHiddenElementsConfig = DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG;
  private _player_data!: PlayerData;

  @consume({ context: musicPlayerConfigContext, subscribe: true })
  public set config(config: PlayerConfig) {
    this._config = config;
    if (this._config && this._entityConfig) {
      this.updateHiddenElements();
    }
  }
  public get config() {
    return this._config;
  }

  @consume({ context: activeEntityConf, subscribe: true})
  public set entityConfig(config: EntityConfig) {
    this._entityConfig = config;
    if (this._config && this._entityConfig) {
      this.updateHiddenElements();
    }
  }
  public get entityConfig() {
    return this._entityConfig;
  }

  @consume({ context: activePlayerDataContext, subscribe: true})
  public set player_data(player_data: PlayerData) {
    this._player_data = player_data;
  }
  public get player_data() {
    return this._player_data;
  }

  private updateHiddenElements() {
    const entity = this.entityConfig.hide.player;
    const card = this.config.hide;
    this.hide = {
      favorite: entity.favorite || card.favorite,
      mute: entity.mute || card.mute,
      power: entity.power || card.power,
      volume: entity.volume || card.volume,
      player_selector: false,
      repeat: false,
      shuffle: false,
      group_volume: false
    }
  }
  private onToggle = () => {
    this.onPowerToggleSelect();
  }
  private onVolumeMuteToggle = () => {
    this.onVolumeMuteToggleSelect();
  }
  private onVolume = (ev: CustomEvent) => {
    this.onVolumeChange(ev);
  }
  private onFavorite = () => {
    this.onFavoriteToggleSelect();
  }
  protected renderPower(): TemplateResult {
    if (this.hide.power) {
      return html``
    }
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        id="button-power"
        part="button-power"
        @click=${this.onToggle}
      >
        <ha-svg-icon
          .path=${mdiPower}
          style="height: 3rem; width: 3rem;"
        ></ha-svg-icon>
      </ha-button>
    `
  }
  protected renderMute(): TemplateResult {
    if (this.hide.mute) {
      return html``
    }
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        id="button-mute"
        part="button-mute"
        @click=${this.onVolumeMuteToggle}
      >
        <ha-svg-icon
          .path=${this.player_data.muted ? mdiVolumeMute : mdiVolumeHigh}
          style="height: 3rem; width: 3rem;"
        ></ha-svg-icon>
      </ha-button>
    `
  }
  protected renderFavorite(): TemplateResult {
    if (this.hide.favorite) {
      return html``
    }
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        id="button-favorite"
        part="button-favorite"
        @click=${this.onFavorite}
      >
        <ha-svg-icon
          .path=${this.player_data.favorite ? mdiHeart : mdiHeartPlusOutline}
          style="height: 3rem; width: 3rem;"
        ></ha-svg-icon>
      </ha-button>
    `
  }
  protected renderVolumeBar(): TemplateResult {
    if (this.hide.volume) {
      return html``
    }
    return html`
      <ha-control-slider
        .disabled=${this.player_data.muted}
        .unit="%"
        .value=${this.player_data.volume}
        .min=0
        .max=${this.maxVolume}
        @value-changed=${this.onVolume}
        id="volume-slider"
        part="volume-slider"
      ></ha-control-slider>
    `
  }
  protected render(): TemplateResult {
    return html`
      <div id="volume">
        ${this.renderPower()}
        ${this.renderVolumeBar()}
        ${this.renderMute()}
        ${this.renderFavorite()}
      </div>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
customElements.define('mass-volume-row', VolumeRow);
