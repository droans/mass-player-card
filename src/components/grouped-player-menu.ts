import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import "./menu-button";
import styles from "../styles/grouped-player-menu";
import { consume } from "@lit/context";
import {
  controllerContext,
  entitiesConfigContext,
  EntityConfig,
  groupedPlayersContext,
  groupVolumeContext,
  hassContext,
  IconsContext,
  useExpressiveContext,
  useVibrantContext,
} from "../const/context";
import { Icons } from "../const/icons";
import { ExtendedHass } from "../const/types";
import { jsonMatch } from "../utils/utility";
import { MassCardController } from "../controller/controller";
import PlayerActions from "../actions/player-actions";
import {
  DetailValueEventData,
  HTMLImageElementEvent,
  JoinUnjoinEventData,
} from "../const/events";
import { customElement } from "lit/decorators.js";

@customElement("mpc-grouped-player-menu")
export class MassCardPlayerSelector extends LitElement {
  private _groupedPlayers: EntityConfig[] = [];

  @consume({ context: useExpressiveContext, subscribe: true })
  private useExpressive!: boolean;

  @consume({ context: useVibrantContext, subscribe: true })
  private useVibrant!: boolean;

  @consume({ context: IconsContext, subscribe: true })
  private Icons!: Icons;

  @consume({ context: hassContext, subscribe: true })
  private hass!: ExtendedHass;

  @consume({ context: groupVolumeContext, subscribe: true })
  private groupVolumeLevel!: number;

  @consume({ context: entitiesConfigContext, subscribe: true })
  private playerEntities?: EntityConfig[];

  @consume({ context: controllerContext, subscribe: true })
  private controller!: MassCardController;

  @consume({ context: groupedPlayersContext, subscribe: true })
  private set groupedPlayersList(players: string[]) {
    const card_players = this.playerEntities?.filter((entity) => {
      return players.includes(entity.entity_id);
    });
    if (jsonMatch(this._groupedPlayers, card_players) || !card_players) {
      return;
    }
    this._groupedPlayers = card_players;
  }
  private get groupedPlayers() {
    return this._groupedPlayers;
  }

  private onUnjoinSelect = (event_: JoinUnjoinEventData) => {
    const actions = new PlayerActions(this.hass);
    const ent = event_.target.entity;
    void actions.actionUnjoinPlayers(ent);
  };
  private onGroupVolumeChange = (event_: DetailValueEventData) => {
    const vol = event_.detail.value;
    void this.controller.ActivePlayer?.setActiveGroupVolume(vol);
  };

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
              class="grouped-players-select-item-icon ${this.useExpressive
                ? `expressive`
                : ``}"
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
    `;
  }

  protected renderGroupedPlayers(): TemplateResult[] {
    const players = this.groupedPlayers;
    const ct = players.length;
    const expressive = this.useExpressive;
    const role = this.useVibrant ? `tonal` : `filled-variant`;
    return this.groupedPlayers.map((item, idx) => {
      const name =
        item.name.length > 0
          ? item.name
          : (this.hass.states[item.entity_id]?.attributes.friendly_name ?? "");
      const state = this.hass.states[item.entity_id];
      const img =
        state?.attributes.entity_picture ??
        state?.attributes.entity_picture_local;
      const fallback =
        state?.attributes.entity_picture_local ?? this.Icons.SPEAKER;
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
                class="grouped-players-select-item-image ${expressive
                  ? `expressive`
                  : ``}"
                slot="start"
                src="${img}"
                @error${(event_: HTMLImageElementEvent) => {
                  event_.target.src = fallback;
                }}
              />
              <span slot="headline" class="grouped-title"> ${name} </span>
              <span slot="end">
                <mass-player-card-button
                  .onPressService=${this.onUnjoinSelect}
                  role="${role}"
                  size="small"
                  elevation="1"
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
          <ha-md-list-item class="grouped-players-volume-item">
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
        fixedMenuPosition
      >
        ${this.renderGroupedVolume()} ${this.renderGroupedPlayers()}
      </mass-menu-button>
    `;
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}
