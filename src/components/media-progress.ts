import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import styles from "../styles/media-progress";
import { query, state } from "lit/decorators.js";
import { consume } from "@lit/context";
import { ActivePlayerController } from "../controller/active-player";
import {
  actionsControllerContext,
  activeMediaPlayerContext,
  activePlayerControllerContext,
  activePlayerDataContext,
  controllerContext,
} from "../const/context";
import { ActionsController } from "../controller/actions";
import { playerHasUpdated, secondsToTime } from "../utils/util";
import { ExtendedHassEntity, PlayerData } from "../const/types";
import { MassCardController } from "../controller/controller";
class MassPlayerProgressBar extends LitElement {
  @state() private _media_duration!: number;
  @state() private _media_position!: number;
  @query("#progress-bar") private progressBar?: HTMLElement;
  private entity_duration = 1;
  private entity_position = 0;
  private _prog_pct = 0;
  private _lastUpdate = 0;
  private _tickListener: number | undefined;
  private _handleBarWidth = 8;
  private _refreshMilliseconds = 5000;
  private _tick_duration_ms = 250;
  private _dragging = false;
  private _requestProgress = true;
  private _updateTimeout!: number | undefined;
  private _currentSetPosition = 0;
  private _newSetPosition = 0;

  @consume({ context: activePlayerControllerContext, subscribe: true })
  private activePlayerController?: ActivePlayerController;
  @consume({ context: actionsControllerContext, subscribe: true })
  private actions?: ActionsController;
  @consume({ context: controllerContext, subscribe: true })
  private controller?: MassCardController;

  @state() public _player_data?: PlayerData;

  private _activePlayer?: ExtendedHassEntity;

  private set media_position(pos: number | undefined) {
    pos ??= 0;
    this._media_position = pos;
    const prog = Math.min(1, pos / this._media_duration);
    this._prog_pct = prog;
  }
  private get media_position() {
    if (!this._media_position) {
      this.requestProgress();
    }
    return this._media_position;
  }

  private set media_duration(dur: number | undefined) {
    dur ??= 1;
    this._media_duration = dur;
    if (!this._media_duration) {
      this.requestProgress();
    }
    const prog = Math.min(1, this._media_position / dur);
    this._prog_pct = prog;
  }
  private get media_duration() {
    return this._media_duration;
  }

  @consume({ context: activeMediaPlayerContext, subscribe: true })
  public set activePlayer(player: ExtendedHassEntity | undefined) {
    if (this._activePlayer) {
      if (!playerHasUpdated(this._activePlayer, player)) {
        return;
      }
    }
    if (!player) {
      return;
    }
    const cur_dur = player.attributes.media_duration ?? 1;
    const cur_pos =
      !this._activePlayer?.attributes.media_title ||
      player.attributes.media_title == this._activePlayer.attributes.media_title
        ? player.attributes.media_position
        : 1;
    this._activePlayer = player;
    this.media_duration ??= cur_dur;
    this.media_position ??= cur_pos;
    this.requestProgress();
  }
  public get activePlayer() {
    return this._activePlayer;
  }

  @consume({ context: activePlayerDataContext, subscribe: true })
  public set player_data(player_data: PlayerData | undefined) {
    if (!player_data) {
      return;
    }
    this._player_data = player_data;
    this.requestProgress();
  }
  public get player_data() {
    return this._player_data;
  }

  private requestProgress() {
    if (!this.activePlayerController) {
      return;
    }
    void this.activePlayerController.getPlayerProgress().then((progress) => {
      const prog = progress as number | undefined;
      progress = Math.min(prog ?? 1, this.entity_duration);
      this.entity_position = prog ?? this.entity_position;
      this._newSetPosition = prog ?? this.entity_position;
    });
    void this.activePlayerController
      .getPlayerActiveItemDuration()
      .then((duration) => {
        this.media_duration = duration;
        this.entity_duration = duration;
      });
    if (this.activePlayer?.state == "playing") {
      this.startProgressTick();
    } else {
      this.stopProgressTick();
    }
  }
  private tickProgress = () => {
    const playing = this.player_data?.playing;
    if (!playing || this._dragging) {
      return;
    }
    const t = new Date().getTime();
    if (
      this._requestProgress &&
      (!this.media_duration ||
        t - this._lastUpdate >= this._refreshMilliseconds)
    ) {
      this._lastUpdate = t;
      this.requestProgress();
      return;
    }
    let pos = (this.media_position ?? 0) + this._tick_duration_ms / 1000;
    if (this._currentSetPosition != this._newSetPosition) {
      this._currentSetPosition = this._newSetPosition;
      pos = this._currentSetPosition;
    }
    this.media_position = Math.min(pos, this.media_duration ?? 1);
  };

  private startProgressTick() {
    this.stopProgressTick();
    this._tickListener = setInterval(this.tickProgress, this._tick_duration_ms);
  }
  private stopProgressTick() {
    if (this._tickListener) {
      try {
        clearInterval(this._tickListener);
      } catch {
        // Assume interval already cleared
      }
    }
    this._tickListener = undefined;
  }
  private onSeek = async (e: MouseEvent) => {
    if (!this.actions) {
      return;
    }
    const prog_width = this.progressBar?.offsetWidth ?? 1;
    const seek = e.offsetX / prog_width;
    const pos = Math.floor(seek * (this.media_duration ?? 1));
    await this.actions.actionSeek(pos);
    this._dragging = false;
    this._requestProgress = true;
    window.removeEventListener("pointerup", this.onPointerUp);
    this.removeEventListener("pointermove", this.pointerMoveListener);
  };
  protected pointerMoveListener = (e: PointerEvent | MouseEvent) => {
    const bar = this.progressBar;
    const offset = bar?.offsetLeft ?? 36;
    const prog_width = bar?.offsetWidth ?? 1;
    const seek = (e.offsetX - offset) / prog_width;
    let pos = Math.floor(seek * (this.media_duration ?? 1));
    pos = Math.min(this.media_duration ?? 1, pos);
    pos = Math.max(0, pos);
    this.media_position = pos;
    this._newSetPosition = pos;
    this.entity_position = pos;
  };
  protected onPointerDown = () => {
    this._dragging = true;
    this._requestProgress = false;
    window.addEventListener("pointerup", this.onPointerUp);
    // eslint-disable-next-line listeners/no-missing-remove-event-listener
    this.addEventListener("pointermove", this.pointerMoveListener);
  };
  protected onPointerUp = () => {
    if (!this.actions) {
      return;
    }
    try {
      void this.actions.actionSeek(this._newSetPosition);
    } finally {
      window.removeEventListener("pointerup", this.onPointerUp);
      this.removeEventListener("pointermove", this.pointerMoveListener);
    }
    this._newSetPosition = this.media_position ?? 0;
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
    }
    this._dragging = false;
    this._updateTimeout = setTimeout(() => {
      this._requestProgress = true;
      this.requestProgress();
    }, 5000);
  };
  protected renderTime() {
    const pos = secondsToTime(this.media_position ?? 0);
    const dur = secondsToTime(this.media_duration ?? 1);
    return `${pos} - ${dur}`;
  }
  protected renderVolumeBarHandle(): TemplateResult {
    return html`
      <div
        id="progress-handle"
        style="
          width: ${this._handleBarWidth.toString()}px; 
          position: absolute;
          left: calc(${(
          this._prog_pct * 100
        ).toString()}% - (${this._handleBarWidth.toString()}px / 2));
        "
      ></div>
    `;
  }
  protected render(): TemplateResult {
    const cls = !(
      this.player_data?.playing && this.controller?.config?.expressive
    )
      ? `medium progress-plain`
      : `wavy medium`;
    return html`
      <div class="progress">
        <div
          id="time"
          class="${this.controller?.config?.expressive
            ? `time-expressive`
            : ``}"
        >
          ${this.renderTime()}
        </div>
        <div
          id="progress-div"
          @pointerdown=${this.onPointerDown}
          @click=${this.onSeek}
        >
          <link
            href="https://cdn.jsdelivr.net/npm/beercss@3.12.11/dist/cdn/beer.min.css"
            rel="stylesheet"
          />
          <div
            class="prog-incomplete"
            style="--incomplete-progress-start-pct: ${Math.round(
              this._prog_pct * 100,
            )}%;"
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
    `;
  }

  connectedCallback(): void {
    this._tickListener ??= setInterval(
      this.tickProgress,
      this._tick_duration_ms,
    );
    if (this.activePlayerController && this.hasUpdated) {
      this.requestProgress();
    }
    super.connectedCallback();
  }
  disconnectedCallback(): void {
    this.removeEventListener("pointermove", this.pointerMoveListener);
    window.removeEventListener("pointerup", this.onPointerUp);
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
    const bar_playing = this.progressBar?.classList.contains("wavy");
    const playing_changed = bar_playing != this.player_data?.playing;
    return _changedProperties.size > 0 || playing_changed;
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define("mass-progress-bar", MassPlayerProgressBar);
