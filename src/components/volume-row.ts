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
  actionsControllerContext,
  activeEntityConf,
  activePlayerDataContext,
  controllerContext,
  EntityConfig,
  musicPlayerConfigContext
} from "../const/context";
import { PlayerData } from "../const/music-player";

import styles from '../styles/volume-row';
import { ActionsController } from "../controller/actions.js";
import { MassCardController } from "../controller/controller.js";

class VolumeRow extends LitElement {

  private maxVolume!: number;

  private _config!: PlayerConfig;
  private _entityConfig!: EntityConfig;
  @consume({ context: controllerContext })
  private controller!: MassCardController;

  private hide: PlayerHiddenElementsConfig = DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG;
  private _player_data!: PlayerData;

  @consume({ context: actionsControllerContext, subscribe: true})
  private actions!: ActionsController
  
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
    this.maxVolume = config.max_volume;
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
    const expressive = this.controller.config.expressive;
    this.hide = {
      favorite: entity.favorite || card.favorite || expressive,
      mute: entity.mute || card.mute,
      power: entity.power || card.power || expressive,
      volume: entity.volume || card.volume,
      player_selector: false,
      repeat: false,
      shuffle: false,
      group_volume: false
    }
  }
  private onToggle = async () => {
    await this.actions.actionTogglePower();
  }
  private onVolumeMuteToggle = async () => {
    await this.actions.actionToggleMute();
  }
  private onVolume = async (ev: CustomEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    let volume: number = ev.detail.value;
    if (isNaN(volume)) return;
    this.player_data.volume = volume;
    volume = volume / 100;
    await this.actions.actionSetVolume(volume);
  }
  private onFavorite = async () => {
    if (this.player_data.favorite) {
      await this.actions.actionRemoveFavorite();
    } else {
      await this.actions.actionAddFavorite();
    }
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
        class="button-min"
        part="button-power"
        @click=${this.onToggle}
      >
        <ha-svg-icon
          .path=${mdiPower}
          class="svg-plain"
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
        class="button-min"
        part="button-mute"
        @click=${this.onVolumeMuteToggle}
      >
        <ha-svg-icon
          .path=${this.player_data.muted ? mdiVolumeMute : mdiVolumeHigh}
          class="svg-plain"
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
        class="button-min"
        part="button-favorite"
        @click=${this.onFavorite}
      >
        <ha-svg-icon
          .path=${this.player_data.favorite ? mdiHeart : mdiHeartPlusOutline}
          class="svg-plain"
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
      <div id="volume" part="volume-div">
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
