import { consume } from "@lit/context";
import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { property, state } from "lit/decorators.js";

import { ExtendedHass, ExtendedHassEntity } from "../const/types";
import { hassContext } from "../const/context";
import PlayerActions from "../actions/player-actions";
import styles from "../styles/volume-slider";
import { DetailValueEventData } from "../const/events";
class VolumeSlider extends LitElement {
  @property({ attribute: false }) public maxVolume = 100;
  @state() private entity?: ExtendedHassEntity;
  private _entityId!: string;
  private _actions!: PlayerActions;
  private _hass!: ExtendedHass;

  @property({ attribute: false })
  public set entityId(entity_id: string) {
    this._entityId = entity_id;
    if (!this.hass) {
      return;
    }
    const ent = this.hass.states[entity_id];
    if (ent) {
      this.entity = ent;
    }
  }
  public get entityId() {
    return this._entityId;
  }
  @consume({ context: hassContext, subscribe: true })
  public set hass(hass: ExtendedHass | undefined) {
    if (!hass) {
      return;
    }
    this._hass = hass;
    this._actions = new PlayerActions(hass);
    const ent = hass.states[this.entityId];
    if (ent) {
      this.entity = ent;
    }
  }
  public get hass() {
    return this._hass;
  }
  private onVolumeChange = async (event_: DetailValueEventData) => {
    if (!this.entity) {
      return;
    }
    let volume: number = event_.detail.value;
    volume = volume / 100;
    this.requestUpdate("volume", volume);
    await this._actions.actionSetVolume(this.entity, volume);
  };
  protected render(): TemplateResult {
    if (!this.entity) {
      return html``;
    }
    return html`
      <ha-control-slider
        part="slider"
        style="--control-slider-color: var(--md-sys-color-primary) !important;"
        .disabled=${this.entity.attributes.is_volume_muted}
        .unit="%"
        .value=${this.entity.attributes.volume_level ?? 0 * 100}
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
customElements.define("mass-volume-slider", VolumeSlider);
