import { CSSResultGroup, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { Config, PlayerSelectedService } from "../types";
import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { keyed } from "lit/directives/keyed.js";
import '../components/player-row'
import styles from '../styles/player-queue';
import PlayersActions from "../actions/players-actions";
import { DEFAULT_PLAYERS_CONFIG } from "../const";

class PlayersCard extends LitElement {
  @property({ attribute: false }) public activePlayerEntity!: string;
  @property({ attribute: false }) private entities: HassEntity[] = [];
  public selectedPlayerService!: PlayerSelectedService;
  private _config!: Config;
  private actions!: PlayersActions;
  private _hass!: HomeAssistant;
  
  @property( {attribute: false } )
  public set config(config: Config) {
    if(this._hass && config) {
      this.setEntities(this._hass)
    }
    this._config = {
      ...DEFAULT_PLAYERS_CONFIG,
      ...config
    };
  }
  public set hass(hass: HomeAssistant) {
    if (!hass) {
      return;
    }
    this._hass = hass;
    if (!this.actions) {
      this.actions = new PlayersActions(hass);
    }
    if (!this.entities.length) {
      this.setEntities(hass);
      return;
    }
    let update_entities = false;
    this.entities.forEach(
      (item) => {
        const new_state = hass.states[item.entity_id];
        if (new_state !== item) {
          update_entities = true;
        }
      }
    )
    if (update_entities) {
      this.setEntities(hass);
    }
  }
  private joinPlayers =  async (group_member: string) => {
    await this.actions.actionJoinPlayers(this.activePlayerEntity, group_member);
  }
  private unjoinPlayers = async (player_entity: string) => {
    await this.actions.actionUnjoinPlayers(player_entity);
  }
  private transferQueue = async (target_player: string) => {
    await this.actions.actionTransferQueue(this.activePlayerEntity, target_player);
    this.activePlayerEntity = target_player;
  }
  private setEntities(hass: HomeAssistant) {
    if (!this._config) {
      return;
    }
    const entities: HassEntity[] = [];
    this._config.entities.forEach(
      (item) => {
        entities.push(hass.states[item]);
      }
    )
    this.entities = entities;
  }
  protected renderPlayerRows() {
    const attrs = this._hass.states[this.activePlayerEntity].attributes;
    const group_members: string[] = attrs?.group_members ?? [];
    return this.entities.map(
      (item) => {
        return keyed(
          item.entity_id,
          html`
            <mass-player-player-row
              .player_entity=${item}
              .selected=${this.activePlayerEntity==item.entity_id}
              .selectedService=${this.selectedPlayerService}
              .joinService=${this.joinPlayers}
              .unjoinService=${this.unjoinPlayers}
              .transferService=${this.transferQueue}
              .joined=${group_members.includes(item.entity_id)}
              .allowJoin=${attrs.group_members !== undefined}
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
        <ha-md-list class="list">
          ${this.renderPlayerRows()}
        </ha-md-list>
      </ha-card>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
customElements.define('mass-player-players-card', PlayersCard);
