import { consume } from "@lit/context";
import { CSSResultGroup, html, LitElement, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { ExtendedHass, ExtendedHassEntity } from "../const/types";
import { hassContext } from "../const/context";
import PlayerActions from "../actions/player-actions";
import styles from "../styles/volume-slider";
import { DetailValEventData } from "../const/events.js";
class VolumeSlider extends LitElement {
  @property({ attribute: false }) public maxVolume = 100;
  @state() private entity!: ExtendedHassEntity;
  private _entityId!: string;
  private _actions!: PlayerActions;
  private _hass!: ExtendedHass;

  @property({ attribute: false })
  public set entityId(entity_id: string) {
    this._entityId = entity_id;
    if (!this.hass) {
      return;
    }
    this.entity = this.hass.states[entity_id];
  }
  public get entityId() {
    return this._entityId;
  }
  @consume({ context: hassContext, subscribe: true })
  public set hass(hass: ExtendedHass) {
    this._hass = hass;
    this._actions = new PlayerActions(hass);
    this.entity = hass.states[this.entityId];
  }
  public get hass() {
    return this._hass;
  }
  private onVolumeChange = async (ev: DetailValEventData) => {
    let volume: number = ev.detail.value;
    volume = volume / 100;
    this.requestUpdate("volume", volume);
    await this._actions.actionSetVolume(this.entity, volume);
  };
  protected render() {
    return html`
      <ha-control-slider
        part="slider"
        style="--control-slider-color: var(--md-sys-color-primary) !important;"
        .disabled=${this.entity.attributes.is_volume_muted}
        .unit="%"
        .value=${this.entity.attributes.volume_level * 100}
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
