import "@material/web/progress/linear-progress.js"

import {
  mdiPause,
  mdiPlay,
  mdiRepeat,
  mdiRepeatOff,
  mdiRepeatOnce,
  mdiShuffle,
  mdiShuffleDisabled,
  mdiSkipNext,
  mdiSkipPrevious,
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
  property,
  query,
  state
} from "lit/decorators.js";
import { html } from "lit/static-html.js";

import '../components/menu-button';
import '../components/section-header';
import '../components/volume-row';
import '../components/volume-slider';

import PlayerActions from "../actions/player-actions";

import {
  ExtendedHass,
  ExtendedHassEntity,
  Icon,
  RepeatMode
} from '../const/common';
import {
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
  secondsToTime,
  testMixedContent
} from "../utils/util";
import { PlayerSelectedService } from "../const/actions";
import { Config } from "../config/config";
import { PlayerConfig } from "../config/player";
import { ActivePlayerController } from "../controller/active-player";

class MusicPlayerCard extends LitElement {
  @property({ attribute: false}) private media_duration = 1;
  @property({ attribute: false}) private media_position = 0;
  @state() private shouldMarqueeTitle = false;

  @query('.player-track-title') _track_title!: LitElement;

  @consume({ context: entitiesConfigContext, subscribe: true })
  public playerEntities!: EntityConfig[];

  private _config!: PlayerConfig;
  @provide({ context: activePlayerDataContext})
  @state()
  private player_data!: PlayerData;

  @consume({ context: activePlayerControllerContext, subscribe: true})
  @state()
  private activePlayerController!: ActivePlayerController;
  private _activeEntityConfig!: EntityConfig;
  private _activeEntity!: ExtendedHassEntity;

  public selectedPlayerService!: PlayerSelectedService;
  private _animationListener  = async () => this.onAnimationEnd();
  private _listener: number|undefined;
  private _hass!: ExtendedHass;
  private groupedPlayers!: EntityConfig[];
  private actions!: PlayerActions;
  private entity_dur = 1;
  private entity_pos = 0;
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
    const old_pos = this.entity_pos;
    const old_dur = this.entity_dur;
    const new_pos = this.activeMediaPlayer.attributes.media_position;
    const new_dur = this.activeMediaPlayer.attributes.media_duration;
    if (old_pos !== new_pos || old_dur !== new_dur) {
      this.media_duration = new_dur;
      this.entity_dur = new_dur;
      this.media_position = new_pos;
      this.entity_pos = new_pos;
    }
    if (this._listener) {
      clearInterval(this._listener)
    };
    this._listener = undefined;
    this.tickProgress();
  }
  private onVolumeChange = async (ev: CustomEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    let volume: number = ev.detail.value;
    if (isNaN(volume)) return;
    this.player_data.volume = volume;
    volume = volume / 100;
    await this.actions.actionSetVolume(this.activePlayerController.volumeMediaPlayer, volume);
  }
  private onPlayPause = async () => {
    this.player_data.playing = !this.player_data.playing;
    await this.actions.actionPlayPause(this.activeMediaPlayer);
  }
  private onNext = async () => {
    await this.actions.actionNext(this.activeMediaPlayer);
    this.media_position = 0;
    this.entity_dur = 0;
  }
  private onPrevious = async () => {
    await this.actions.actionPrevious(this.activeMediaPlayer);
    this.media_position = 0;
    this.entity_dur = 0;
  }
  private onVolumeMuteToggle = async () => {
    this.player_data.muted = !this.player_data.muted;
    await this.actions.actionMuteToggle(this.activePlayerController.volumeMediaPlayer);

  }
  private onFavorite = async () => {
    if (this.player_data.favorite) {
      await this.actions.actionRemoveFavorite(this.activeMediaPlayer);
      this.player_data.favorite = false;
    } else {
      await this.actions.actionAddFavorite(this.activeMediaPlayer);
      this.player_data.favorite = true;
    }
  }
  private onShuffleToggle = async () => {
    this.player_data.shuffle = !this.player_data.shuffle;
    await this.actions.actionShuffleToggle(this.activeMediaPlayer);
  }
  private onRepeatToggle = async () => {
    const cur_repeat = this.player_data.repeat;
    let repeat = RepeatMode.ALL;
    if (cur_repeat === RepeatMode.ALL) {
      repeat = RepeatMode.ONCE;
    }
    if (cur_repeat === RepeatMode.ONCE) {
      repeat = RepeatMode.OFF;
    }
    this.player_data.repeat = repeat;
    await this.actions.actionRepeatSet(this.activeMediaPlayer, repeat);
  }
  private onToggle = async () => {
    await this.actions.actionTogglePlayer(this.activeMediaPlayer);
  }
  private tickProgress = () => {
    const playing = this.player_data.playing;
    if (playing) {
      if (this._listener) {
        this.media_position += 1;
      } else {
      this._listener = setInterval(this.tickProgress, 1000);
      }
    } else {
      clearInterval(this._listener);
    }
  }
  private onSeek = async (e: MouseEvent) => {
    const progress_element = this.shadowRoot?.getElementById('progress');
    const prog_width = progress_element?.offsetWidth ?? 1;
    const seek = e.offsetX / prog_width;
    const pos = Math.floor(seek * this.media_duration);
    this.media_position = pos;
    await this.actions.actionSeek(this.activeMediaPlayer, pos);
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
      /* eslint-disable @typescript-eslint/no-floating-promises */
      if (x_swipe > 0) {
        this.onPrevious();
      } else {
        this.onNext();
      }
      /* eslint-enable @typescript-eslint/no-floating-promises */
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
  protected updated() {
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
      <mass-section-header>
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
  protected renderTime() {
    const pos = secondsToTime(this.media_position);
    const dur = secondsToTime(this.media_duration);
    return `${pos} - ${dur}`
  }
  protected renderProgress() {
    return html`
      <div class="progress">
        <div class="time">
          ${this.renderTime()}
        </div>
        <md-linear-progress
          id="progress"
          value="${this.media_position / this.media_duration}"
          @click=${this.onSeek}
        >
        </md-linear-progress>
      </div>
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
            src="${img}" 
            onerror="this.src='${fallback}';"
          >
        </div>
      `
    }
  }
  protected renderTrackPrevious() {
    return html`
      <ha-button
        class="controls-previous-next"
        appearance="outlined"
        variant="brand"
        @click=${this.onPrevious}
        size="small"
        style="display: block;"
      >
        <ha-svg-icon
          .path=${mdiSkipPrevious}
        ></ha-svg-icon>
      </ha-button>
    `
  }
  protected renderShuffle() {
    const config_hide = this.config.hide.shuffle;
    const entity_hide = this.activeEntityConfig.hide.player.shuffle;
    if (config_hide || entity_hide) {
      return html``
    }
    return html`
      <ha-button
        appearance="${this.player_data.shuffle ? "accent" : "plain"}"
        variant="brand"
        @click=${this.onShuffleToggle}
        size="small"
      >
        <ha-svg-icon
          slot="start"
          .path=${this.player_data.shuffle ? mdiShuffle : mdiShuffleDisabled}
        ></ha-svg-icon>
        Shuffle
      </ha-button>
    `
  }
  protected renderControlsLeft() {
    return html`
      <div class="controls-left">
        <div class="track-previous">${this.renderTrackPrevious()}</div>
        <div class="shuffle">${this.renderShuffle()}</div>
      </div>
    `
  }
  protected renderPlayPause() {
    return html`
      <div class="play-pause">
        <ha-button
          appearance="${this.player_data.playing ? "filled" : "outlined"}"
          variant="brand"
          size="medium"
          class="button-play-pause"
          @click=${this.onPlayPause}
        >
          <ha-svg-icon
            .path=${this.player_data.playing ?  mdiPause : mdiPlay}
            style="height: 4rem; width: 4rem;"
          ></ha-svg-icon>
        </ha-button>
      </div>
    `
  }
  protected renderTrackNext() {
    return html`
      <ha-button
        class="controls-previous-next"
        appearance="outlined"
        variant="brand"
        @click=${this.onNext}
        size="small"
        style="display: block;"
      >
        <ha-svg-icon
          .path=${mdiSkipNext}
        ></ha-svg-icon>
      </ha-button>
    `
  }
  protected renderRepeat() {
    const config_hide = this.config.hide.repeat;
    const entity_hide = this.activeEntityConfig.hide.player.repeat;
    if (config_hide || entity_hide) {
      return html``
    }
    let icon = mdiRepeat;
    const repeat = this.player_data.repeat;
    if (repeat == RepeatMode.ONCE) {
      icon = mdiRepeatOnce;
    }
    if (repeat == RepeatMode.OFF) {
      icon = mdiRepeatOff;
    }
    return html`
      <ha-button
        appearance="${this.player_data.repeat == RepeatMode.OFF ? "plain" : "accent"}"
        variant="brand"
        size="small"
        @click=${this.onRepeatToggle}
      >
        <ha-svg-icon
          slot="start"
          .path=${icon}
        ></ha-svg-icon>
        Repeat
      </ha-button>
    `
  }
  protected renderControlsRight() {
    return html`
      <div class="controls-right">
        <div class="track-next"> ${this.renderTrackNext()} </div>
        <div class="repeat">${this.renderRepeat()}</div>
      </div>
    `
  }
  protected renderVolumeRow() {
    return html`
      <mass-volume-row
        .maxVolume=${this.activePlayerController.activeEntityConfig.max_volume}
        .onPowerToggleSelect=${this.onToggle}
        .onVolumeMuteToggleSelect=${this.onVolumeMuteToggle}
        .onVolumeChange=${this.onVolumeChange}
        .onFavoriteToggleSelect=${this.onFavorite}
      ></mass-volume-row>
    `
  }
  protected renderControls() {
    return html`
      <div class="media-controls">
        <div class="controls">
          ${this.renderControlsLeft()}
          ${this.renderPlayPause()}
          ${this.renderControlsRight()}
        </div>
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
      <div class="container">
        ${this.renderHeader()}
        <div id="player-card">
          ${this.renderActiveItemSection()}
          ${this.renderArtwork()}
          ${this.renderControls()}
        </div>
        <div class="volume">
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