import { consume } from "@lit/context";
import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property } from "lit/decorators.js";

import {
  actionsControllerContext,
  hassPlayersContext,
} from "../../const/context";
import { DetailValueEventData } from "../../const/events";
import { ExtendedHassEntity, PlayersHass } from "../../const/types";
import { ActionsController } from "../../controller/actions";
import styles from "./volume-slider-styles";

@customElement("mpc-volume-slider")
export class VolumeSlider extends LitElement {
  @property({ attribute: false }) public maxVolume = 100;
  private _entityId!: string;
  private playerEntity?: ExtendedHassEntity;
  @consume({ context: actionsControllerContext, subscribe: true })
  private actionsController?: ActionsController;

  private _hassPlayers?: PlayersHass;

  @property({ attribute: false })
  public set entityId(entityId: string) {
    this._entityId = entityId;
    this.setEntity();
  }
  public get entityId() {
    return this._entityId;
  }

  @consume({ context: hassPlayersContext, subscribe: true })
  public set hassPlayers(hass: PlayersHass | undefined) {
    if (!hass) {
      return;
    }
    this._hassPlayers = hass;
    this.setEntity();
  }
  public get hassPlayers() {
    return this._hassPlayers;
  }

  private setEntity() {
    if (!this.hassPlayers || !this.entityId) {
      return;
    }
    const entity = this.hassPlayers.states[this.entityId];
    if (entity && entity != this.playerEntity) {
      this.playerEntity = entity;
    }
  }

  private onVolumeChange = async (event_: DetailValueEventData) => {
    if (!this.playerEntity) {
      return;
    }
    let volume: number = event_.detail.value;
    volume = volume / 100;
    this.requestUpdate("volume", volume);
    await this.actionsController?.PlayerActions.actionSetVolume(
      this.playerEntity,
      volume,
    );
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
