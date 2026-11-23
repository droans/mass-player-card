import { consume } from "@lit/context";
import { HassEntity } from "home-assistant-js-websocket";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { DirectiveResult } from "lit/directive.js";
import { Config } from "../../config/config";
import { PlayerJoinService, PlayerUnjoinService } from "../../const/actions";
import {
  activeEntityConfigContext,
  activeMediaPlayerContext,
  activePlayerControllerContext,
  activePlayerDataContext,
  activePlayerNameContext,
  canGroupWithContext,
  configContext,
  EntityConfig,
  groupedPlayersContext,
  hassContext,
  IconsContext,
  volumeMediaPlayerContext,
} from "../../const/context";
import { PlayerSupportedFeatures, Thumbnail } from "../../const/enums";
import {
  HaCheckboxDropdownEventData,
  HTMLImageElementEvent,
} from "../../const/events";
import { Icons } from "../../const/icons";
import {
  ExtendedHass,
  ExtendedHassEntity,
  PlayerData,
} from "../../const/types";
import { ActivePlayerController } from "../../controller/active-player";
import { computeEntityName } from "../../utils/entity-name";
import { getThumbnail } from "../../utils/thumbnails";
import { getTranslation } from "../../utils/translations";
import {
  isActive,
  playerIsAvailable,
  playerSupportsFeature,
} from "../../utils/utility";
import styles from "./active-player-row-styles";

@customElement("mpc-active-player-row")
export class ActivePlayerRow extends LitElement {
  @consume({ context: activePlayerNameContext, subscribe: true })
  @state()
  private playerName?: string;
  @consume({ context: activeMediaPlayerContext, subscribe: true })
  @state()
  private playerEntity?: ExtendedHassEntity;
  @consume({ context: volumeMediaPlayerContext, subscribe: true })
  @state()
  private volumeEntity?: ExtendedHassEntity;
  @consume({ context: groupedPlayersContext, subscribe: true })
  @state()
  private groupedPlayers?: string[];
  @consume({ context: canGroupWithContext, subscribe: true })
  @state()
  private canGroupWith?: string[];
  @consume({ context: activePlayerDataContext, subscribe: true })
  @state()
  private playerData?: PlayerData;
  @consume({ context: activeEntityConfigContext, subscribe: true })
  private playerConfig?: EntityConfig;
  @consume({ context: configContext, subscribe: true })
  private config?: Config;
  @consume({ context: IconsContext, subscribe: true })
  private Icons!: Icons;
  @property({ attribute: false }) joinService!: PlayerJoinService;
  @property({ attribute: false }) unJoinService!: PlayerUnjoinService;

  private _activePlayerController?: ActivePlayerController;
  private _hass?: ExtendedHass;

  @consume({ context: hassContext, subscribe: true })
  public set hass(hass: ExtendedHass | undefined) {
    if (!hass) {
      return;
    }
    this._hass = hass;
  }
  public get hass() {
    return this._hass;
  }

  @consume({ context: activePlayerControllerContext, subscribe: true })
  public set activePlayerController(
    controller: ActivePlayerController | undefined,
  ) {
    if (!controller) {
      return;
    }
    this._activePlayerController = controller;
  }
  public get activePlayerController() {
    return this._activePlayerController;
  }
  protected onSelect = async (event_: HaCheckboxDropdownEventData) => {
    event_.stopPropagation();
    const target = event_.detail;
    const player = target.item.value;
    const checked = target.item.checked;
    if (player.length === 0) {
      return;
    }
    const service = checked ? this.joinService : this.unJoinService;
    await service([player]);
  };

  protected renderVolumeRow(): TemplateResult {
    if (!this.playerEntity) {
      return html``;
    }
    const canMute = playerSupportsFeature(
      this.playerEntity.attributes.supported_features,
      PlayerSupportedFeatures.VOLUME_MUTE,
    );
    return html`
      <mpc-volume-row class="volume" ?can-mute=${canMute}></mpc-volume-row>
    `;
  }

  protected renderGroupItem(entityId: string): TemplateResult {
    if (!this.config) {
      return html``;
    }
    const entity = this.hass?.entities[entityId];
    const configEntity = this.config.entities.find((entityConfig) => {
      return entityConfig.entity_id == entityId;
    });
    const entityName = computeEntityName(
      this.hass,
      entity as HassEntity | undefined,
      configEntity?.name,
    );
    const grouped = this.groupedPlayers?.includes(entityId);
    const disabled = !playerIsAvailable(this.hass, entityId);
    return html`
      <ha-dropdown-item
        class="group-dropdown-item"
        value=${entityId}
        ?checked=${grouped}
        ?disabled=${disabled}
        type="checkbox"
      >
        ${entityName}
      </ha-dropdown-item>
    `;
  }
  protected renderGroupItems(): DirectiveResult {
    if (!this.canGroupWith) {
      return html``;
    }
    return this.canGroupWith.map((option) => {
      return this.renderGroupItem(option);
    });
  }
  protected renderGroupTriggerButton(): TemplateResult {
    const label = getTranslation("players.label.group", this.hass);
    return html`
      <mpc-button
        slot="trigger"
        id="trigger-button"
        .onPressService=${() => {
          return;
        }}
        role="filled"
      >
        <ha-svg-icon
          slot="start"
          class="trigger-icon link"
          .path=${this.Icons.JOIN}
        ></ha-svg-icon>
        <div class="group-label">${label}</div>
        <ha-svg-icon
          slot="end"
          class="trigger-icon caret"
          .path=${this.Icons.CARET_DOWN}
        ></ha-svg-icon>
      </mpc-button>
    `;
  }

  protected renderGroupMenu(): TemplateResult {
    if (!this.canGroupWith?.length) {
      return html``;
    }
    return html`
      <ha-dropdown id="group-dropdown" @wa-select=${this.onSelect}>
        ${this.renderGroupTriggerButton()} ${this.renderGroupItems()}
      </ha-dropdown>
    `;
  }

  protected renderPlayerControls(): TemplateResult {
    return html`
      <div class="player-controls">
        <div class="player-volume">${this.renderVolumeRow()}</div>
        <div class="player-group">${this.renderGroupMenu()}</div>
      </div>
    `;
  }

  private _renderThumbnailFallback = (event_: Event) => {
    // eslint-disable-next-line unicorn/prevent-abbreviations
    const ev = event_ as HTMLImageElementEvent;
    const attributes = this.playerEntity?.attributes;
    const fallback = getThumbnail(this.hass, Thumbnail.HEADPHONES);
    const loc = attributes?.entity_picture_local;
    const pic = attributes?.entity_picture ?? fallback;
    const source = ev.target.src;
    const newSource = source == loc ? pic : fallback;
    if (ev.target.src == newSource) {
      ev.target.removeEventListener("error", this._renderThumbnailFallback);
    }
    ev.target.src = newSource ?? "";
  };
  protected renderThumbnail(): TemplateResult {
    const attributes = this.playerEntity?.attributes;
    const fallback = getThumbnail(this.hass, Thumbnail.HEADPHONES);
    const loc = attributes?.entity_picture_local;
    const pic = attributes?.entity_picture;
    const source = loc ?? pic ?? fallback;

    return html`
      <img
        class="thumbnail"
        slot="start"
        src="${source}"
        loading="lazy"
        @error=${this._renderThumbnailFallback}
      />
    `;
  }
  protected renderPlayerStatus(): TemplateResult {
    const activeTrack = this.playerData?.track_title;
    const playerIsActive =
      this.playerConfig &&
      isActive(this.hass, this.playerEntity, this.playerConfig);
    const playLabel = playerIsActive
      ? this.playerData?.playing
        ? `Playing •`
        : `Paused •`
      : `Idle`;
    return html` <div class="player-track-status">
      ${playLabel}
      <div class="track">${activeTrack}</div>
    </div>`;
  }
  protected renderPlayerInfo(): TemplateResult {
    const controlLabel = getTranslation("players.label.controlling", this.hass);
    return html`
      <div class="controlling">${controlLabel}</div>
      <div class="player-name-bars">
        <div class="player-name">${this.playerName}</div>
        <div class="audio-bars-div">${this.renderAudioBars()}</div>
      </div>
      ${this.renderPlayerStatus()}
    `;
  }
  protected renderAudioBars(): TemplateResult {
    if (!this.playerConfig) {
      return html``;
    }
    const activeStyle =
      isActive(this.hass, this.playerEntity, this.playerConfig) &&
      this.playerEntity?.state == "playing"
        ? `audio-bars`
        : `audio-bars-inactive`;
    return html`
      <div class="${activeStyle}">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    `;
  }

  protected renderPlayerOverview(): TemplateResult {
    return html`
      <div class="player-overview">
        <div class="player-image">${this.renderThumbnail()}</div>
        <div class="player-info">${this.renderPlayerInfo()}</div>
      </div>
    `;
  }
  protected render(): TemplateResult {
    return html`
      <div id="container">
        ${this.renderPlayerOverview()} ${this.renderPlayerControls()}
      </div>
    `;
  }
  static get styles() {
    return styles;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
}
