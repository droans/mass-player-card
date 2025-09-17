import "@material/web/progress/linear-progress.js"
import { CSSResultGroup, html, LitElement, PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { HassEntity } from "home-assistant-js-websocket";

import PlayerActions from "../actions/player-actions";
import styles from '../styles/music-player';
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
  mdiVolumeHigh, 
  mdiVolumeMute 
} from "@mdi/js";
import { backgroundImageFallback, getFallbackImage } from "../utils/icons";
import { ExtendedHass, Icon } from '../const/common';
import { 
  DEFAULT_PLAYER_CONFIG, 
  PlayerConfig, 
  PlayerData, 
  SWIPE_MIN_X,
} from "../const/music-player";
import { RepeatMode } from "../const/common";
import { testMixedContent } from "../utils/util";

class MusicPlayerCard extends LitElement {
  @property({ attribute: false }) private player_data!: PlayerData;
  @property({ attribute: false }) private _config!: PlayerConfig;
  @property({ attribute: false}) private media_position = 0;
  @property({ attribute: false}) private media_duration = 1;
  @state() private shouldMarqueeTitle = false;
  @query('.player-track-title') _track_title;
  public volumeMediaPlayer!: HassEntity;
  public mediaPlayerName!: string; 
  private _player!: HassEntity;
  private _listener: number|undefined;
  private _hass!: ExtendedHass;
  private actions!: PlayerActions;
  private entity_pos = 0;
  private entity_dur = 1;
  private marquee_x_dist = 0;
  private touchStartX = 0;
  private touchEndX = 0;
  private touchStartY = 0;
  private touchEndY = 0;
  
  public set config(config: PlayerConfig) {
    this._config = {
      ...DEFAULT_PLAYER_CONFIG,
      ...config
    };
  }
  public set activeMediaPlayer(player: HassEntity) {
    this._player = player;
    this.updatePlayerData();
  }
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
  private updatePlayerData() {
    this._updatePlayerData().catch( () => {return});
  }
  private async _updatePlayerData() {
    if (!this._player) {
      return
    }
    let player_name = this.mediaPlayerName;
    if (!player_name.length) {
      player_name = this._player.attributes?.friendly_name ?? "Media Player";
    }
    const current_item = (await this.actions.actionGetCurrentItem(this._player))!;
    
    const new_player_data: PlayerData = {
      playing: this._player.state == 'playing',
      repeat: this._player.attributes.repeat ?? false,
      shuffle: this._player.attributes.shuffle ?? false,
      track_album: current_item?.media_album_name ?? this._player.attributes.media_album_name,
      track_artist: current_item?.media_artist ?? this._player.attributes.media_artist,
      track_artwork: this._player.attributes.entity_picture_local ?? this._player.attributes.entity_picture ?? current_item?.media_image,
      track_title: current_item?.media_title ?? this._player.attributes.media_title,
      muted: this.volumeMediaPlayer.attributes.is_volume_muted,
      volume: Math.floor(this.volumeMediaPlayer.attributes.volume_level * 100),
      player_name: player_name,
      favorite: current_item?.favorite ?? false,
    }
    this.player_data = new_player_data;
    const old_pos = this.entity_pos;
    const old_dur = this.entity_dur;
    const new_pos = this._player.attributes.media_position;
    const new_dur = this._player.attributes.media_duration;
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
  private async onVolumeChange(ev: CustomEvent) {
    let volume: number = ev.detail.value;
    if (isNaN(volume)) return;
    this.player_data.volume = volume;
    volume = volume / 100;
    await this.actions.actionSetVolume(this.volumeMediaPlayer, volume);
  }
  private async onPlayPause() {
    this.player_data.playing = !this.player_data.playing;
    await this.actions.actionPlayPause(this._player);
  }
  private onNext = async () => {
    await this.actions.actionNext(this._player);
    this.media_position = 0;
    this.entity_dur = 0;
  }
  private onPrevious = async () => {
    await this.actions.actionPrevious(this._player);
    this.media_position = 0;
    this.entity_dur = 0;
  }
  private async onVolumeMuteToggle() {
    this.player_data.muted = !this.player_data.muted;
    await this.actions.actionMuteToggle(this.volumeMediaPlayer);
    
  }
  private onFavorite = async () => {
    if (this.player_data.favorite) {
      await this.actions.actionRemoveFavorite(this._player);
      this.player_data.favorite = false;
    } else {
      await this.actions.actionAddFavorite(this._player);
      this.player_data.favorite = true;
    }
  }
  private async onShuffleToggle() {
    this.player_data.shuffle = !this.player_data.shuffle;
    await this.actions.actionShuffleToggle(this._player);
    
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
    await this.actions.actionRepeatSet(this._player, repeat);
    
  }
  private onToggle = async () => {
    await this.actions.actionTogglePlayer(this._player);
  }
  private toTime(seconds: number) {
    if (isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60
    return `${mins.toString()}:${secs < 10 ? "0" : ""}${secs.toString()}`
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
    await this.actions.actionSeek(this._player, pos);
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
  protected wrapTitleMarquee() {
    const title = `${this.player_data.track_title} - ${this.player_data.track_album}`
    if (!this.shouldMarqueeTitle) {
      return html`<div class="player-track-title">${title}</div>`
    }
    const marqueeTime = `${(1 - (this.marquee_x_dist / 20)).toString()}s`;   
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
  protected renderHeader() {
    return html`
      <div class="header">
        <div class="player-name"> ${this.player_data?.player_name ?? this.mediaPlayerName} </div>
        ${this.renderTitle()}
        ${this.renderArtist()}
      </div>
    `
  }
  protected renderTime() {
    const pos = this.toTime(this.media_position);
    const dur = this.toTime(this.media_duration);
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
  protected renderPlayPause() {
    return html`
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
    `
  }
  protected renderShuffle() {
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
  protected renderRepeat() {
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
  protected renderVolume() {
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        class="button-power"
        @click=${this.onToggle}
      >
        <ha-svg-icon
          .path=${mdiPower}
          style="height: 3rem; width: 3rem;"
        ></ha-svg-icon>
      </ha-button>
      <ha-control-slider
        .disabled=${this.player_data.muted}
        .unit="%"
        .value=${this.player_data.volume}
        @value-changed=${this.onVolumeChange}
      ></ha-control-slider>
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        class="button-mute"
        @click=${this.onVolumeMuteToggle}
      >
        <ha-svg-icon
          .path=${this.player_data.muted ? mdiVolumeMute : mdiVolumeHigh}
          style="height: 3rem; width: 3rem;"
        ></ha-svg-icon>
      </ha-button>
      
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        class="button-favorite"
        @click=${this.onFavorite}
      >
        <ha-svg-icon
          .path=${this.player_data.favorite ? mdiHeart : mdiHeartPlusOutline}
          style="height: 3rem; width: 3rem;"
        ></ha-svg-icon>
      </ha-button>
    `
  }
  /* eslint-enable @typescript-eslint/unbound-method */
  protected renderControls() {
    return html`
      <div class="controls">
        <div class="controls-left">
          <div class="track-previous">${this.renderTrackPrevious()}</div>
          <div class="shuffle">${this.renderShuffle()}</div>
        </div>
        <div class="play-pause">${this.renderPlayPause()}</div>
        <div class="controls-right">
          <div class="track-next"> ${this.renderTrackNext()} </div>
          <div class="repeat">${this.renderRepeat()}</div>
        </div>
      </div>
      <div class="volume">${this.renderVolume()}</div>
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