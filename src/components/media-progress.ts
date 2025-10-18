import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import styles from '../styles/progress-bar'
import { state } from "lit/decorators.js";
import { consume } from "@lit/context";
import { ActivePlayerController } from "../controller/active-player.js";
import { actionsControllerContext, activeMediaPlayer, activePlayerControllerContext, activePlayerDataContext, controllerContext, ExtendedHassEntity } from "../const/context.js";
import { ActionsController } from "../controller/actions.js";
import { jsonMatch, playerHasUpdated } from "../utils/util.js";
import { PlayerData } from "../const/music-player.js";
import { secondsToTime } from "../utils/util.js";
import { MassCardController } from "../controller/controller.js";
class MassPlayerProgressBar extends LitElement {
  @state() private _media_duration!: number;
  @state() private _media_position!: number;
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
    if (!this._media_position) {
      this.requestProgress();
    }
    return this._media_position;
  }

  private set media_duration(dur: number) {
    this._media_duration = dur;
    if (!this._media_duration) {
      this.requestProgress();
    }
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
    this._listener = undefined;
    this.requestProgress();
  }
  public get activePlayer() {
    return this._activePlayer;
  }

  @consume({ context: activePlayerDataContext, subscribe: true})
  @state()
  public set player_data(player_data: PlayerData) {
    if (!jsonMatch(this._player_data, player_data)) {
      this._player_data = player_data;
    }
    this.requestProgress();
  }
  public get player_data() {
    return this._player_data;
  }
  
  private requestProgress() {
    void this.activePlayerController.getPlayerProgress().then( 
      (progress) => {
        progress = Math.min(progress ?? 1, this.entity_duration ?? progress);
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
  }
  private tickProgress = () => {
    const playing = this.player_data?.playing;
    if (!playing) {
      return;
    }
    const t = new Date().getTime()
    if (
      (!this.media_duration || !this.media_position)
      || (t - this._lastUpdate) >= this._refreshMilliseconds
    ) {
      this._lastUpdate = t;
      this.requestProgress();
      return;
    }
    const pos = (this.media_position ?? 0) + (this._tick_duration_ms / 1000);
    this.media_position = Math.min(pos, (this.media_duration));
  }
  private onSeek = (e: MouseEvent) => {
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
    return html`
      <div
        id="progress-handle"
        style="
          width: ${this._handleBarWidth.toString()}px; 
          position: absolute;
          left: calc(${(this._prog_pct * 100).toString()}% - (${this._handleBarWidth.toString()}px / 2));
        "
      >
    </div>
    `
  }
  protected render(): TemplateResult {
    const cls = !(this.player_data.playing && this.controller.config.expressive) ? `medium progress-plain` : `wavy medium`;
    return html`
      <div class="progress">
        <div id="time" class="${this.controller.config.expressive ? `time-expressive` : ``}">
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

  connectedCallback(): void {
    if (!this._listener) {
      if (this.activePlayerController) {
        this.requestProgress();
      }
      this._listener = setInterval(this.tickProgress, this._tick_duration_ms);
    }
    super.connectedCallback();
  }
  disconnectedCallback(): void {
    if (this._listener) {
      try {
        clearInterval(this._listener);
      } finally {
        this._listener = undefined;
      }
    }
    super.disconnectedCallback();
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-progress-bar', MassPlayerProgressBar);
