import { consume } from "@lit/context";
import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, query, state } from "lit/decorators.js";
import {
  actionsControllerContext,
  activeMediaPlayerContext,
  activePlayerControllerContext,
  activePlayerDataContext,
  controllerContext,
  hassContext,
} from "../../const/context";
import {
  ExtendedHass,
  ExtendedHassEntity,
  PlayerData,
} from "../../const/types";
import { ActionsController } from "../../controller/actions";
import { ActivePlayerController } from "../../controller/active-player";
import { MassCardController } from "../../controller/controller";
import {
  playerHasUpdated,
  playerIsAvailable,
  secondsToTime,
} from "../../utils/utility";
import styles from "./media-progress-styles";

@customElement("mpc-progress-bar")
export class MassPlayerProgressBar extends LitElement {
  @state() private _mediaDuration!: number;
  @state() private _mediaPosition!: number;
  @query("#progress-bar") private progressBar?: HTMLElement;
  private entityDuration = 1;
  private entityPosition = 0;
  private _progPct = 0;
  private _lastUpdate = 0;
  private _tickListener: number | undefined;
  private _handleBarWidth = 8;
  private _refreshMilliseconds = 5000;
  private _tickDurationMs = 250;
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
  @state() public _playerData?: PlayerData;

  private _activePlayer?: ExtendedHassEntity;
  @consume({ context: hassContext, subscribe: true })
  private hass!: ExtendedHass;

  private set mediaPosition(pos: number | undefined) {
    pos ??= 0;
    this._mediaPosition = pos;
    const prog = Math.min(1, pos / this._mediaDuration);
    this._progPct = prog;
  }
  private get mediaPosition() {
    return this._mediaPosition;
  }

  private set mediaDuration(dur: number | undefined) {
    dur ??= 1;
    this._mediaDuration = dur;
    const prog = Math.min(1, this._mediaPosition / dur);
    this._progPct = prog;
  }
  private get mediaDuration() {
    return this._mediaDuration;
  }

  @consume({ context: activeMediaPlayerContext, subscribe: true })
  public set activePlayer(player: ExtendedHassEntity | undefined) {
    if (this._activePlayer && !playerHasUpdated(this._activePlayer, player)) {
      return;
    }
    if (!player) {
      return;
    }
    const current_dur = player.attributes.media_duration ?? 1;
    const current_pos =
      !this._activePlayer?.attributes.media_title ||
      player.attributes.media_title == this._activePlayer.attributes.media_title
        ? player.attributes.media_position
        : 1;
    this._activePlayer = player;
    this.mediaDuration ??= current_dur;
    this.mediaPosition ??= current_pos;
    this.requestProgress();
  }
  public get activePlayer() {
    return this._activePlayer;
  }

  @consume({ context: activePlayerDataContext, subscribe: true })
  public set playerData(playerData: PlayerData | undefined) {
    if (!playerData) {
      return;
    }
    this._playerData = playerData;
    this.requestProgress();
  }
  public get playerData() {
    return this._playerData;
  }

  private requestProgress() {
    if (
      !this.activePlayerController ||
      !playerIsAvailable(this.hass, this.activePlayerController.activeEntityID)
    ) {
      return;
    }
    void this.activePlayerController.getPlayerProgress().then((progress) => {
      const prog = progress as number | undefined;
      this.entityPosition = prog ?? this.entityPosition;
      this._newSetPosition = prog ?? this.entityPosition;
    });
    void this.activePlayerController
      .getPlayerActiveItemDuration()
      .then((duration) => {
        this.mediaDuration = duration;
        this.entityDuration = duration;
      });
    if (this.activePlayer?.state == "playing") {
      this.startProgressTick();
    } else {
      this.stopProgressTick();
    }
  }
  private tickProgress = () => {
    const playing = this.playerData?.playing;
    if (!playing || this._dragging) {
      return;
    }
    const t = Date.now();
    if (
      this._requestProgress &&
      (!this.mediaDuration || t - this._lastUpdate >= this._refreshMilliseconds)
    ) {
      this._lastUpdate = t;
      this.requestProgress();
      return;
    }
    let pos = (this.mediaPosition ?? 0) + this._tickDurationMs / 1000;
    if (this._currentSetPosition != this._newSetPosition) {
      this._currentSetPosition = this._newSetPosition;
      pos = this._currentSetPosition;
    }
    this.mediaPosition = Math.min(pos, this.mediaDuration ?? 1);
  };

  private startProgressTick() {
    this.stopProgressTick();
    this._tickListener = window.setInterval(
      this.tickProgress,
      this._tickDurationMs,
    );
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
  private onSeek = async (event_: MouseEvent) => {
    if (!this.actions) {
      return;
    }
    const prog_width = this.progressBar?.offsetWidth ?? 1;
    const seek = event_.offsetX / prog_width;
    const pos = Math.floor(seek * (this.mediaDuration ?? 1));
    await this.actions.actionSeek(pos);
    this._dragging = false;
    this._requestProgress = true;
    window.removeEventListener("pointerup", this.onPointerUp);
    this.removeEventListener("pointermove", this.pointerMoveListener);
  };
  protected pointerMoveListener = (event_: PointerEvent | MouseEvent) => {
    const bar = this.progressBar;
    const offset = bar?.offsetLeft ?? 36;
    const prog_width = bar?.offsetWidth ?? 1;
    const seek = (event_.offsetX - offset) / prog_width;
    let pos = Math.floor(seek * (this.mediaDuration ?? 1));
    pos = Math.min(this.mediaDuration ?? 1, pos);
    pos = Math.max(0, pos);
    this.mediaPosition = pos;
    this._newSetPosition = pos;
    this.entityPosition = pos;
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
    this._newSetPosition = this.mediaPosition ?? 0;
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
    }
    this._dragging = false;
    this._updateTimeout = window.setTimeout(() => {
      this._requestProgress = true;
      this.requestProgress();
    }, 5000);
  };
  protected renderVolumeBar(): TemplateResult {
    if (this.controller?.Config.MusicPlayer.hide.track_progress_bar) {
      return html``;
    }
    const cls = this.playerData?.playing
      ? `wavy medium`
      : `medium progress-plain`;
    return html`
      <div
        id="progress-div"
        @pointerdown=${this.onPointerDown}
        @click=${this.onSeek}
      >
        <link
          href="https://cdn.jsdelivr.net/npm/beercss@4.0.20/dist/cdn/beer.min.css"
          rel="stylesheet"
        />
        <div
          class="prog-incomplete"
          style="--incomplete-progress-start-pct: ${Math.round(
            this._progPct * 100,
          )}%;"
        ></div>
        <progress
          class="${cls}"
          id="progress-bar"
          value="${this._progPct}"
          max="1"
        ></progress>
        ${this.renderVolumeBarHandle()}
      </div>
    `;
  }
  protected renderTime(): TemplateResult {
    if (this.controller?.Config.MusicPlayer.hide.track_progress_time) {
      return html``;
    }
    const pos = secondsToTime(this.mediaPosition ?? 0);
    const dur = secondsToTime(this.mediaDuration ?? 1);
    return html` <div id="time">${pos} - ${dur}</div> `;
  }
  protected renderVolumeBarHandle(): TemplateResult {
    const prog = `${(this._progPct * 100).toString()}%`;
    const barWidth = `${this._handleBarWidth.toString()}px`;
    return html`
      <div
        id="progress-handle"
        style="
          width: ${this._handleBarWidth.toString()}px;
          position: absolute;
          left: calc(${prog} - ${barWidth} / 2)
        "
      ></div>
    `;
  }
  protected render(): TemplateResult {
    return html`
      <div class="progress">${this.renderVolumeBar()}${this.renderTime()}</div>
    `;
  }

  connectedCallback(): void {
    this._tickListener ??= window.setInterval(
      this.tickProgress,
      this._tickDurationMs,
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
    const playing_changed = bar_playing != this.playerData?.playing;
    return _changedProperties.size > 0 || playing_changed;
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}
