import "@material/mwc-linear-progress/mwc-linear-progress";
import { CSSResultGroup, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { HassEntity } from "home-assistant-js-websocket";
import { HomeAssistant } from "custom-card-helpers";

import PlayerActions from "../actions/player-actions";
import styles from '../styles/music-player';
import { PlayerConfig, PlayerData } from "../types";
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
  mdiVolumeHigh, 
  mdiVolumeMute 
} from "@mdi/js";
import { RepeatMode } from "../const";

class MusicPlayerCard extends LitElement {
  @property({ attribute: false }) private player_data!: PlayerData;
  @property({ attribute: false }) private _config!: PlayerConfig;
  @property({ attribute: false}) private media_position = 0;
  @property({ attribute: false}) private media_duration = 1;
  private _player!: HassEntity;
  private _listener: number|undefined;
  private _hass!: HomeAssistant;
  private actions!: PlayerActions;
  private entity_pos = 0;
  private entity_dur = 1;
  
  public set config(config: PlayerConfig) {
    this._config = config;
  }
  public set activeMediaPlayer(player: HassEntity) {
    this._player = player;
    this.updatePlayerData();
  }
  public set hass(hass: HomeAssistant) {
    if (hass) {
      this.actions = new PlayerActions(hass);
    }
    if (!this._hass) {
      this._hass = hass;
    }
    this.updatePlayerData();
  }
  private updatePlayerData() {
    if (!this._player) {
      return
    }
    const new_player_data: PlayerData = {
      playing: this._player.state == 'playing',
      repeat: this._player.attributes.repeat,
      shuffle: this._player.attributes.shuffle,
      track_album: this._player.attributes.media_album_name,
      track_artist: this._player.attributes.media_artist,
      track_artwork: this._player.attributes.entity_picture_local,
      track_title: this._player.attributes.media_title,
      muted: this._player.attributes.is_volume_muted,
      volume: Math.floor(this._player.attributes.volume_level * 100),
      player_name: this._player.attributes.friendly_name ??  ''
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
    await this.actions.actionSetVolume(this._player, volume);
  }
  private async onPlayPause() {
    this.player_data.playing = !this.player_data.playing;
    await this.actions.actionPlayPause(this._player);
  }
  private async onNext() {
    await this.actions.actionNext(this._player);
    this.media_position = 0;
    this.entity_dur = 0;
  }
  private async onPrevious() {
    await this.actions.actionPrevious(this._player);
    this.media_position = 0;
    this.entity_dur = 0;
  }
  private async onVolumeMuteToggle() {
    this.player_data.muted = !this.player_data.muted;
    await this.actions.actionMuteToggle(this._player);
    
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
  private toTime(seconds: number) {
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
  
  protected renderHeader() {
    return html`
      <div class="header">
        <div class="player-name"> ${this.player_data.player_name} </div>
        <div class="player-track-title"> ${this.player_data.track_title} - ${this.player_data.track_album} </div>
        <div class="player-track-artist"> ${this.player_data.track_artist} </div>
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
        <mwc-linear-progress
          id="progress"
          .progress=${this.media_position / this.media_duration}
          @click=${this.onSeek}
        >
        </mwc-linear-progress>
      </div>
    `
  }
  private artworkStyle() {
    return `background-image: url(${this.player_data.track_artwork}); height: 300px`
  }
  protected renderArtwork() {
    return html`
      <div class="artwork" style="${this.artworkStyle()}"></div>
    `
  }
  /* eslint-disable @typescript-eslint/unbound-method */
  protected renderTrackPrevious() {
    return html`
      <ha-button
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
      <ha-control-slider
        .disabled=${this.player_data.muted}
        .unit="%"
        .value=${this.player_data.volume}
        @value-changed=${this.onVolumeChange}
      ></ha-control-slider>
      <ha-icon-button
        .path=${this.player_data.muted ? mdiVolumeMute : mdiVolumeHigh}
        @click=${this.onVolumeMuteToggle}
      ></ha-icon-button>
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