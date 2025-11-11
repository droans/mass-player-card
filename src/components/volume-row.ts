import { consume } from "@lit/context";
import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";

import {
  DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
  PlayerConfig,
  PlayerHiddenElementsConfig,
} from "../config/player";

import {
  actionsControllerContext,
  activeEntityConf,
  activePlayerDataContext,
  controllerContext,
  EntityConfig,
  IconsContext,
  musicPlayerConfigContext,
} from "../const/context";
import { PlayerData } from "../const/music-player";

import styles from "../styles/volume-row";
import { ActionsController } from "../controller/actions.js";
import { MassCardController } from "../controller/controller.js";
import { Icons } from "../const/icons.js";
import { jsonMatch } from "../utils/util.js";
import { state } from "lit/decorators.js";

class VolumeRow extends LitElement {
  private maxVolume!: number;

  private _config!: PlayerConfig;
  private _entityConfig!: EntityConfig;
  @consume({ context: controllerContext })
  private controller!: MassCardController;
  @consume({ context: IconsContext }) private Icons!: Icons;

  private _initialUpdate!: boolean;

  private hide: PlayerHiddenElementsConfig =
    DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG;
  @state() public _player_data!: PlayerData;

  @consume({ context: actionsControllerContext, subscribe: true })
  private actions!: ActionsController;

  @consume({ context: musicPlayerConfigContext, subscribe: true })
  public set config(config: PlayerConfig) {
    if (jsonMatch(this._config, config)) {
      return;
    }
    this._config = config;
    if (this._config && this._entityConfig) {
      this.updateHiddenElements();
    }
  }
  public get config() {
    return this._config;
  }

  @consume({ context: activeEntityConf, subscribe: true })
  public set entityConfig(config: EntityConfig) {
    if (jsonMatch(this._entityConfig, config)) {
      return;
    }
    this._entityConfig = config;
    this.maxVolume = config.max_volume;
    if (this._config && this._entityConfig) {
      this.updateHiddenElements();
    }
  }
  public get entityConfig() {
    return this._entityConfig;
  }

  @consume({ context: activePlayerDataContext, subscribe: true })
  public set player_data(player_data: PlayerData) {
    if (jsonMatch(this._player_data, player_data)) {
      return;
    }
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
      group_volume: false,
    };
  }
  private onToggle = async () => {
    await this.actions.actionTogglePower();
  };
  private onVolumeMuteToggle = async () => {
    await this.actions.actionToggleMute();
  };
  private onVolume = async (ev: CustomEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    let volume: number = ev.detail.value;
    if (isNaN(volume)) return;
    this.player_data.volume = volume;
    volume = volume / 100;
    this.requestUpdate("volume", this.player_data.volume);
    await this.actions.actionSetVolume(volume);
  };
  private onFavorite = async () => {
    if (this.player_data.favorite) {
      await this.actions.actionRemoveFavorite();
    } else {
      await this.actions.actionAddFavorite();
    }
  };
  protected renderPower(): TemplateResult {
    if (this.hide.power) {
      return html``;
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
        <ha-svg-icon .path=${this.Icons.POWER} class="svg-plain"></ha-svg-icon>
      </ha-button>
    `;
  }
  protected renderMute(): TemplateResult {
    if (this.hide.mute) {
      return html``;
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
          .path=${this.player_data.muted
            ? this.Icons.VOLUME_MUTE
            : this.Icons.VOLUME_HIGH}
          class="svg-plain"
        ></ha-svg-icon>
      </ha-button>
    `;
  }
  protected renderFavorite(): TemplateResult {
    if (this.hide.favorite) {
      return html``;
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
          .path=${this.player_data.favorite
            ? this.Icons.HEART
            : this.Icons.HEART_PLUS}
          class="svg-plain"
        ></ha-svg-icon>
      </ha-button>
    `;
  }
  protected renderTicks() {
    if (!this.controller.config.expressive) {
      return;
    }
    const tickCt = 19;
    const rng = [...Array(tickCt).keys()];
    const vol = this.player_data.volume;
    return html`
      <div id="ticks">
        ${rng.map((i) => {
          const tick_pct = ((i + 1) * 100) / (tickCt + 1);
          const tick_inside = tick_pct <= vol;
          return html`
            <div
              class="tick tick-${tick_inside ? `in` : `out`}"
              value=${tick_pct}
              tick=${i}
            ></div>
          `;
        })}
      </div>
    `;
  }
  protected renderVolumeBar(): TemplateResult {
    if (this.hide.volume) {
      return html``;
    }
    return html`
      <div id="div-slider">
        <ha-control-slider
          .unit="%"
          .value=${this.player_data.volume}
          .min="0"
          .max=${this.maxVolume}
          @value-changed=${this.onVolume}
          id="volume-slider"
          class="${this.controller.ActivePlayer.useExpressive
            ? `volume-slider-expressive`
            : ``}"
          part="volume-slider"
        ></ha-control-slider>
        ${this.renderTicks()}
      </div>
    `;
  }
  protected render(): TemplateResult {
    return html`
      <div id="volume" part="volume-div">
        ${this.renderPower()} ${this.renderVolumeBar()} ${this.renderMute()}
        ${this.renderFavorite()}
      </div>
    `;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0 || !this._initialUpdate;
  }
  protected firstUpdated(): void {
    this._initialUpdate = true;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
customElements.define("mass-volume-row", VolumeRow);
