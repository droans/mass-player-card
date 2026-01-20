import { consume } from "@lit/context";
import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";

import { PlayerConfig, PlayerHiddenElementsConfig } from "../../config/player";

import {
  actionsControllerContext,
  activeEntityConfigContext,
  activePlayerDataContext,
  controllerContext,
  EntityConfig,
  IconsContext,
  musicPlayerConfigContext,
  musicPlayerHiddenElementsConfigContext,
  useExpressiveContext,
} from "../../const/context";
import { PlayerData } from "../../const/types";

import styles from "./volume-row-styles";
import { ActionsController } from "../../controller/actions";
import { MassCardController } from "../../controller/controller";
import { Icons } from "../../const/icons";
import { jsonMatch } from "../../utils/utility";
import { state } from "lit/decorators.js";
import { DetailValueEventData } from "../../const/events";

class VolumeRow extends LitElement {
  private maxVolume!: number;

  private _config?: PlayerConfig;
  private _entityConfig?: EntityConfig;
  @consume({ context: controllerContext })
  private controller!: MassCardController;
  @consume({ context: IconsContext }) private Icons!: Icons;

  private _initialUpdate!: boolean;

  @consume({ context: musicPlayerHiddenElementsConfigContext, subscribe: true })
  private hide!: PlayerHiddenElementsConfig;
  @state() public _player_data!: PlayerData;

  @consume({ context: actionsControllerContext, subscribe: true })
  private actions!: ActionsController;

  @consume({ context: useExpressiveContext, subscribe: true })
  private useExpressive?: boolean;

  @consume({ context: musicPlayerConfigContext, subscribe: true })
  public set config(config: PlayerConfig | undefined) {
    if (jsonMatch(this._config, config) || !config) {
      return;
    }
    this._config = config;
  }
  public get config() {
    return this._config;
  }

  @consume({ context: activeEntityConfigContext, subscribe: true })
  public set entityConfig(config: EntityConfig | undefined) {
    if (jsonMatch(this._entityConfig, config) || !config) {
      return;
    }
    this._entityConfig = config;
    this.maxVolume = config.max_volume;
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

  private onToggle = async () => {
    await this.actions.actionTogglePower();
  };
  private onVolumeMuteToggle = async () => {
    await this.actions.actionToggleMute();
  };
  private onVolume = async (event_: DetailValueEventData) => {
    let volume: number = event_.detail.value;
    if (Number.isNaN(volume)) return;
    this.player_data.volume = volume;
    volume = volume / 100;
    this.requestUpdate("volume", this.player_data.volume);
    await this.actions.actionSetVolume(volume);
  };
  private onFavorite = async () => {
    await (this.player_data.favorite
      ? this.actions.actionRemoveFavorite()
      : this.actions.actionAddFavorite());
  };
  protected renderPower(): TemplateResult {
    if (this.hide.power || this.useExpressive) {
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
    if (this.hide.favorite || this.useExpressive) {
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
    if (!this.useExpressive) {
      return html``;
    }
    const tickCt = 19;
    const rng = [...Array(tickCt).keys()];
    const vol = this.player_data.volume;
    const max_vol = this.maxVolume;
    return html`
      <div id="ticks">
        ${rng.map((i) => {
          const tick_pct = ((i + 1) * max_vol) / (tickCt + 1);
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
          class="${this.controller.ActivePlayer?.useExpressive
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
