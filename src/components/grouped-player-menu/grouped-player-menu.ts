import { consume } from "@lit/context";
import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, state } from "lit/decorators.js";
import PlayerActions from "../../actions/player-actions";
import {
  controllerContext,
  entitiesConfigContext,
  EntityConfig,
  groupedPlayersContext,
  groupVolumeContext,
  hassPlayersContext,
  hassUIServicesContext,
  IconsContext,
  useVibrantContext,
} from "../../const/context";
import { Thumbnail } from "../../const/enums";
import {
  DetailValueEventData,
  HTMLImageElementEvent,
  JoinUnjoinEventData,
} from "../../const/events";
import { Icons } from "../../const/icons";
import { PlayersHass, UIServicesHass } from "../../const/types";
import { MassCardController } from "../../controller/controller";
import { computeEntityName } from "../../utils/entity-name";
import { getThumbnail } from "../../utils/thumbnails";
import { jsonMatch } from "../../utils/utility";
import "../menu-button/menu-button";
import "../volume-slider/volume-slider";
import styles from "./grouped-player-menu-styles";

@customElement("mpc-grouped-player-menu")
export class MassCardPlayerSelector extends LitElement {
  @state()
  private _groupedPlayers: EntityConfig[] = [];

  @state()
  @consume({ context: useVibrantContext, subscribe: true })
  private useVibrant!: boolean;

  @consume({ context: IconsContext, subscribe: true })
  private Icons!: Icons;

  @consume({ context: hassPlayersContext, subscribe: true })
  private playersHass!: PlayersHass;
  @consume({ context: hassUIServicesContext, subscribe: true })
  private uiHass!: UIServicesHass;

  @state()
  @consume({ context: groupVolumeContext, subscribe: true })
  private groupVolumeLevel!: number;

  @state()
  @consume({ context: entitiesConfigContext, subscribe: true })
  private playerEntities?: EntityConfig[];

  @consume({ context: controllerContext, subscribe: false })
  private controller!: MassCardController;

  @consume({ context: groupedPlayersContext, subscribe: true })
  private set groupedPlayersList(players: string[]) {
    const cardPlayers = this.playerEntities?.filter((entity) => {
      return players.includes(entity.entity_id);
    });
    if (jsonMatch(this._groupedPlayers, cardPlayers) || !cardPlayers) {
      return;
    }
    this._groupedPlayers = cardPlayers;
  }
  private get groupedPlayers() {
    return this._groupedPlayers;
  }

  private onUnjoinSelect = (event_: JoinUnjoinEventData) => {
    if (!this.controller.hass) {
      return;
    }
    const actions = new PlayerActions(this.controller.hass);
    const ent = event_.target.entity;
    void actions.actionUnjoinPlayers(ent);
  };
  private onGroupVolumeChange = (event_: DetailValueEventData) => {
    const vol = event_.detail.value;
    void this.controller.ActivePlayer?.setActiveGroupVolume(vol);
  };

  protected renderGroupedVolume(): TemplateResult {
    const volumeLevel = this.groupVolumeLevel;
    return html`
      <div class="grouped-players-item grouped-volume">
        <div class="player-name-icon">
          <ha-list-item-base
            class="grouped-players-select-item"
            .graphic=${this.Icons.SPEAKER_MULTIPLE}
            noninteractive
            hide-label
          >
            <ha-svg-icon
              class="grouped-players-select-item-icon"
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
              slot="content"
              .value=${volumeLevel}
              @value-changed=${this.onGroupVolumeChange}
            ></ha-control-slider>
          </ha-list-item-base>
        </div>
        <div class="divider"></div>
      </div>
    `;
  }
  private onImgErr = (
    event_: HTMLImageElementEvent,
    entityConfig: EntityConfig,
  ) => {
    const attributes =
      this.playersHass.states[entityConfig.entity_id]?.attributes;
    const locImg = attributes?.entity_picture_local;
    const nonLocImg = attributes?.entity_picture;
    const fallback = getThumbnail(this.uiHass, Thumbnail.HEADPHONES) as string;
    const currentSource = event_.target.src;
    event_.target.src =
      currentSource == locImg ? (nonLocImg ?? fallback) : fallback;
  };

  protected renderGroupedPlayers(): TemplateResult[] {
    const players = this.groupedPlayers;
    const ct = players.length;
    const role = this.useVibrant ? `tonal` : `filled-variant`;
    return this.groupedPlayers.map((item, idx) => {
      const ent = this.playersHass.states[item.entity_id];
      const name = this.controller.hass
        ? computeEntityName(this.controller.hass, ent, item.name)
        : ``;
      const img =
        ent?.attributes.entity_picture_local ?? ent?.attributes.entity_picture;
      return html`
        <div class="grouped-players-item">
          <div class="player-name-icon">
            <ha-list-item-base
              class="grouped-players-select-item"
              .graphic=${this.Icons.SPEAKER}
              noninteractive
              hide-label
            >
              <img
                class="grouped-players-select-item-image"
                slot="start"
                src="${img}"
                loading="lazy"
                @error=${(event: HTMLImageElementEvent) => {
                  this.onImgErr(event, item);
                }}
              />
              <span slot="headline" class="grouped-title"> ${name} </span>
              <span slot="end">
                <mpc-button
                  .onPressService=${this.onUnjoinSelect}
                  role="${role}"
                  size="small"
                  elevation="1"
                  class="grouped-button-unjoin"
                >
                  <ha-svg-icon
                    .path=${this.Icons.LINK_OFF}
                    class="grouped-svg-unjoin"
                    .entity="${item.entity_id}"
                  ></ha-svg-icon>
                </mpc-button>
              </span>
            </ha-list-item-base>
          </div>
          <ha-list-item-base class="grouped-players-volume-item">
            <mpc-volume-slider
              class="grouped-players-volume-slider"
              maxVolume=${item.max_volume}
              .entityId=${item.volume_entity_id}
              slot="content"
            ></mpc-volume-slider>
          </ha-list-item-base>
          ${idx < ct - 1 ? html`<div class="divider"></div>` : ``}
        </div>
      `;
    });
  }

  protected render(): TemplateResult {
    return html`
      <mpc-menu-button
        slot="end"
        id="grouped-players-menu"
        class="menu-header"
        .iconPath=${this.Icons.SPEAKER_MULTIPLE}
        naturalMenuWidth
        fixedMenuPosition
        elevation="-1"
        placement="bottom-end"
      >
        ${this.renderGroupedVolume()} ${this.renderGroupedPlayers()}
      </mpc-menu-button>
    `;
  }

  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0 || !this.hasUpdated;
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}
