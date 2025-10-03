import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import styles from '../styles/progress-bar'
import { state } from "lit/decorators.js";
import { consume } from "@lit/context";
import { ActivePlayerController } from "../controller/active-player.js";
import { actionsControllerContext, activeMediaPlayer, activePlayerControllerContext, activePlayerDataContext, ExtendedHassEntity } from "../const/context.js";
import { ActionsController } from "../controller/actions.js";
import { playerHasUpdated } from "../utils/util.js";
import { PlayerData } from "../const/music-player.js";
import { secondsToTime } from "../utils/util.js";
class MassPlayerProgressBar extends LitElement {
  @state() private media_duration = 1;
  @state() private media_position = 0;
  private initialUpdate = false;
  private entity_duration = 1;
  private entity_position = 0;
  private _listener: number|undefined;
  
  @consume({ context: activePlayerControllerContext, subscribe: true})
  private activePlayerController!: ActivePlayerController
  @consume({ context: actionsControllerContext, subscribe: true})
  private actions!: ActionsController;
  @consume({ context: activePlayerDataContext, subscribe: true})
  private player_data!: PlayerData;

  private _activePlayer!: ExtendedHassEntity;

  @consume({ context: activeMediaPlayer, subscribe: true})
  public set activePlayer(player: ExtendedHassEntity) {
    if (this._activePlayer) {
      if (!playerHasUpdated(this._activePlayer, player)) {
        return;
      }
    }
    this._activePlayer = player;
    this.entity_duration = player.attributes.media_duration;
    this.entity_position = player.attributes.media_position;
    if (this._listener) {
      clearInterval(this._listener);
    }
    this._listener = undefined;
    this.tickProgress();
  }
  public get activePlayer() {
    return this._activePlayer;
  }
  
  private requestProgress() {
    void this.activePlayerController.getPlayerProgress().then( 
      (progress) => {
        this.media_position = progress;
        this.entity_position = progress;
      }
    )
    void this.activePlayerController.getPlayerActiveItemDuration().then( 
      (duration) => {
        this.media_duration = duration;
        this.entity_duration = duration;
      }
    )
  }
  private tickProgress = () => {
    const playing = this.player_data.playing;
    if (!playing) {
      if (this._listener) {
        clearInterval(this._listener);
      }
    }
    const sec = new Date().getSeconds();
    if (!(sec % 5) || !this.initialUpdate) {
      this.requestProgress();
    } else {
      this.media_position += 1
    }
    if (!this._listener) {
      this._listener = setInterval(this.tickProgress, 1000);
    }
    
  }
  private onSeek = async (e: MouseEvent) => {
    const progress_element = this.shadowRoot?.getElementById('progress');
    const prog_width = progress_element?.offsetWidth ?? 1;
    const seek = e.offsetX / prog_width;
    const pos = Math.floor(seek * this.media_duration);
    this.media_position = pos;
    this.entity_position = pos;
    await this.actions.actionSeek(pos);
  }

  protected renderTime() {
    const pos = secondsToTime(this.media_position);
    const dur = secondsToTime(this.media_duration);
    return `${pos} - ${dur}`;
  }
  protected render(): TemplateResult {
    const pct = this.media_position / this.media_duration;
    return html`
      <div class="progress">
        <div id="time">
          ${this.renderTime()}
        </div>
        <md-linear-progress
          id="progress"
          value="${pct}"
          @click=${this.onSeek}
        ></md-linear-progress>
      </div>
    `
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-progress-bar', MassPlayerProgressBar);
