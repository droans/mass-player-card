import { consume } from "@lit/context";
import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";

import PlayerActions from "../../actions/player-actions";
import { activeMediaPlayerContext } from "../../const/context";
import { DetailValueEventData } from "../../const/events";
import { ExtendedHassEntity } from "../../const/types";
import styles from "./volume-slider-styles";

@customElement("mpc-volume-slider")
export class VolumeSlider extends LitElement {
  @property({ attribute: false }) public maxVolume = 100;
  private _actions!: PlayerActions;
  @consume({ context: activeMediaPlayerContext, subscribe: true })
  @state()
  private playerEntity?: ExtendedHassEntity;

  private onVolumeChange = async (event_: DetailValueEventData) => {
    if (!this.playerEntity) {
      return;
    }
    let volume: number = event_.detail.value;
    volume = volume / 100;
    this.requestUpdate("volume", volume);
    await this._actions.actionSetVolume(this.playerEntity, volume);
  };
  protected render(): TemplateResult {
    if (!this.playerEntity) {
      return html``;
    }
    return html`
      <ha-control-slider
        part="slider"
        style="--control-slider-color: var(--md-sys-color-primary) !important;"
        .disabled=${this.playerEntity.attributes.is_volume_muted}
        .unit="%"
        .value=${(this.playerEntity.attributes.volume_level ?? 0) * 100}
        .min="0"
        .max=${this.maxVolume}
        @value-changed=${this.onVolumeChange}
      ></ha-control-slider>
    `;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
  protected styles(): CSSResultGroup {
    return styles;
  }
}
