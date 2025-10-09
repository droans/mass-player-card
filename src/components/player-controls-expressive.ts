import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";

import styles from '../styles/player-controls-expressive'
import { consume } from "@lit/context";
import {
  actionsControllerContext,
  activePlayerDataContext,
  IconsContext
} from "../const/context.js";
import { ActionsController } from "../controller/actions.js";
import { PlayerData } from "../const/music-player.js";
import { RepeatMode } from "../const/common.js";
import { getIteratedRepeatMode, getRepeatIcon } from "../utils/music-player.js";
import { state } from "lit/decorators.js";
import { Icons } from "../const/icons.js";

class MassPlayerControlsExpressive extends LitElement {
  @consume({ context: actionsControllerContext, subscribe: true })
  private actions!: ActionsController;
  @state()
  private _playerData!: PlayerData;
  @consume({ context: IconsContext}) private Icons!: Icons;

  private playing = false;
  private repeat = RepeatMode.OFF;
  private shuffle = false;
  private favorite = false;

  @consume({ context: activePlayerDataContext, subscribe: true })
  public set playerData(playerData: PlayerData) {
    this._playerData = playerData;
    this.playing = playerData.playing;
    this.repeat = playerData.repeat;
    this.shuffle = playerData.shuffle;
    this.favorite = playerData.favorite;
  }
  public get playerData() {
    return this._playerData;
  }
  
  private onPrevious = async () => {
    await this.actions.actionPlayPrevious();
  }
  private onNext = async () => {
    await this.actions.actionPlayNext();
  }
  private onPlayPause = async () => {
    this.playing = !this.playing;
    this.requestUpdate();
    await this.actions.actionPlayPause();
  }
  private onShuffle = async () => {
    this.shuffle = !this.shuffle;
    this.requestUpdate();
    await this.actions.actionToggleShuffle();
  }
  private onRepeat = async () => {
    const cur_repeat = this.playerData.repeat;
    const repeat = getIteratedRepeatMode(cur_repeat);
    this.repeat = repeat;
    this.requestUpdate();
    await this.actions.actionSetRepeat(repeat);
  }
  private onPower = async () => {
    await this.actions.actionTogglePower();
  }
  private onFavorite = async () => {
    this.favorite = !this.favorite;
    this.requestUpdate();
    if (this.playerData.favorite) {
      await this.actions.actionRemoveFavorite();
    } else {
      await this.actions.actionAddFavorite();
    }
  }

  protected renderPrevious(): TemplateResult {
    return html`
      <button
        class="left-round extra button-next-previous"
        id="button-previous"
        @click=${this.onPrevious}
      >
        <ha-svg-icon
          .path=${this.Icons.SKIP_PREVIOUS}
          class="icons-next-previous"
        >
        </ha-svg-icon>
      </button>
    `
  }
  protected renderPlayPause(): TemplateResult {
    const playing = this.playing;
    return html`
      <button
        class="no-round active extra button-play-pause"
        id="${playing ? `button-play` : `button-pause`}"
        @click=${this.onPlayPause}
      >
        <ha-svg-icon
          .path=${playing ? this.Icons.PAUSE : this.Icons.PLAY}
          class="icon-play-pause"
        >
        </ha-svg-icon>
      </button>
    `
  }
  protected renderNext(): TemplateResult {
    return html`
      <button
        class="right-round extra button-next-previous"
        id="button-previous"
        @click=${this.onNext}
      >
        <ha-svg-icon
          .path=${this.Icons.SKIP_NEXT}
          class="icons-next-previous"
        >
        </ha-svg-icon>
      </button>
    `
  }
  protected renderPower(): TemplateResult {
    return html`
      <button
        class="left-round medium button-lower"
        @click=${this.onPower}
      >
        <ha-svg-icon
          .path=${this.Icons.POWER}
          class="icons-lower"
        >
        </ha-svg-icon>
        <span>Power</span>
      </button>
    `
  }
  protected renderShuffle(): TemplateResult {
    const shuffle = this.shuffle;
    return html`
      <button
        class="no-round medium button-lower${shuffle ? `-active active`: ``}"
        id="button-shuffle"
        @click=${this.onShuffle}
      >
      <ha-svg-icon
        .path=${shuffle ? this.Icons.SHUFFLE : this.Icons.SHUFFLE_DISABLED}
        class="icons-lower"
      ></ha-svg-icon>
      <span>Shuffle</span>
    </button>
    `
  }
  protected renderRepeat(): TemplateResult {
    const repeat = this.repeat;
    const repeat_on = repeat != RepeatMode.OFF;
    const icon = getRepeatIcon(repeat, this.Icons);
    return html`
      <button
        class="no-round medium button-lower${repeat_on ? `-active active` : ``}"
        id="button-shuffle"
        @click=${this.onRepeat}
      >
      <ha-svg-icon
        .path=${icon}
        class="icons-lower"
      ></ha-svg-icon>
      <span>Repeat</span>
    </button>
    `
  }
  protected renderFavorite(): TemplateResult {
    const favorite = this.favorite;
    return html`
      <button
        class="right-round medium button-lower${favorite ? `-active active`: ``}"
        @click=${this.onFavorite}
      >
        <ha-svg-icon
          .path=${favorite ? this.Icons.HEART : this.Icons.HEART_PLUS}
          id="icons-lower"
        >
        </ha-svg-icon>
        <span>Favorite</span>
      </button>
    `
  }
  protected renderUpperControls(): TemplateResult {
    return html`
      <div 
        id="player-controls-upper"
        class="player-controls"
      >
      <nav
        class="group"
        id="nav-upper"
      >
        ${this.renderPrevious()}
        ${this.renderPlayPause()}
        ${this.renderNext()}
      </nav>
    </div>
    `
  }
  protected renderLowerControls(): TemplateResult {
    return html`
      <div
        id="player-controls-lower"
        class="player-controls"
      >
        <nav
          class="group connected"
          id="nav-lower"
        >
          ${this.renderPower()}
          ${this.renderShuffle()}
          ${this.renderRepeat()}
          ${this.renderFavorite()}
        </nav>
      </div>
    `
  }
  protected render(): TemplateResult {
    return html`
      <link href="https://cdn.jsdelivr.net/npm/beercss@3.12.11/dist/cdn/beer.min.css" rel="stylesheet">
      <div
        id="div-controls"
      >
        ${this.renderUpperControls()}
        ${this.renderLowerControls()}
      </div>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-player-controls-expressive', MassPlayerControlsExpressive);
