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
  private _player!: HassEntity;

  private _hass!: HomeAssistant;
  private actions!: PlayerActions;
  
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
    var new_player_data: PlayerData = {
      playing: this._player.state == 'playing',
      repeat: this._player.attributes.repeat,
      shuffle: this._player.attributes.shuffle,
      track_album: this._player.attributes.media_album_name,
      track_artist: this._player.attributes.media_artist,
      track_artwork: this._player.attributes.entity_picture_local,
      track_title: this._player.attributes.media_title,
      muted: this._player.attributes.is_volume_muted,
      volume: Math.floor(this._player.attributes.volume_level * 100),
      player_name: this._player.attributes.friendly_name ? this._player.attributes.friendly_name : ''
    }
    if (this.player_data !== new_player_data) {
      this.player_data = new_player_data;
    }
  }
  private async onVolumeChange(ev: CustomEvent) {
    var volume = (ev.detail as any).value;
    if (isNaN(volume)) return;
    this.player_data.volume = volume;
    volume = volume / 100;
    await this.actions.actionSetVolume(this._player, volume);
  }
  private async onPlayPause() {
    await this.actions.actionPlayPause(this._player);
  }
  private async onNext() {
    await this.actions.actionNext(this._player);

  }
  private async onPrevious() {
    await this.actions.actionPrevious(this._player);
    
  }
  private async onVolumeMuteToggle() {
    await this.actions.actionMuteToggle(this._player);
    
  }
  private async onShuffleToggle() {
    await this.actions.actionShuffleToggle(this._player);
    
  }
  private async onRepeatToggle() {
    var cur_repeat = this.player_data.repeat;
    var repeat = RepeatMode.ALL;
    if (cur_repeat === RepeatMode.ALL) {
      repeat = RepeatMode.ONCE;
    }
    if (cur_repeat === RepeatMode.ONCE) {
      repeat = RepeatMode.OFF;
    }
    await this.actions.actionRepeatSet(this._player, repeat);
    
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
  private artworkStyle() {
    return `background-image: url(${this.player_data.track_artwork}); height: 300px`
  }
  protected renderArtwork() {
    return html`
      <div class="artwork" style="${this.artworkStyle()}"></div>
    `
  }
  protected renderTrackPrevious() {
    return html`
      <ha-icon-button
        .path=${mdiSkipPrevious}
        @click=${this.onPrevious}
      ></ha-icon-button>
    `
  }
  protected renderTrackNext() {
    return html`
      <ha-icon-button
        .path=${mdiSkipNext}
        @click=${this.onNext}
      ></ha-icon-button>
    `
  }
  protected renderPlayPause() {
    return html`
      <ha-icon-button
        .path=${this.player_data.playing ?  mdiPause : mdiPlay }
        @click=${this.onPlayPause}
      ></ha-icon-button>
    `
  }
  protected renderShuffle() {
    return html`
      <ha-icon-button
        .path=${this.player_data.shuffle ? mdiShuffle : mdiShuffleDisabled}
        @click=${this.onShuffleToggle}
      ></ha-icon-button>
    `
  }
  protected renderRepeat() {
    var icon = mdiRepeat;
    var repeat = this.player_data.repeat;
    if (repeat == 'one') {
      icon = mdiRepeatOnce;
    }
    if (repeat == 'off') {
      icon = mdiRepeatOff;
    }
    return html`
      <ha-icon-button
        .path=${icon}
        @click=${this.onRepeatToggle}
      ></ha-icon-button>
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
  protected renderControls() {
    return html`
    <div class="controls">
      <div class="primary-controls">
        <div class="track-previous">${this.renderTrackPrevious()}</div>
        <div class="play-pause">${this.renderPlayPause()}</div>
        <div class="track-next"> ${this.renderTrackNext()} </div>
      </div>
      <div class="secondary-controls">
        <div class="shuffle">${this.renderShuffle()}</div>
        <div class="repeat">${this.renderRepeat()}</div>
      </div>
      <div class="volume">${this.renderVolume()}</div>
    </div>
    `
  }
  protected render() {
    return html`
      <div class="container">
        ${this.renderHeader()}
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