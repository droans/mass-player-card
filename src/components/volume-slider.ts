import { consume } from '@lit/context';
import {
  CSSResultGroup,
  html,
  LitElement,
} from 'lit'
import {
  property,
  state
} from "lit/decorators.js";

import {
  ExtendedHass,
  ExtendedHassEntity,
} from '../const/common';
import {
  hassExt,
} from '../const/context';
import PlayerActions from '../actions/player-actions';
import styles from '../styles/volume-slider'
class VolumeSlider extends LitElement {
  @property({attribute: false}) public maxVolume = 100;
  @state() private entity!: ExtendedHassEntity;
  private _entityId!: string;
  private _actions!: PlayerActions;
  private _hass!: ExtendedHass;

  @property({ attribute: false})
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
  @consume({ context: hassExt, subscribe: true})
  public set hass(hass: ExtendedHass) {
    this._hass = hass;
    this._actions = new PlayerActions(hass);
    this.entity = hass.states[this.entityId];
  }
  public get hass() {
    return this._hass;
  }
  private onVolumeChange = async (ev: CustomEvent) => {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    let volume: number = ev.detail.value as number;
    volume = volume / 100;
    await this._actions.actionSetVolume(this.entity, volume);
    this.requestUpdate();
  }
  protected render() {
    return html`
      <ha-control-slider
        part="slider"
        .disabled=${this.entity.attributes.is_volume_muted}
        .unit="%"
        .value=${this.entity.attributes.volume_level * 100}
        .min=0
        .max=${this.maxVolume}
        @value-changed=${this.onVolumeChange}
      ></ha-control-slider>
    `
  }
  protected styles(): CSSResultGroup {
    return styles;
  }
}
customElements.define('mass-volume-slider', VolumeSlider);
