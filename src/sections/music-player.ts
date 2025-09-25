import "@material/web/progress/linear-progress.js"

import {
  mdiHeart,
  mdiHeartPlusOutline,
  mdiPause,
  mdiPlay,
  mdiPower,
  mdiRepeat,
  mdiRepeatOff,
  mdiRepeatOnce,
  mdiShuffle,
  mdiShuffleDisabled,
  mdiSkipNext,
  mdiSkipPrevious,
  mdiSpeaker,
  mdiVolumeHigh,
  mdiVolumeMute
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
import {
  html,
  literal
} from "lit/static-html.js";

import '../components/menu-button';
import '../components/volume-row';


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
  activePlayerDataContext,
  activePlayerName,
  configContext,
  entitiesConfig,
  EntityConfig,
  hassExt,
  musicPlayerConfigContext,
  volumeMediaPlayer
} from "../const/context";
import {
  MARQUEE_DELAY_MS,
  PlayerData,
  SWIPE_MIN_X,
} from "../const/music-player";

import styles from '../styles/music-player';

import {
  backgroundImageFallback,
  getFallbackImage
} from "../utils/icons";
import {
  secondsToTime,
  testMixedContent
} from "../utils/util";
import { PlayerSelectedService } from "../const/actions";
import { Config } from "../config/config";
import { PlayerConfig } from "../config/player";

class MusicPlayerCard extends LitElement {
  @property({ attribute: false}) private media_duration = 1;
  @property({ attribute: false}) private media_position = 0;
  @state() private shouldMarqueeTitle = false;

  @query('.player-track-title') _track_title!: LitElement;

  @consume({ context: entitiesConfig, subscribe: true })
  public playerEntities!: EntityConfig[];

  @provide({ context: musicPlayerConfigContext})
  private _config!: PlayerConfig;
  @provide({ context: activePlayerDataContext})
  @state()
  private player_data!: PlayerData;

  @consume({ context: activePlayerName, subscribe: true })
  public mediaPlayerName!: string;
  @consume({ context: volumeMediaPlayer, subscribe: true })
  public volumeMediaPlayer!: ExtendedHassEntity;
  @consume({ context: activeEntityConf, subscribe: true })
  public activeEntity!: EntityConfig;
  
  public maxVolume!: number;
  public selectedPlayerService!: PlayerSelectedService;

  private _animationListener  = async () => this.onAnimationEnd();
  private _listener: number|undefined;
  private _hass!: ExtendedHass;
  private _player!: ExtendedHassEntity;
  private actions!: PlayerActions;
  private entity_dur = 1;
  private entity_pos = 0;
  private marquee_x_dist = 0;
  private touchStartX = 0;
  private touchEndX = 0;
  private touchStartY = 0;
  private touchEndY = 0;
  private _cardConfig!: Config;

  @consume({ context: activeMediaPlayer, subscribe: true })
  public set activeMediaPlayer(player: ExtendedHassEntity) {
    this._player = player;
    this.updatePlayerData();
  }
  public get activeMediaPlayer() {
    return this._player;
  }

  @consume({context: hassExt, subscribe: true})
  public set hass(hass: ExtendedHass) {
    if (hass) {
      this.actions = new PlayerActions(hass);
    }
    if (!this._hass) {
      this._hass = hass;
    }
    this.updatePlayerData();
  }
  public get hass() {
    return this._hass;
  }

  @consume({ context: configContext, subscribe: true })
  public set cardConfig(config: Config) {
    this._cardConfig = config;
    this.config = config.player;
  }
  public get cardConfig() {
    return this._cardConfig;
  }
  public set config(config: PlayerConfig) {
    this._config = config;
  }
  public get config() {
    return this._config;
  }

  private updatePlayerData() {
    this._updatePlayerData().catch( () => {return});
  }
  private async _updatePlayerData() {
    if (!this.activeMediaPlayer) {
      return
    }
    let player_name = this.mediaPlayerName;
    if (!player_name.length) {
      player_name = this.activeMediaPlayer.attributes?.friendly_name ?? "Media Player";
    }
    const current_item = (await this.actions.actionGetCurrentItem(this.activeMediaPlayer));

    const new_player_data: PlayerData = {
      playing: this.activeMediaPlayer.state == 'playing',
      repeat: this.activeMediaPlayer.attributes.repeat ?? false,
      shuffle: this.activeMediaPlayer.attributes.shuffle ?? false,
      track_album: this.activeMediaPlayer.attributes.media_album_name,
      track_artist: this.activeMediaPlayer.attributes.media_artist,
      track_artwork: this.activeMediaPlayer.attributes.entity_picture_local ?? this.activeMediaPlayer.attributes.entity_picture,
      track_title: this.activeMediaPlayer.attributes.media_title,
      muted: this.volumeMediaPlayer.attributes.is_volume_muted,
      volume: Math.floor(this.volumeMediaPlayer.attributes.volume_level * 100),
      player_name: player_name,
      favorite: current_item?.favorite ?? false,
    }
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
    await this.actions.actionSetVolume(this.volumeMediaPlayer, volume);
  }
  private async onPlayPause() {
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
    await this.actions.actionMuteToggle(this.volumeMediaPlayer);

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
  private async onShuffleToggle() {
    this.player_data.shuffle = !this.player_data.shuffle;
    await this.actions.actionShuffleToggle(this.activeMediaPlayer);
  }
  private async onRepeatToggle() {
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
    /* eslint-enable
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-assignment,
      @typescript-eslint/no-unsafe-member-access
    */
    this.selectedPlayerService(player);
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
    const element = this.shadowRoot?.getElementById('artwork');
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
  protected renderTitle() {
    if(!this.player_data?.track_title) {
      return html``
    }
    return this.wrapTitleMarquee();
  }
  protected renderArtist() {
    if (!this.player_data?.track_artist) {
      return html``
    }
    return html`<div class="player-track-artist"> ${this.player_data.track_artist} </div>`;
  }
  protected renderPlayerItems() {
    return this.playerEntities.map( 
      (item) =>
      {
        const active = this._player.entity_id == item.entity_id ? literal`selected` : literal``;
        const name = item.name.length > 0 ? item.name : this.hass.states[item.entity_id].attributes.friendly_name;
        return html`
          <ha-list-item
            class="players-select-item"
            .value="${item.entity_id}"
            .graphic=${mdiSpeaker}
            ${active}
          >
            <ha-svg-icon
              class="players-select-item-icon"
              slot="graphic"
              .path=${mdiSpeaker}
            ></ha-svg-icon>
            ${name}
          </ha-list-item>
        `
      }
    )
  }
  protected renderPlayerName(): TemplateResult {
    const config_hide = this.config.hide.player_selector;
    const entity_hide = this.activeEntity.hide.player.player_selector;
    if (config_hide || entity_hide) {
      return html`${this.player_data?.player_name ?? this.mediaPlayerName}`;
    }
    return html`
      <ha-control-select-menu
        id="players-select-menu"
        fixedMenuPosition
        naturalMenuWidth
        @selected=${this.onPlayerSelect}
      >
        <ha-svg-icon
          slot="icon"
          id="players-select-menu-icon"
          .path=${mdiSpeaker}
        ></ha-svg-icon>
        ${this.renderPlayerItems()}
      </ha-control-select-menu>
    `
  }
  protected renderHeader() {
    return html`
      <div class="header">
        <div class="player-name">
          ${this.renderPlayerName()}
        </div>
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
  private artworkStyle() {
    const img = this.player_data?.track_artwork || "";
    if (!this.player_data?.track_artist || !testMixedContent(img)) {
      return getFallbackImage(this.hass, Icon.CLEFT);
    }
      return backgroundImageFallback(this.hass, img, Icon.CLEFT);
  }
  protected renderArtwork() {
    return html`
      <div
        class="artwork"
        id="artwork"
        style="${this.artworkStyle()}"
      >
      </div>
    `
  }
  /* eslint-disable @typescript-eslint/unbound-method */
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
    const entity_hide = this.activeEntity.hide.player.shuffle;
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
    const entity_hide = this.activeEntity.hide.player.repeat;
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
        .maxVolume=${this.maxVolume}
        .onPowerToggleSelect=${this.onToggle}
        .onVolumeMuteToggleSelect=${this.onVolumeMuteToggle}
        .onVolumeChange=${this.onVolumeChange}
        .onFavoriteToggleSelect=${this.onFavorite}
      ></mass-volume-row>
    `
  }
  /* eslint-enable @typescript-eslint/unbound-method */
  protected renderControls() {
    return html`
      <div class="controls">
        ${this.renderControlsLeft()}
        ${this.renderPlayPause()}
        ${this.renderControlsRight()}
      </div>
      ${this.renderVolumeRow()}
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
        ${this.renderProgress()}
        ${this.renderArtwork()}
        ${this.renderControls()}
      </div>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-music-player-card', MusicPlayerCard);