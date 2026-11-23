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

import "../components/player-row/active-player-row";
import "../components/player-row/player-row";

import "../components/section-header/section-header";

import { Config, EntityConfig } from "../config/config";
import { DEFAULT_PLAYERS_CONFIG, PlayersConfig } from "../config/players";

import { PlayerSelectedService } from "../const/actions";
import {
  activeEntityConfigContext,
  activeMediaPlayerContext,
  controllerContext,
  hassPlayersContext,
  hassUIServicesContext,
  playersConfigContext,
} from "../const/context";
import {
  ExtendedHassEntity,
  PlayersHass,
  UIServicesHass,
} from "../const/types";

import { WaAnimation } from "../const/elements";
import { MassCardController } from "../controller/controller";
import styles from "../styles/players";
import { getTranslation } from "../utils/translations";

@customElement("mpc-players-card")
export class PlayersCard extends LitElement {
  @property({ attribute: false }) private entities: ExtendedHassEntity[] = [];
  @consume({ context: activeMediaPlayerContext, subscribe: true })
  private activePlayerEntity?: ExtendedHassEntity;

  @consume({ context: activeEntityConfigContext, subscribe: true })
  @property({ attribute: false })
  public activePlayerConfig!: EntityConfig;

  @consume({ context: controllerContext, subscribe: true })
  private controller!: MassCardController;

  @query("#animation") _animation?: WaAnimation;
  private _firstLoaded = false;

  private _config?: Config;

  @provide({ context: playersConfigContext })
  private _sectionConfig!: PlayersConfig;
  public selectedPlayerService!: PlayerSelectedService;
  private _hassPlayers?: PlayersHass;
  @consume({ context: hassUIServicesContext, subscribe: true })
  private hassUIServices?: UIServicesHass;
  // private actions?: PlayersActions;

  @property({ attribute: false })
  public set config(config: Config | undefined) {
    if (!config) {
      return;
    }
    if (this.hassPlayers) {
      this.setEntities(this.hassPlayers);
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

  @consume({ context: hassPlayersContext, subscribe: true })
  public set hassPlayers(hass: PlayersHass | undefined) {
    if (!hass) {
      return;
    }
    this._hassPlayers = hass;
    this.setEntities(hass);
  }
  public get hassPlayers() {
    return this._hassPlayers;
  }

  private joinPlayers = async (groupMember: string[]) => {
    if (!this.controller.Actions) {
      return;
    }
    await this.controller.Actions.playersActions.actionJoinPlayers(
      this.activePlayerConfig.entity_id,
      groupMember,
    );
    this.controller.ActivePlayer?.setGroupAttributes();
  };
  private unjoinPlayers = async (playerEntity: string[]) => {
    if (!this.controller.Actions) {
      return;
    }
    await this.controller.Actions.playersActions.actionUnjoinPlayers(
      playerEntity,
    );
    this.controller.ActivePlayer?.setGroupAttributes();
  };
  private transferQueue = async (targetPlayer: string) => {
    if (!this.controller.Actions) {
      return;
    }
    await this.controller.Actions.playersActions.actionTransferQueue(
      this.activePlayerConfig.entity_id,
      targetPlayer,
    );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const player = this.config!.entities.find(
      (entity) => entity.entity_id == targetPlayer,
    )!;
    this.activePlayerConfig = player;
    this.selectedPlayerService(targetPlayer);
  };
  private setEntities(hass: PlayersHass) {
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
    if (!this.hassPlayers || !this.controller.ActivePlayer) {
      return html``;
    }
    const attributes = this.activePlayerEntity?.attributes;
    const groupMembers: string[] = attributes?.group_members ?? [];
    const canGroupWith = this.controller.ActivePlayer.canGroupWith;
    return this.entities.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const player = this.config!.entities.find(
        (entity) => entity.entity_id == item.entity_id,
      )!;
      const allowJoin = attributes?.group_members !== undefined;
      if (this.activePlayerConfig.entity_id == item.entity_id) {
        return html``;
      }
      return keyed(
        item.entity_id,
        html`
          <mpc-player-row
            class="player-row"
            .player_entity=${item}
            .playerName=${player.name}
            .selectedService=${this.selectedPlayerService}
            .joinService=${this.joinPlayers}
            .unjoinService=${this.unjoinPlayers}
            .transferService=${this.transferQueue}
            .joined=${groupMembers.includes(item.entity_id)}
            .allowJoin=${allowJoin}
            ?selected=${this.activePlayerConfig.entity_id == item.entity_id}
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
    const label = getTranslation(
      "players.header",
      this.hassUIServices,
    ) as string;
    const usedLabel = this.config?.players.hide.header_title ? `` : label;
    return html`
      <mpc-section-header>
        <span slot="label" id="title"> ${usedLabel} </span>
      </mpc-section-header>
    `;
  }
  protected render(): TemplateResult {
    const paddedCls = this.hideSectionHeader() ? `padded` : ``;
    const label = getTranslation(
      "players.label.move_players_label",
      this.hassUIServices,
    );
    return html`
      <div id="container">
        ${this.renderHeader()}
        <wa-animation
          id="animation"
          name="fadeIn"
          easing="ease-in"
          iterations="1"
          play=${this.checkVisibility()}
          playback-rate="4"
        >
          <div class="selected-player">
            <mpc-active-player-row
              .joinService=${this.joinPlayers}
              .unJoinService=${this.unjoinPlayers}
            >
            </mpc-active-player-row>
          </div>
          <div class="div-players-title">
            <div class="players-title">${label}</div>
            <div class="divider"></div>
          </div>
          <div class="list ${paddedCls}">${this.renderPlayerRows()}</div>
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
