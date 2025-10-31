import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import styles from '../styles/progress-bar'
import { query, state } from "lit/decorators.js";
import { consume } from "@lit/context";
import { ActivePlayerController } from "../controller/active-player.js";
import { actionsControllerContext, activeMediaPlayer, activePlayerControllerContext, activePlayerDataContext, controllerContext, ExtendedHassEntity } from "../const/context.js";
import { ActionsController } from "../controller/actions.js";
import { playerHasUpdated } from "../utils/util.js";
import { PlayerData } from "../const/music-player.js";
import { secondsToTime } from "../utils/util.js";
import { MassCardController } from "../controller/controller.js";
class MassPlayerProgressBar extends LitElement {
  @state() private _media_duration!: number;
  @state() private _media_position!: number;
  @query('#progress-bar') private progressBar!: HTMLElement;
  private entity_duration = 1;
  private entity_position = 0;
  private _prog_pct = 0;
  private _lastUpdate = 0;
  private _tickListener: number|undefined;
  private _handleBarWidth = 8;
  private _refreshMilliseconds = 5000;
  private _tick_duration_ms = 250;
  private _dragging = false;
  private _requestProgress = true;
  private _updateTimeout!: number | undefined;
  private _currentSetPosition = 0;
  private _newSetPosition = 0;

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
    this.entity_duration ??= cur_dur;
    this.media_duration ??= cur_dur;
    this.entity_position ??= cur_pos;
    this.media_position ??= cur_pos;
    this.requestProgress();
  }
  public get activePlayer() {
    return this._activePlayer;
  }

  @consume({ context: activePlayerDataContext, subscribe: true})
  @state()
  public set player_data(player_data: PlayerData) {
    this._player_data = player_data;
    this.requestProgress();
  }
  public get player_data() {
    return this._player_data;
  }
  
  private requestProgress() {
    void this.activePlayerController.getPlayerProgress().then( 
      (progress) => {
        progress = Math.min(progress ?? 1, this.entity_duration ?? progress);
        this.entity_position = progress ?? this.entity_position;
        this._newSetPosition = progress ?? this.entity_position;
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
    if (!playing || this._dragging) {
      return;
    }
    const t = new Date().getTime()
    if (
      this._requestProgress 
      && (
        (!this.media_duration || !this.media_position)
        || (t - this._lastUpdate) >= this._refreshMilliseconds
      )
    ) {
      this._lastUpdate = t;
      this.requestProgress();
      return;
    }
    let pos = (this.media_position ?? 0) + (this._tick_duration_ms / 1000);
    if (this._currentSetPosition != this._newSetPosition) {
      this._currentSetPosition = this._newSetPosition;
      pos = this._currentSetPosition;
    }
    this.media_position = Math.min(pos, (this.media_duration));
  }
  protected pointerMoveListener = (e: PointerEvent | MouseEvent) => {
    const bar = this.progressBar;
    const offset = (bar?.offsetParent as HTMLElement)?.offsetLeft ?? 36
    const prog_width = bar.offsetWidth;
    const seek = (e.offsetX - offset) / prog_width;
    let pos = Math.floor(seek * this.media_duration);
    pos = Math.min(this.media_duration, pos);
    pos = Math.max(0, pos);
    this.media_position = pos;
    this._newSetPosition = pos;
    this.entity_position = pos;
  }
  protected onPointerDown = () => {
    this._dragging = true;
    this._requestProgress = false;
    window.addEventListener('pointerup', this.onPointerUp);
    this.addEventListener('pointermove', this.pointerMoveListener);
  }
  protected onPointerUp = () => {
    try {
      void this.actions.actionSeek(this._newSetPosition);
    } finally {
      window.removeEventListener('pointerup', this.onPointerUp);
      this.removeEventListener('pointermove', this.pointerMoveListener);
      
    }
    this._newSetPosition = this.media_position;
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout)
    }
    this._dragging = false;
    this._updateTimeout = setTimeout(
      () => {
        this._requestProgress = true;
        this.requestProgress();
      },
      5000
    );
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
        <div 
          id="progress-div"
          @pointerdown=${this.onPointerDown}
        >
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
          ></progress>
          ${this.renderVolumeBarHandle()}
        </div>
      </div>
    `
  }

  connectedCallback(): void {
    if (!this._tickListener) {
      if (this.activePlayerController) {
        this.requestProgress();
      }
      this._tickListener = setInterval(this.tickProgress, this._tick_duration_ms);
    }
    super.connectedCallback();
  }
  disconnectedCallback(): void {
    if (this._tickListener) {
      try {
        clearInterval(this._tickListener);
      } finally {
        this._tickListener = undefined;
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
