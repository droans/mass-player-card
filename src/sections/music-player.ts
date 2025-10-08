import "@material/web/progress/linear-progress.js"

import {
  mdiSpeaker,
  mdiSpeakerMultiple,
} from "@mdi/js";
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
import '../components/player-controls';
import '../components/player-controls-expressive';
import '../components/section-header';
import '../components/volume-row';
import '../components/volume-slider';

import PlayerActions from "../actions/player-actions";

import {
  ExtendedHass,
  ExtendedHassEntity,
  Icon,
} from '../const/common';
import {
  actionsControllerContext,
  activeEntityConf,
  activeMediaPlayer,
  activePlayerControllerContext,
  activePlayerDataContext,
  configContext,
  entitiesConfigContext,
  EntityConfig,
  hassExt,
  musicPlayerConfigContext,
} from "../const/context";
import {
  ListItemData
} from "../const/media-browser";
import {
  MARQUEE_DELAY_MS,
  PlayerData,
  SWIPE_MIN_X,
} from "../const/music-player";

import styles from '../styles/music-player';

import {
  getIcon,
} from "../utils/icons";
import {
  testMixedContent
} from "../utils/util";
import { PlayerSelectedService } from "../const/actions";
import { PlayerConfig } from "../config/player";
import { ActivePlayerController } from "../controller/active-player";
import { ActionsController } from "../controller/actions";
import { Config } from "../config/config.js";

class MusicPlayerCard extends LitElement {
  @state() private shouldMarqueeTitle = false;

  @query('.player-track-title') _track_title!: LitElement;

  @consume({ context: entitiesConfigContext, subscribe: true })
  public playerEntities!: EntityConfig[];
  
  @consume({ context: configContext, subscribe: true})
  private cardConfig!: Config;

  private _config!: PlayerConfig;
  @provide({ context: activePlayerDataContext})
  @state()
  private player_data!: PlayerData;

  @consume({ context: activePlayerControllerContext, subscribe: true})
  @state()
  private activePlayerController!: ActivePlayerController;
  
  @consume({ context: actionsControllerContext, subscribe: true})
  private actionsController!: ActionsController;

  private _activeEntityConfig!: EntityConfig;
  private _activeEntity!: ExtendedHassEntity;

  public selectedPlayerService!: PlayerSelectedService;
  private _animationListener  = async () => this.onAnimationEnd();
  private _hass!: ExtendedHass;
  private groupedPlayers!: EntityConfig[];
  private actions!: PlayerActions;
  private marquee_x_dist = 0;
  private touchStartX = 0;
  private touchEndX = 0;
  private touchStartY = 0;
  private touchEndY = 0;
  
  @consume({ context: activeEntityConf, subscribe: true})
  public set activeEntityConfig(entity: EntityConfig) {
    this._activeEntityConfig = entity;
  }
  public get activeEntityConfig() {
    return this._activeEntityConfig;
  }
  public get activeMediaPlayer() {
    return this.activePlayerController.activeMediaPlayer;
  }

  @consume({ context: activeMediaPlayer, subscribe: true})
  @state()
  private set activeEntity(entity: ExtendedHassEntity) {
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
    this._config = config;
  }
  public get config() {
    return this._config;
  }

  private updatePlayerData() {
    if (!this.hass) {
      return;
    }
    this.groupedPlayers = this.activePlayerController.getGroupedPlayers();
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
    this.player_data = new_player_data;
  }
  private onSwipeStart = (e: TouchEvent) => {
    const touches = e.changedTouches[0];
    this.touchStartX = touches.screenX;
    this.touchStartY = touches.screenY;
  }
  private onSwipeEnd = (e: TouchEvent) => {
    const touches = e.changedTouches[0];
    this.touchEndX = touches.screenX;
    this.touchEndY = touches.screenY;
    const x_swipe = this.touchEndX - this.touchStartX;
    const y_swipe = this.touchEndY - this.touchStartY;
    if (Math.abs(x_swipe) > Math.abs(y_swipe)) {
      if (Math.abs(x_swipe) < SWIPE_MIN_X) {
        return;
      }
      if (x_swipe > 0) {
        void this.actionsController.actionPlayPrevious();
      } else {
        void this.actionsController.actionPlayNext();
      }
    }
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
    const element = this.shadowRoot?.getElementById('artwork-div');
    element?.addEventListener('touchstart', this.onSwipeStart);
    element?.addEventListener('touchend', this.onSwipeEnd);
  }

  protected updated() {
    this.marqueeTitleWhenUpdated();
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
      <div class="player-name">
        ${this.player_data?.player_name ?? this.activePlayerController.activePlayerName}
      </div>
      `;
  }
  protected renderTitle() {
    if(!this.player_data?.track_title) {
      return html``
    }
    return this.wrapTitleMarquee();
  }
  protected renderGroupedPlayers() {
    return this.groupedPlayers.map(
      (item) => {
        const name = item.name.length > 0 ? item.name : this.hass.states[item.entity_id].attributes.friendly_name;
        return html`
          <div 
            class="grouped-players-item"
          >
            <div class="player-name-icon">
              <ha-list-item
                class="grouped-players-select-item"
                .graphic=${mdiSpeaker}
                noninteractive
                hide-label
              >
                <ha-svg-icon
                  class="grouped-players-select-item-icon"
                  slot="graphic"
                  .path=${mdiSpeaker}
                ></ha-svg-icon>
                ${name}
              </ha-list-item>
            </div>
            <mass-volume-slider
              class="grouped-players-volume-slider"
              maxVolume=${item.max_volume}
              .entityId=${item.volume_entity_id}
            ></mass-volume-slider>
            <div class="divider"></div>
          </div>
        `
      }
    )
  }
  protected renderGrouped() {
    const hide = this.config.hide.group_volume || this.activeEntityConfig.hide.player.group_volume;
    if (this.groupedPlayers.length > 1 && !hide) {
      return html`
        <mass-menu-button
          slot="end"
          id="grouped-players-menu"
          .iconPath=${mdiSpeakerMultiple}
        >
        ${this.renderGroupedPlayers()}
        </mass-menu-button>
      `
    }
    return html``;
  }
  protected renderArtist() {
    if (!this.player_data?.track_artist) {
      return html``
    }
    return html`<div class="player-track-artist"> ${this.player_data.track_artist} </div>`;
  }
  protected renderPlayerItems() {
    return this.playerEntities.map( 
      (item) => {
        const name = item.name.length > 0 ? item.name : this.hass.states[item.entity_id].attributes.friendly_name;
        const r: ListItemData = {
          option: item.entity_id,
          icon: mdiSpeaker,
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
    return html`
      <mass-section-header
        class="${this.config.layout.large_artwork ? `header-art-lg` : ``}"
      >
          ${this.renderPlayerSelector()}
          ${this.renderSectionTitle()}
          ${this.renderGrouped()}
      </mass-section-header>
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
          .iconPath=${mdiSpeaker}
          .onSelectAction=${this.onPlayerSelect}
          .items=${this.renderPlayerItems()}
        ></mass-menu-button>
      </span>
    `
  }
  protected renderActiveItemSection() {
    return html`
      <div id="active-track">
        <div id="active-track-text">
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
        class="${this.config.layout.large_artwork ? `bg-art-lg` : ``}"
      ></mass-progress-bar>
    `
  }
  protected renderArtwork() {
    const img = this.player_data?.track_artwork || "";
    const fallback = getIcon(this.hass, Icon.CLEFT);
    if (!this.player_data.track_artist || !testMixedContent(img)) {
      return html`
        <div id="artwork-div">
          <img 
            id="artwork-img"
            src="${fallback}">
        </div>
      `
    } else {
      return html`
        <div id="artwork-div">
          <img 
            id="artwork-img"
            class="${this.config.layout.large_artwork ? `artwork-large` : ``}"
            src="${img}" 
            onerror="this.src='${fallback}';"
          >
        </div>
      `
    }
  }
  protected renderVolumeRow() {
    return html`
      <div id="volume">
        <mass-volume-row
        class="${this.config.layout.large_artwork ? `vol-art-lg` : ``}"
        ></mass-volume-row>
      </div>
    `
  }
  protected renderControls() {
    
    return html`
      <div class="media-controls">
        ${this?.cardConfig?.expressive ?
          html`<mass-player-controls-expressive></mass-player-controls-expressive>`
        : html`<mass-player-controls></mass-player-controls>`
        }
      </div>
    `
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (!this.player_data) {
      return false
    }
    return super.shouldUpdate(_changedProperties);
  }
  protected render() {
    return html`
      <div id="container">
        ${this.renderHeader()}
        <div id="player-card">
          ${this.renderActiveItemSection()}
          ${this.renderArtwork()}
          ${this.renderControls()}
          ${this.renderVolumeRow()}
        </div>
      </div>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-music-player-card', MusicPlayerCard);
