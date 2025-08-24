import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { Config, PlayerSelectedService } from "../types";
import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { keyed } from "lit/directives/keyed.js";
import '../components/player-row'

class PlayersCard extends LitElement {
  @property({ attribute: false }) public activePlayerEntity!: string;
  @property({ attribute: false }) private entities: Array<HassEntity> = [];
  public selectedPlayerService!: PlayerSelectedService;
  private _config!: Config
  
  @property( {attribute: false } )
  public set config(config: Config) {
    if(this.hass && config) {
      this.setEntities(this.hass)
    }
    this._config = config;
  }
  public set hass(hass: HomeAssistant) {
    if (!hass) {
      return;
    }
    if (!this.entities.length) {
      this.setEntities(hass);
      return;
    }
    var update_entities = false;
    this.entities.forEach(
      (item) => {
        var new_state = hass.states[item.entity_id];
        if (new_state !== item) {
          update_entities = true;
        }
      }
    )
    if (update_entities) {
      this.setEntities(hass);
    }
  }
  
  private setEntities(hass: HomeAssistant) {
    if (!this._config) {
      return;
    }
    var entities: Array<HassEntity> = [];
    this._config.entities.forEach(
      (item) => {
        entities.push(hass.states[item]);
      }
    )
    this.entities = entities;
  }
  
  protected renderPlayerRows() {
    return this.entities.map(
      (item) => {
        return keyed(
          item.entity_id,
          html`
            <mass-player-player-row
              .player_entity=${item}
              .selected=${this.activePlayerEntity==item.entity_id}
              .selectedService=${this.selectedPlayerService}
            >
            </mass-player-player-row>
          `
        )
      }
    )
  }
  protected render() {
    return html`
      <ha-card>
      ${this.renderPlayerRows()}
      </ha-card>
    `
  }
}
customElements.define('mass-player-players-card', PlayersCard);
