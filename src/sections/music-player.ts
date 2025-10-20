import "@material/web/progress/linear-progress.js"

import { consume, provide } from "@lit/context";
import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult
} from "lit";
import {
  query,
  state
} from "lit/decorators.js";
import { html } from "lit/static-html.js";

import '../components/media-progress';
import '../components/menu-button';
import '../components/player-artwork';
import '../components/player-controls';
import '../components/player-controls-expressive';
import '../components/section-header';
import '../components/volume-row';
import '../components/volume-slider';

import PlayerActions from "../actions/player-actions";

import {
  DetailValEventData,
  ExtendedHass,
  ExtendedHassEntity,
  WaAnimation,
} from '../const/common';
import {
  activeEntityConf,
  activeMediaPlayer,
  activePlayerControllerContext,
  activePlayerDataContext,
  configContext,
  entitiesConfigContext,
  EntityConfig,
  groupedPlayersContext,
  groupVolumeContext,
  hassExt,
  IconsContext,
  musicPlayerConfigContext,
} from "../const/context";
import {
  ListItemData
} from "../const/media-browser";
import {
  INACTIVE_MESSAGES,
  MARQUEE_DELAY_MS,
  PlayerData,
} from "../const/music-player";

import styles from '../styles/music-player';

import { PlayerSelectedService } from "../const/actions";
import { ArtworkSize, PlayerConfig } from "../config/player";
import { ActivePlayerController } from "../controller/active-player";
import { Config } from "../config/config.js";
import { Icons } from "../const/icons.js";
import {
  isActive,
  jsonMatch,
  playerHasUpdated
} from "../utils/util.js";

class MusicPlayerCard extends LitElement {
  @state() private shouldMarqueeTitle = false;

  @query('.player-track-title') _track_title!: LitElement;
  @query('#animation') _animation!: WaAnimation;
  private _firstLoaded = false;

  @consume({ context: IconsContext}) private Icons!: Icons;

  @consume({ context: entitiesConfigContext, subscribe: true })
  public playerEntities!: EntityConfig[];
  
  @consume({ context: configContext, subscribe: true})
  private cardConfig!: Config;

  @provide({ context: activePlayerDataContext})
  @state()
  private player_data!: PlayerData;

  
  @state()
  private _groupVolumeLevel!: number;

  private _activeEntityConfig!: EntityConfig;
  private _activeEntity!: ExtendedHassEntity;
  private _config!: PlayerConfig;

  public selectedPlayerService!: PlayerSelectedService;
  private _animationListener  = async () => this.onAnimationEnd();
  private _hass!: ExtendedHass;
  private _groupedPlayers!: EntityConfig[];
  private actions!: PlayerActions;
  private marquee_x_dist = 0;

  private _artworkHeaderClass!: string;
  private _artworkProgressClass!: string;
  private _artworkVolumeClass!: string;
  private _artworkMediaControlsClass!: string;
  private _artworkActiveTrackClass!: string;
  @state()
  private _activePlayerController!: ActivePlayerController;
  
  @consume({ context: activeEntityConf, subscribe: true})
  public set activeEntityConfig(entity: EntityConfig) {
    this._activeEntityConfig = entity;
  }
  public get activeEntityConfig() {
    return this._activeEntityConfig;
  }
  public get activeMediaPlayer() {
    return this?.activePlayerController?.activeMediaPlayer;
  }

  @consume({ context: activeMediaPlayer, subscribe: true})
  @state()
  private set activeEntity(entity: ExtendedHassEntity) {
    if (!playerHasUpdated(this._activeEntity, entity)) {
      return;
    }
    this._activeEntity = entity;
    this.updatePlayerData();
  }
  public get activeEntity() {
    return this._activeEntity;
  }

  @consume({context: hassExt, subscribe: true})
  public set hass(hass: ExtendedHass) {
    if (hass) {
      this.actions = new PlayerActions(hass);
    }
    const hassExists = !!this._hass;
    this._hass = hass;
    if (!hassExists) {
      this.updatePlayerData();
    }
  }
  public get hass() {
    return this._hass;
  }

  @consume({ context: musicPlayerConfigContext, subscribe: true})
  public set config(config: PlayerConfig) {
    if (jsonMatch(this._config, config)) {
      return;
    }
    this._config = config;
    switch (config.layout.artwork_size) {
      case ArtworkSize.LARGE:
        this._artworkHeaderClass = 'header-art-lg';
        this._artworkProgressClass = 'bg-art-lg';
        this._artworkVolumeClass = 'vol-art-lg';
        this._artworkMediaControlsClass = 'controls-art-lg';
        this._artworkActiveTrackClass = 'active-track-lg';
        break;
      case ArtworkSize.MEDIUM:
        this._artworkHeaderClass = 'header-art-med';
        this._artworkProgressClass = 'bg-art-med';
        this._artworkVolumeClass = 'vol-art-med';
        this._artworkMediaControlsClass = 'controls-art-med';
        this._artworkActiveTrackClass = 'active-track-med';
        break;
      case ArtworkSize.SMALL: 
        this._artworkHeaderClass = 'header-art-sm';
        this._artworkProgressClass = 'bg-art-sm';
        this._artworkVolumeClass = 'vol-art-sm';
        this._artworkMediaControlsClass = 'controls-art-sm';
        this._artworkActiveTrackClass = 'active-track-sm';
    }
  }
  public get config() {
    return this._config;
  }
  
  private async _getGroupedVolume() {
    if (this.activePlayerController) {
      this.groupVolumeLevel = await this.activePlayerController.getActiveGroupVolume();
    }
  }
  @consume({ context: activePlayerControllerContext, subscribe: true})
  private set activePlayerController(controller: ActivePlayerController) {
    if (!controller) {
      return;
    }
    this._activePlayerController = controller;
    if (!this.player_data) {
      this.updatePlayerData();
    }
    if (!this.groupVolumeLevel) {
      void this._getGroupedVolume();
    }
  }
  private get activePlayerController() {
    return this._activePlayerController;
  }
  @consume({ context: groupVolumeContext, subscribe: true})
  public set groupVolumeLevel(volume_level: number) {
    if (volume_level != this._groupVolumeLevel) {
      this._groupVolumeLevel = volume_level;
    }
  }
  public get groupVolumeLevel() {
    return this._groupVolumeLevel;
  }
  
  @consume({ context: groupedPlayersContext, subscribe: true})
  private set groupedPlayersList(players: string[]) {
    const card_players = this.playerEntities.filter(entity => players?.includes(entity.entity_id));
    if (jsonMatch(this._groupedPlayers, card_players)) {
      return;
    }
    this._groupedPlayers = card_players;
  }

  private get groupedPlayers() {
    return this._groupedPlayers;
  }

  private updatePlayerData() {
    if (!this.hass) {
      return;
    }
    this._updatePlayerData().catch( () => {return});
  }
  private async _updatePlayerData() {
    if (!this.activeMediaPlayer) {
      return
    }
    let player_name = this.activeEntityConfig.name;
    if (!player_name.length) {
      player_name = this.activeMediaPlayer.attributes?.friendly_name ?? "Media Player";
    }
    const current_item = (await this.actions.actionGetCurrentItem(this.activeMediaPlayer));
    const new_player_data = this.activePlayerController.getactivePlayerData(current_item);
    if (jsonMatch(this.player_data, new_player_data)) {
      return;
    }
    this.player_data = new_player_data;
  }
  private onPlayerSelect = (ev: CustomEvent) => {
    ev.stopPropagation();
    /* eslint-disable
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-assignment,
      @typescript-eslint/no-unsafe-member-access
    */
    const target = ev.target as any;
    const player = target.value as string;
    if (!player.length) {
      return;
    }
    /* eslint-enable
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-assignment,
      @typescript-eslint/no-unsafe-member-access
    */
    this.selectedPlayerService(player);
    //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    target.value = "";
  }
  private onUnjoinSelect = (ev) => {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const ent = ev?.target?.entity;
    if (ev) {
      //eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-unsafe-argument
      this.actions.actionUnjoinPlayers(ent)
    }
  }
  private onGroupVolumeChange = (ev: DetailValEventData) => {
    const volume_level = ev.detail.value;
    void this.activePlayerController.setActiveGroupVolume(volume_level);
  }

  private marqueeTitleWhenUpdated() {
    const title = this._track_title;
    const offset = title?.offsetWidth ?? 0;
    const scroll = title?.scrollWidth ?? 0;
    if (offset < scroll) {
      this.shouldMarqueeTitle = true;
      this.marquee_x_dist = offset - scroll;
    } else {
      if (this.shouldMarqueeTitle) {
        this.shouldMarqueeTitle = false;
      }
    }
  }
  private onAnimationEnd = async () => {
    if (this._track_title.className !== 'player-track-title marquee') {
      return;
    }
    const delay = (delayMs: number) => {
      return new Promise(resolve => setTimeout(resolve, delayMs))
    };
    this._track_title.className = 'player-track-title marquee-pause-end';
    await delay(MARQUEE_DELAY_MS);
    this._track_title.className = 'player-track-title marquee';
    await delay(MARQUEE_DELAY_MS);
  }
  protected wrapTitleMarquee() {
    const title = `${this.player_data.track_title} - ${this.player_data.track_album}`
    if (!this.shouldMarqueeTitle) {
      /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
      this.removeEventListener('animationiteration', this._animationListener);
      return html`<div class="player-track-title">${title}</div>`
    }
    const marqueeTime = `${(1 - (this.marquee_x_dist / 40)).toString()}s`;
    /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
    this._track_title.addEventListener('animationiteration', this._animationListener);
    return html`
      <div
        class="player-track-title marquee"
        style="
          --marquee-left-offset: ${this.marquee_x_dist}px;
          --marquee-time: ${marqueeTime};"
      >
      ${title}
      </div>
    `
  }
  protected renderPlayerName() {
    return html`
      <div class="player-name ${this.cardConfig.expressive ? `player-name-expressive` : ``}">
        ${this.player_data?.player_name ?? this.activePlayerController.activePlayerName}
      </div>
      `;
  }
  protected renderTitle() {
    if(!isActive(this.hass, this.activeMediaPlayer)) {
      return html`
        <div class="player-track-title">
          Nothing is currently active!
        </div>
      `
    }
    return this.wrapTitleMarquee();
  }
  protected renderGroupedVolume() {
    const vol_level = this._groupVolumeLevel;
    return html`
      <div 
        class="grouped-players-item grouped-volume"
      >
        <div class="player-name-icon">
          <ha-md-list-item
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
              .min=0
              .max=100
              .value=${vol_level}
              @value-changed=${this.onGroupVolumeChange}
            ></ha-control-slider>
          </ha-md-list-item>
        </div>
        <div class="divider"></div>
      </div>
    `
  }
  protected renderGroupedPlayers() {
    const players = this.groupedPlayers;
    const ct = players.length;
    const expressive = this.cardConfig.expressive;
    return this.groupedPlayers.map(
      (item, idx) => {
        const name = item.name.length > 0 ? item.name : this.hass.states[item.entity_id].attributes.friendly_name;
        return html`
          <div 
            class="grouped-players-item"
          >
            <div class="player-name-icon">
              <ha-md-list-item
                class="grouped-players-select-item"
                .graphic=${this.Icons.SPEAKER}
                noninteractive
                hide-label
              >
                <ha-svg-icon
                  class="grouped-players-select-item-icon"
                  slot="start"
                  .path=${this.Icons.SPEAKER}
                ></ha-svg-icon>
                <span
                  slot="headline"
                  class="grouped-title"
                >
                  ${name}
                </span>
                <span
                  slot="end"
                >
                  <ha-button
                    appearance="plain"
                    variant="brand"
                    size="medium"
                    class="grouped-button-unjoin ${expressive ? `grouped-button-unjoin-expressive` : ``}"
                    @click=${this.onUnjoinSelect}
                  >
                    <ha-svg-icon
                      .path=${this.Icons.LINK_OFF}
                      class="grouped-svg-unjoin ${expressive ? `grouped-svg-unjoin-expressive` : ``}"
                      .entity="${item.entity_id}"
                    ></ha-svg-icon>
                  </ha-button>
                </span>
              </ha-md-list-item>
            </div>
            <ha-md-list-item>
              <mass-volume-slider
                class="grouped-players-volume-slider"
                maxVolume=${item.max_volume}
                .entityId=${item.volume_entity_id}
              ></mass-volume-slider>
            </ha-md-list-item>
            ${idx < ct - 1 ? html`<div class="divider"></div>` : ``}
          </div>
        `
      }
    )
  }
  protected renderGrouped() {
    const hide = this.config.hide.group_volume || this.activeEntityConfig.hide.player.group_volume;
    if (this?.groupedPlayers?.length > 1 && !hide) {
      return html`
        <mass-menu-button
          slot="end"
          id="grouped-players-menu"
          class="menu-header ${this.cardConfig.expressive ? `menu-header-expressive` : ``}"
          .iconPath=${this.Icons.SPEAKER_MULTIPLE}
          naturalMenuWidth
        >
        ${this.renderGroupedVolume()}
        ${this.renderGroupedPlayers()}
        </mass-menu-button>
      `
    }
    return html``;
  }
  protected renderArtist() {
    if (!isActive(this.hass, this.activeMediaPlayer)) {
      const msgs = INACTIVE_MESSAGES;
      const i = Math.floor(Math.random() * msgs.length);
      return html`
      <div class="player-track-artist ${this.cardConfig.expressive ? `player-track-artist-expressive` : ``}">
          ${msgs[i]}
      </div>;
      ` 
    }
    return html`
      <div class="player-track-artist ${this.cardConfig.expressive ? `player-track-artist-expressive` : ``}">
        ${this.player_data.track_artist} 
      </div>`;
  }
  protected renderPlayerItems() {
    return this.playerEntities.map( 
      (item) => {
        const name = item.name.length > 0 ? item.name : this.hass.states[item.entity_id].attributes.friendly_name;
        const r: ListItemData = {
          option: item.entity_id,
          icon: this.Icons.SPEAKER,
          title: name ?? item.name
        };
        return r;
      }
    )
  }
  protected renderSectionTitle() {
    return html`
      <span slot="label">Music Player</span>
    `
  }
  protected renderHeader(): TemplateResult {
    const expressive = this.cardConfig.expressive;
    return html`
      <div 
        id="player-card-header"
        class="player-card-header${expressive ? `-expressive` : ``}"
      >
        <mass-section-header
          class="${this._artworkHeaderClass} ${this.cardConfig.expressive ? `header-expressive` : ``}"
        >
            ${this.renderPlayerSelector()}
            ${this.renderSectionTitle()}
            ${this.renderGrouped()}
        </mass-section-header>
        ${this.renderActiveItemSection()}
      </div>
    `
  }
  protected renderPlayerSelector(): TemplateResult {
    const config_hide = this.config.hide.player_selector;
    const entity_hide = this.activeEntityConfig.hide.player.player_selector;
    if (config_hide || entity_hide) {
      return html``;
    }
    return html`
      <span slot="start">
        <mass-menu-button
          id="players-select-menu"
          class="menu-header ${this.cardConfig.expressive ? `menu-header-expressive` : ``}"
          .iconPath=${this.Icons.SPEAKER}
          .onSelectAction=${this.onPlayerSelect}
          .initialSelection=${this.activeEntity.entity_id}
          .items=${this.renderPlayerItems()}
        ></mass-menu-button>
      </span>
    `
  }
  protected renderActiveItemSection() {
    return html`
      <div id="${this._artworkActiveTrackClass}">
        <div
          id="active-track-text"
          class="${this.cardConfig.expressive ? `active-track-text-expressive` : ``} ${this.config.layout.artwork_size != ArtworkSize.LARGE ? `active-track-text-rounded` : ``}"
        >
          ${this.renderPlayerHeader()}
          ${this.renderProgress()}
        </div>
      </div>
    `
  }
  protected renderPlayerHeader() {
    return html`
      <div class="player-header">
        ${this.renderPlayerName()}
        ${this.renderTitle()}
        ${this.renderArtist()}
      </div>
    `
  }
  protected renderProgress() {
    return html`
      <mass-progress-bar
        class="${this._artworkProgressClass}"
        style="${isActive(this.hass, this.activeMediaPlayer) ? `` : `opacity: 0;`}"
      ></mass-progress-bar>
    `
  }
  protected renderArtwork() {
    return html`
      <mass-artwork></mass-artwork>
    `
  }
  protected renderVolumeRow() {
    return html`
      <div id="volume">
        <mass-volume-row
        class="${this._artworkVolumeClass} ${this.cardConfig.expressive ? `volume-expressive` : ``}"
        ></mass-volume-row>
      </div>
    `
  }
  protected renderControls() {
    
    return html`
      <div class="media-controls ${this._artworkMediaControlsClass} ${this.cardConfig.expressive ? `media-controls-expressive` : ``}">
        ${this?.cardConfig?.expressive ?
          html`<mass-player-controls-expressive></mass-player-controls-expressive>`
        : html`<mass-player-controls></mass-player-controls>`
        }
            ${this.renderVolumeRow()}
      </div>
    `
  }
  protected render() {
    const expressive = this.cardConfig.expressive;
    return html`
      <div
        id="container"
        class="${expressive ? `container-expressive` : ``}"
      >
        ${this.renderHeader()}
        <wa-animation 
          id="animation"
          name="fadeIn"
          easing="ease-in"
          iterations=1
          play=${this.checkVisibility()}
          playback-rate=4
        >
          <div 
            id="player-card"
            class="${expressive ? `player-card-expressive` : ``}"
          >
            ${this.renderArtwork()}
            ${this.renderControls()}
          </div>
        </wa-animation>
      </div>
    `
  }
  connectedCallback(): void {
    super.connectedCallback();
    if (this._animation && this._firstLoaded) {
      this._animation.play = true;
    }
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
  }
  protected updated() {
    this.marqueeTitleWhenUpdated();
  }
  protected firstUpdated(): void {
      this._firstLoaded = true;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (!this.player_data || !_changedProperties.size) {
      return false
    }
    return super.shouldUpdate(_changedProperties);
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-music-player-card', MusicPlayerCard);
