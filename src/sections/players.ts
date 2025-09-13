import { CSSResultGroup, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { keyed } from "lit/directives/keyed.js";
import '../components/player-row'
import styles from '../styles/player-queue';
import PlayersActions from "../actions/players-actions";
import { PlayerSelectedService } from "../const/actions";
import { DEFAULT_PLAYERS_CONFIG } from "../const/players";
import { Config, EntityConfig } from "../config/config";

class PlayersCard extends LitElement {
  @property({ attribute: false }) public activePlayerEntity!: EntityConfig;
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
  public get config() {
    return this._config;
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
  public get hass() {
    return this._hass;
  }
  private joinPlayers =  async (group_member: string) => {
    await this.actions.actionJoinPlayers(this.activePlayerEntity.entity_id, group_member);
  }
  private unjoinPlayers = async (player_entity: string) => {
    await this.actions.actionUnjoinPlayers(player_entity);
  }
  private transferQueue = async (target_player: string) => {
    await this.actions.actionTransferQueue(this.activePlayerEntity.entity_id, target_player);
    const player = this.config.entities.find(
      (entity) => entity.entity_id == target_player
    )!
    this.activePlayerEntity = player;
  }
  private setEntities(hass: HomeAssistant) {
    if (!this._config) {
      return;
    }
    const entities: HassEntity[] = [];
    this._config.entities.forEach(
      (item) => {
        entities.push(hass.states[item.entity_id]);
      }
    )
    this.entities = entities;
  }
  protected renderPlayerRows() {
    const attrs = this._hass.states[this.activePlayerEntity.entity_id].attributes;
    const group_members: string[] = attrs?.group_members ?? [];
    return this.entities.map(
      (item) => {
        const player = this.config.entities.find(
          (entity) => entity.entity_id == item.entity_id
        )!
        return keyed(
          item.entity_id,
          html`
            <mass-player-player-row
              .player_entity=${item}
              .playerName=${player.name}
              .selected=${this.activePlayerEntity.entity_id==item.entity_id}
              .selectedService=${this.selectedPlayerService}
              .joinService=${this.joinPlayers}
              .unjoinService=${this.unjoinPlayers}
              .transferService=${this.transferQueue}
              .joined=${group_members.includes(item.entity_id)}
              .allowJoin=${attrs.group_members !== undefined}
              .hass=${this.hass}
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
