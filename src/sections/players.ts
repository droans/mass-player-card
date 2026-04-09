import { consume, provide } from "@lit/context";

import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import "../components/player-row/player-row";

import PlayersActions from "../actions/players-actions";

import "../components/section-header/section-header";

import { Config, EntityConfig } from "../config/config";
import { DEFAULT_PLAYERS_CONFIG, PlayersConfig } from "../config/players";

import { PlayerSelectedService } from "../const/actions";
import { ExtendedHass, ExtendedHassEntity } from "../const/types";
import {
  activeEntityConfigContext,
  controllerContext,
  hassContext,
  playersConfigContext,
} from "../const/context";

import styles from "../styles/player-queue";
import { getTranslation } from "../utils/translations";
import { WaAnimation } from "../const/elements";
import { MassCardController } from "../controller/controller";

@customElement("mpc-players-card")
export class PlayersCard extends LitElement {
  @property({ attribute: false }) private entities: ExtendedHassEntity[] = [];

  @consume({ context: activeEntityConfigContext, subscribe: true })
  @property({ attribute: false })
  public activePlayerEntity!: EntityConfig;

  @consume({ context: controllerContext, subscribe: true })
  private controller!: MassCardController;

  @query("#animation") _animation?: WaAnimation;
  private _firstLoaded = false;

  private _config?: Config;

  @provide({ context: playersConfigContext })
  private _sectionConfig!: PlayersConfig;
  public selectedPlayerService!: PlayerSelectedService;

  private _hass?: ExtendedHass;
  private actions?: PlayersActions;

  @property({ attribute: false })
  public set config(config: Config | undefined) {
    if (!config) {
      return;
    }
    if (this._hass) {
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
  public set hass(hass: ExtendedHass | undefined) {
    if (!hass) {
      return;
    }
    this._hass = hass;
    if (this.actions) {
      this.actions.hass = hass;
    } else {
      this.actions = new PlayersActions(hass);
    }
    if (this.entities.length === 0) {
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (update_entities) {
      this.setEntities(hass);
    }
  }
  public get hass() {
    return this._hass;
  }
  private joinPlayers = async (group_member: string[]) => {
    if (!this.actions) {
      return;
    }
    await this.actions.actionJoinPlayers(
      this.activePlayerEntity.entity_id,
      group_member,
    );
  };
  private unjoinPlayers = async (player_entity: string[]) => {
    if (!this.actions) {
      return;
    }
    await this.actions.actionUnjoinPlayers(player_entity);
  };
  private transferQueue = async (target_player: string) => {
    if (!this.actions) {
      return;
    }
    await this.actions.actionTransferQueue(
      this.activePlayerEntity.entity_id,
      target_player,
    );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const player = this.config!.entities.find(
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
        entities.push(state);
      }
    });
    this.entities = entities;
  }
  private hideSectionHeader(): boolean {
    return this.config?.players.hide.header ?? false;
  }
  protected renderPlayerRows() {
    if (!this._hass || !this.controller.ActivePlayer) {
      return html``;
    }
    const attributes =
      this._hass.states[this.activePlayerEntity.entity_id]?.attributes;
    const group_members: string[] = attributes?.group_members ?? [];
    const canGroupWith = this.controller.ActivePlayer.canGroupWith;
    return this.entities.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const player = this.config!.entities.find(
        (entity) => entity.entity_id == item.entity_id,
      )!;
      const allowJoin = attributes?.group_members !== undefined;
      return keyed(
        item.entity_id,
        html`
          <mpc-player-row
            .player_entity=${item}
            .playerName=${player.name}
            .selected=${this.activePlayerEntity.entity_id == item.entity_id}
            .selectedService=${this.selectedPlayerService}
            .joinService=${this.joinPlayers}
            .unjoinService=${this.unjoinPlayers}
            .transferService=${this.transferQueue}
            .joined=${group_members.includes(item.entity_id)}
            .allowJoin=${allowJoin}
            ?can-group=${canGroupWith.includes(player.entity_id)}
          >
          </mpc-player-row>
        `,
      );
    });
  }
  protected renderHeader(): TemplateResult {
    if (this.hideSectionHeader()) {
      return html``;
    }
    const label = getTranslation("players.header", this.hass) as string;
    const usedLabel = this.config?.players.hide.header_title ? `` : label;
    return html`
      <mpc-section-header>
        <span slot="label" id="title"> ${usedLabel} </span>
      </mpc-section-header>
    `;
  }
  protected render(): TemplateResult {
    const expressive = this.config?.expressive ?? false;
    const paddedCls = this.hideSectionHeader() ? `padded` : ``;
    return html`
      <div id="container" class="${expressive ? `container-expressive` : ``}">
        ${this.renderHeader()}
        <wa-animation
          id="animation"
          name="fadeIn"
          easing="ease-in"
          iterations="1"
          play=${this.checkVisibility()}
          playback-rate="4"
        >
          <ha-md-list
            class="list ${expressive ? `list-expressive` : ``} ${paddedCls}"
          >
            ${this.renderPlayerRows()}
          </ha-md-list>
        </wa-animation>
      </div>
    `;
  }
  connectedCallback(): void {
    super.connectedCallback();
    if (this._animation && this._firstLoaded) {
      this._animation.play = true;
    }
    if (this.controller.ActivePlayer?.canGroupWith.length == 0) {
      setTimeout(() => {
        this.requestUpdate("update-groups", true);
      }, 1000);
    }
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
