import { consume, provide } from "@lit/context";

import { CSSResultGroup, html, LitElement, PropertyValues } from "lit";
import { property, query } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import "../components/player-row";

import PlayersActions from "../actions/players-actions";

import "../components/section-header";

import { Config, EntityConfig } from "../config/config";
import { DEFAULT_PLAYERS_CONFIG, PlayersConfig } from "../config/players";

import { PlayerSelectedService } from "../const/actions";
import { ExtendedHass, ExtendedHassEntity } from "../const/types";
import {
  activeEntityConfContext,
  hassContext,
  playersConfigContext,
} from "../const/context";

import styles from "../styles/player-queue";
import { getTranslation } from "../utils/translations";
import { WaAnimation } from "../const/elements";

class PlayersCard extends LitElement {
  @property({ attribute: false }) private entities: ExtendedHassEntity[] = [];

  @consume({ context: activeEntityConfContext, subscribe: true })
  @property({ attribute: false })
  public activePlayerEntity!: EntityConfig;

  @query("#animation") _animation!: WaAnimation;
  private _firstLoaded = false;

  private _config!: Config;

  @provide({ context: playersConfigContext })
  private _sectionConfig!: PlayersConfig;
  public selectedPlayerService!: PlayerSelectedService;

  private _hass!: ExtendedHass;
  private actions!: PlayersActions;

  @property({ attribute: false })
  public set config(config: Config) {
    if (this._hass && config) {
      this.setEntities(this._hass);
    }
    this._config = {
      ...DEFAULT_PLAYERS_CONFIG,
      ...config,
    };
    this._sectionConfig = this._config.players;
  }
  public get config() {
    return this._config;
  }

  @consume({ context: hassContext, subscribe: true })
  public set hass(hass: ExtendedHass) {
    if (!hass) {
      return;
    }
    this._hass = hass;
    if (!this.actions) {
      this.actions = new PlayersActions(hass);
    } else {
      this.actions.hass = hass;
    }
    if (!this.entities.length) {
      this.setEntities(hass);
      return;
    }
    let update_entities = false;
    this.entities.forEach((item) => {
      const new_state = hass.states[item.entity_id];
      if (new_state !== item) {
        update_entities = true;
      }
    });
    if (update_entities) {
      this.setEntities(hass);
    }
  }
  public get hass() {
    return this._hass;
  }
  private joinPlayers = async (group_member: string[]) => {
    await this.actions.actionJoinPlayers(
      this.activePlayerEntity.entity_id,
      group_member,
    );
  };
  private unjoinPlayers = async (player_entity: string[]) => {
    await this.actions.actionUnjoinPlayers(player_entity);
  };
  private transferQueue = async (target_player: string) => {
    await this.actions.actionTransferQueue(
      this.activePlayerEntity.entity_id,
      target_player,
    );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const player = this.config.entities.find(
      (entity) => entity.entity_id == target_player,
    )!;
    this.activePlayerEntity = player;
    this.selectedPlayerService(target_player);
  };
  private setEntities(hass: ExtendedHass) {
    if (!this._config) {
      return;
    }
    const entities: ExtendedHassEntity[] = [];
    this._config.entities.forEach((item) => {
      const state = hass.states[item.entity_id];
      if (state) {
        entities.push(hass.states[item.entity_id]);
      }
    });
    this.entities = entities;
  }
  protected renderPlayerRows() {
    const attrs =
      this._hass.states[this.activePlayerEntity.entity_id].attributes;
    const group_members: string[] = attrs?.group_members ?? [];
    return this.entities.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const player = this.config.entities.find(
        (entity) => entity.entity_id == item.entity_id,
      )!;
      return keyed(
        item.entity_id,
        html`
          <mass-player-player-row
            .player_entity=${item}
            .playerName=${player.name}
            .selected=${this.activePlayerEntity.entity_id == item.entity_id}
            .selectedService=${this.selectedPlayerService}
            .joinService=${this.joinPlayers}
            .unjoinService=${this.unjoinPlayers}
            .transferService=${this.transferQueue}
            .joined=${group_members.includes(item.entity_id)}
            .allowJoin=${attrs.group_members !== undefined}
          >
          </mass-player-player-row>
        `,
      );
    });
  }
  protected render() {
    const label = getTranslation("players.header", this.hass) as string;
    const expressive = this.config.expressive;
    return html`
      <div id="container" class="${expressive ? `container-expressive` : ``}">
        <mass-section-header>
          <span slot="label" id="title"> ${label} </span>
        </mass-section-header>
        <wa-animation
          id="animation"
          name="fadeIn"
          easing="ease-in"
          iterations="1"
          play=${this.checkVisibility()}
          playback-rate="4"
        >
          <ha-md-list class="list ${expressive ? `list-expressive` : ``}">
            ${this.renderPlayerRows()}
          </ha-md-list>
        </wa-animation>
      </div>
    `;
  }
  connectedCallback(): void {
    if (this._animation && this._firstLoaded) {
      this._animation.play = true;
    }
    super.connectedCallback();
  }
  protected firstUpdated(): void {
    this._firstLoaded = true;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
customElements.define("mass-player-players-card", PlayersCard);
