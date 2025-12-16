import {
  CSSResultGroup,
  html,
  LitElement,
  TemplateResult
} from "lit";
import "./menu-button";
import styles from '../styles/grouped-player-menu';
import { consume } from "@lit/context";
import {
  controllerContext,
  entitiesConfigContext,
  EntityConfig,
  groupedPlayersContext,
  groupVolumeContext,
  hassContext,
  IconsContext,
  useExpressiveContext
} from "../const/context.js";
import { Icons } from "../const/icons.js";
import { ExtendedHass } from "../const/types.js";
import { jsonMatch } from "../utils/util.js";
import { MassCardController } from "../controller/controller.js";
import PlayerActions from "../actions/player-actions.js";
import { DetailValEventData, JoinUnjoinEventData } from "../const/events.js";
import { customElement } from "lit/decorators.js";


@customElement('mpc-grouped-player-menu')
export class MassCardPlayerSelector extends LitElement {
  private _groupedPlayers: EntityConfig[] = [];

  @consume({ context: useExpressiveContext, subscribe: true })
  private useExpressive!: boolean;

  @consume({ context: IconsContext, subscribe: true })
  private Icons!: Icons;

  @consume({ context: hassContext, subscribe: true })
  private hass!: ExtendedHass;

  @consume({ context: groupVolumeContext, subscribe: true })
  private groupVolumeLevel!: number;

  @consume({ context: entitiesConfigContext, subscribe: true })
  private playerEntities!: EntityConfig[];

  @consume({ context: controllerContext, subscribe: true })
  private controller!: MassCardController;

  @consume({ context: groupedPlayersContext, subscribe: true })
  private set groupedPlayersList(players: string[]) {
    const card_players = this.playerEntities.filter(
      (entity) => {
        return players?.includes(entity.entity_id)
      }
    )
    if (jsonMatch(this._groupedPlayers, card_players)) {
      return;
    }
    this._groupedPlayers = card_players;
  }
  private get groupedPlayers() {
    return this._groupedPlayers;
  }


  private onUnjoinSelect = (ev: JoinUnjoinEventData) => {
    const actions = new PlayerActions(this.hass);
    const ent = ev.target.entity;
    void actions.actionUnjoinPlayers(ent)
  }
  private onGroupVolumeChange = (ev: DetailValEventData) => {
    const vol = ev.detail.value;
    void this.controller.ActivePlayer.setActiveGroupVolume(vol); 
  }

  protected renderGroupedVolume(): TemplateResult {
    const vol_level = this.groupVolumeLevel;
    return html`
      <div class="grouped-players-item grouped-volume">
        <div class="player-name-icon">
          <ha-md-list-item
            class="grouped-players-select-item"
            .graphic=${this.Icons.SPEAKER_MULTIPLE}
            noninteractive
            hide-label
          >
            <ha-svg-icon
              class="grouped-players-select-item-icon ${this.useExpressive ? `expressive` : ``}"
              slot="start"
              .path=${this.Icons.SPEAKER_MULTIPLE}
            ></ha-svg-icon>
            <ha-control-slider
              part="slider"
              style="--control-slider-color: var(--md-sys-color-primary) !important"
              id="grouped-volume"
              .unit="%"
              .min="0"
              .max="100"
              .value=${vol_level}
              @value-changed=${this.onGroupVolumeChange}
            ></ha-control-slider>
          </ha-md-list-item>
        </div>
        <div class="divider"></div>
      </div>
    `
  }

  protected renderGroupedPlayers(): TemplateResult[] {
    const players = this.groupedPlayers;
    const ct = players.length;
    const expressive = this.useExpressive;
    const role = this.controller.config.expressive_scheme == "vibrant" ? `tonal` : `filled-variant`
    return this.groupedPlayers.map((item, idx) => {
      const name =
        item.name.length > 0
          ? item.name
          : this.hass.states[item.entity_id].attributes.friendly_name;
      const state = this.hass.states[item.entity_id];
      const img = state.attributes.entity_picture ?? state.attributes.entity_picture_local;
      const fallback = state.attributes.entity_picture_local ?? this.Icons.SPEAKER;
      return html`
        <div class="grouped-players-item">
          <div class="player-name-icon">
            <ha-md-list-item
              class="grouped-players-select-item"
              .graphic=${this.Icons.SPEAKER}
              noninteractive
              hide-label
            >
              <img 
                class="grouped-players-select-item-image ${expressive ? `expressive` : ``}"
                slot="start"
                src="${img}"
                onerror="this.src = '${fallback}';"
              >
              <span slot="headline" class="grouped-title"> ${name} </span>
              <span slot="end">

                <mass-player-card-button
                  .onPressService=${this.onUnjoinSelect}
                  role="${role}"
                  size="small"
                  elevation=1
                  class="grouped-button-unjoin ${expressive
                    ? `grouped-button-unjoin-expressive`
                    : ``}"
                >
                  <ha-svg-icon
                    .path=${this.Icons.LINK_OFF}
                    class="grouped-svg-unjoin ${expressive ? `expressive` : ``}"
                    .entity="${item.entity_id}"
                  ></ha-svg-icon>
                </mass-player-card-button>
              </span>
            </ha-md-list-item>
          </div>
          <ha-md-list-item
            class="grouped-players-volume-item"
          >
            <mass-volume-slider
              class="grouped-players-volume-slider"
              maxVolume=${item.max_volume}
              .entityId=${item.volume_entity_id}
            ></mass-volume-slider>
          </ha-md-list-item>
          ${idx < ct - 1 ? html`<div class="divider"></div>` : ``}
        </div>
      `;
    });    
  }

  protected render(): TemplateResult {

    return html`
      <mass-menu-button
        slot="end"
        id="grouped-players-menu"
        class="menu-header ${this.useExpressive ? `expressive` : ``}"
        .iconPath=${this.Icons.SPEAKER_MULTIPLE}
        naturalMenuWidth
      >
        ${this.renderGroupedVolume()}
        ${this.renderGroupedPlayers()}
      </mass-menu-button>
    `
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}