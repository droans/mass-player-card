import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import styles from '../styles/progress-bar'
import { state } from "lit/decorators.js";
import { consume } from "@lit/context";
import { ActivePlayerController } from "../controller/active-player.js";
import { actionsControllerContext, activeMediaPlayer, activePlayerControllerContext, activePlayerDataContext, controllerContext, ExtendedHassEntity } from "../const/context.js";
import { ActionsController } from "../controller/actions.js";
import { playerHasUpdated } from "../utils/util.js";
import { PlayerData } from "../const/music-player.js";
import { secondsToTime } from "../utils/util.js";
import { MassCardController } from "../controller/controller.js";
class MassPlayerProgressBar extends LitElement {
  @state() private _media_duration = 1;
  @state() private _media_position = 0;
  private entity_duration = 1;
  private entity_position = 0;
  private _prog_pct = 0;
  private _lastUpdate = 0;
  private _listener: number|undefined;
  private _handleBarWidth = 8;
  private _refreshMilliseconds = 5000;
  private _tick_duration_ms = 250;
  
  @consume({ context: activePlayerControllerContext, subscribe: true})
  private activePlayerController!: ActivePlayerController
  @consume({ context: actionsControllerContext, subscribe: true})
  private actions!: ActionsController;
  @consume({ context: controllerContext, subscribe: true})
  private controller!: MassCardController;

  private _player_data!: PlayerData;

  private _activePlayer!: ExtendedHassEntity;

  private set media_position(pos: number) {
    this._media_position = pos;
    const prog = Math.min(1, pos / (this._media_duration ?? 1));
    this._prog_pct = prog;
  }
  private get media_position() {
    return this._media_position;
  }

  private set media_duration(dur: number) {
    this._media_duration = dur;
    const prog = Math.min(1, this._media_position / (dur ?? 1));
    this._prog_pct = prog;
  }
  private get media_duration() {
    return this._media_duration;
  }

  @consume({ context: activeMediaPlayer, subscribe: true})
  public set activePlayer(player: ExtendedHassEntity) {
    if (this._activePlayer) {
      if (!playerHasUpdated(this._activePlayer, player)) {
        return;
      }
    }
    this._activePlayer = player;
    const cur_dur = player.attributes.media_duration;
    const cur_pos = player.attributes.media_position;
    this.entity_duration = cur_dur;
    this.media_duration = cur_dur;
    this.entity_position = cur_pos;
    this.media_position = cur_pos;
    if (this._listener) {
      clearInterval(this._listener);
    }
    this._listener = undefined;
    this.requestProgress();
  }
  public get activePlayer() {
    return this._activePlayer;
  }

  @consume({ context: activePlayerDataContext, subscribe: true})
  public set player_data(player_data: PlayerData) {
    this._player_data = player_data;
    this.requestProgress();
  }
  public get player_data() {
    return this._player_data;
  }
  
  private requestProgress() {
    if (this._listener) {
      clearInterval(this._listener)
      this._listener = undefined;
    }
    void this.activePlayerController.getPlayerProgress().then( 
      (progress) => {
        progress = Math.min(progress, this.entity_duration ?? progress);
        this.media_position = progress ?? this.media_position;
        this.entity_position = progress ?? this.entity_position;
      }
    )
    void this.activePlayerController.getPlayerActiveItemDuration().then( 
      (duration) => {
        this.media_duration = duration ?? this.media_duration;
        this.entity_duration = duration ?? this.entity_duration;
      }
    )
    this._listener = setInterval(this.tickProgress, this._tick_duration_ms);    
  }
  private tickProgress = () => {
    if (this._listener) {
      clearInterval(this._listener);
    }
    const playing = this.player_data?.playing;
    if (!playing) {
      return;
    }
    this._listener = setInterval(this.tickProgress, this._tick_duration_ms);    
    const t = new Date().getTime()
    if ((t - this._lastUpdate) >= this._refreshMilliseconds) {
      this._lastUpdate = t;
      this.requestProgress();
      return;
    }
    const pos = (this.media_position ?? 0) + (this._tick_duration_ms / 1000);
    this.media_position = Math.min(pos, (this.media_duration));
  }
  private onSeek = async (e: MouseEvent) => {
    const progress_element = this.shadowRoot?.getElementById('progress-div');
    const prog_width = progress_element?.offsetWidth ?? 1;
    const seek = e.offsetX / prog_width;
    const pos = Math.floor(seek * this.media_duration);
    this.media_position = pos;
    this.entity_position = pos;
    void this.actions.actionSeek(pos);
  }
  protected renderTime() {
    const pos = secondsToTime(this.media_position);
    const dur = secondsToTime(this.media_duration);
    return `${pos} - ${dur}`;
  }
  protected renderVolumeBarHandle(): TemplateResult {
    const progress_element = this.shadowRoot?.getElementById('progress-div');
    const prog_width = progress_element?.offsetWidth ?? 1;
    const pos = Math.floor(prog_width * this._prog_pct) - (this._handleBarWidth / 2);
    return html`
      <div
        id="progress-handle"
        style="
          width: ${this._handleBarWidth.toString()}px; 
          position: absolute;
          left: ${pos}px;
        "
      >
    </div>
    `
  }
  protected render(): TemplateResult {
    const cls = !(this.player_data.playing && this.controller.config.expressive) ? `medium progress-plain` : `wavy medium`;
    return html`
      <div class="progress">
        <div id="time">
            ${this.renderTime()}
        </div>
        <div id="progress-div">
          <link href="https://cdn.jsdelivr.net/npm/beercss@3.12.11/dist/cdn/beer.min.css" rel="stylesheet">
          <div
            class="prog-incomplete" 
            style="--incomplete-progress-start-pct: ${Math.round(this._prog_pct * 100)}%;"
          ></div>
          <progress 
            class="${cls}"
            id="progress-bar"
            value="${this._prog_pct}"
            max="1"
            @click=${this.onSeek}
          ></progress>
          ${this.renderVolumeBarHandle()}
        </div>
      </div>
    `
  }

  disconnectedCallback(): void {
    if (this._listener) {
      clearInterval(this._listener)
    }
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-progress-bar', MassPlayerProgressBar);
