import { CSSResultGroup, LitElement, TemplateResult } from "lit";
import styles from '../styles/player-controls';
import { PlayerConfig, PlayerControlsLayout, PlayerIconSize, PlayerLayoutConfig } from "../config/player";
import { ActionsController } from "../controller/actions";
import { consume } from "@lit/context";
import {
  actionsControllerContext,
  activePlayerDataContext,
  IconsContext,
  musicPlayerConfigContext
} from "../const/context";
import { PlayerData } from "../const/music-player";
import { RepeatMode } from "../const/common";
import { state } from "lit/decorators.js";
import {
  html
} from "lit/static-html.js";
import {
  generateControlLabelHtml,
  generateControlSlotHtml,
  getIteratedRepeatMode,
  getRepeatIcon
} from "../utils/music-player";
import { Icons } from "../const/icons.js";

class MassPlayerControls extends LitElement {
  @consume({ context: actionsControllerContext, subscribe: true})
  private controller!: ActionsController;
  @consume({ context: activePlayerDataContext, subscribe: true})
  @state()
  private player_data!: PlayerData;
  @consume({ context: IconsContext}) private Icons!: Icons;
  private _config!: PlayerConfig;
  private layoutConfig!: PlayerLayoutConfig;
  
  @consume({ context: musicPlayerConfigContext, subscribe: true})
  @state()
  private set config(config: PlayerConfig) {
    this._config = config;
    this.layoutConfig = config.layout;
  }

  private onPrevious = async () => {
    await this.controller.actionPlayPrevious();
  }
  private onShuffle = async () => {
    await this.controller.actionToggleShuffle();
  }
  private onPlayPause = async () => {
    await this.controller.actionPlayPause();
  }
  private onNext = async () => {
    await this.controller.actionPlayNext();
  }
  private onRepeat = async () => {
    const cur_repeat = this.player_data.repeat;
    const repeat = getIteratedRepeatMode(cur_repeat);
    this.requestUpdate();
    await this.controller.actionSetRepeat(repeat);
  }

  protected renderShuffle(): TemplateResult {
    const icon_style = this.layoutConfig.icons.shuffle;
    const icon_size = icon_style.size == PlayerIconSize.LARGE ? "medium" : "small";
    const slotHtml = generateControlSlotHtml(icon_style);
    const labelHtml = generateControlLabelHtml(icon_style, 'Shuffle');
    const div_layout= this.layoutConfig.controls_layout == PlayerControlsLayout.COMPACT ? "div-compact" : "div-spaced";
    const appearance = this.player_data.shuffle ? "accent" : "plain";
    return html`
      <div class="shuffle div-${icon_size} ${div_layout}">
        <ha-button
          appearance="${appearance}"
          variant="brand"
          @click=${this.onShuffle}
          size="${icon_size}"
          class="icon-${icon_size} ${icon_style.box_shadow ? `has-box-shadow` : ``} icon-${appearance}"
        >
          <ha-svg-icon
            ${slotHtml}
            .path=${this.player_data.shuffle ? this.Icons.SHUFFLE : this.Icons.SHUFFLE_DISABLED}
            class="svg-${icon_size}"
          ></ha-svg-icon>
          ${labelHtml}
        </ha-button>
      </div>
    `
  }
  protected renderPrevious(): TemplateResult {
    const icon_style = this.layoutConfig.icons.previous;
    const icon_size = icon_style.size == PlayerIconSize.LARGE ? "medium" : "small";
    const div_layout= this.layoutConfig.controls_layout == PlayerControlsLayout.COMPACT ? "div-compact" : "div-spaced";
    const slotHtml = generateControlSlotHtml(icon_style);
    const labelHtml = generateControlLabelHtml(icon_style, 'Previous');
    return html`
      <div class="track-previous div-${icon_size} ${div_layout}">
        <ha-button
          appearance="outlined"
          variant="brand"
          @click=${this.onPrevious}
          size="${icon_size}"
          class="icon-${icon_size} ${icon_style.box_shadow ? `has-box-shadow` : ``}"
        >
          <ha-svg-icon
            ${slotHtml}
            .path=${this.Icons.SKIP_PREVIOUS}
            class="svg-${icon_size} icon-outlined"
          ></ha-svg-icon>
          ${labelHtml}
        </ha-button>
      </div>`
  }
  protected renderPlayPause(): TemplateResult {
    const icon_style = this.layoutConfig.icons.play_pause;
    const icon_size = icon_style.size == PlayerIconSize.LARGE ? "medium" : "small";
    const div_layout= this.layoutConfig.controls_layout == PlayerControlsLayout.COMPACT ? "div-compact" : "div-spaced";
    const slotHtml = generateControlSlotHtml(icon_style);
    const label = this.player_data.playing ? 'Playing' : 'Paused';
    const labelHtml = generateControlLabelHtml(icon_style, label);
    const appearance = this.player_data.playing ? "filled" : "outlined";
    return html`
      <div class="play-pause div-${icon_size} ${div_layout}">
        <ha-button
          appearance="${appearance}"
          variant="brand"
          size="${icon_size}"
          class="button-play-pause icon-${icon_size} ${icon_style.box_shadow ? `has-box-shadow` : ``} icon-${appearance}"
          @click=${this.onPlayPause}
        >
          <ha-svg-icon
            ${slotHtml}
            .path=${this.player_data.playing ?  this.Icons.PAUSE : this.Icons.PLAY}
            class="svg-${icon_size} icon-outlined"
          ></ha-svg-icon>
          ${labelHtml}
        </ha-button>
      </div>
    `
  }
  protected renderNext(): TemplateResult {
    const icon_style = this.layoutConfig.icons.next;
    const icon_size = icon_style.size == PlayerIconSize.LARGE ? "medium" : "small";
    const div_layout= this.layoutConfig.controls_layout == PlayerControlsLayout.COMPACT ? "div-compact" : "div-spaced";
    const slotHtml = generateControlSlotHtml(icon_style);
    const labelHtml = generateControlLabelHtml(icon_style, 'Next');
    return html`
      <div class="track-next div-${icon_size} ${div_layout}">
        <ha-button
          appearance="outlined"
          variant="brand"
          @click=${this.onNext}
          size="${icon_size}"
          class="icon-${icon_size} ${icon_style.box_shadow ? `has-box-shadow` : ``}"
          style="display: block;"
        >
          <ha-svg-icon
            ${slotHtml}
            .path=${this.Icons.SKIP_NEXT}
            class="svg-${icon_size}"
          ></ha-svg-icon>
          ${labelHtml}
        </ha-button>
      </div>
    `
  }
  protected renderRepeat(): TemplateResult {
    const icon = getRepeatIcon(this.player_data.repeat, this.Icons);
    const div_layout= this.layoutConfig.controls_layout == PlayerControlsLayout.COMPACT ? "div-compact" : "div-spaced";
    const icon_style = this.layoutConfig.icons.repeat;
    const icon_size = icon_style.size == PlayerIconSize.LARGE ? "medium" : "small";
    const slotHtml = generateControlSlotHtml(icon_style);
    const labelHtml = generateControlLabelHtml(icon_style, 'Repeat');
    const appearance = this.player_data.repeat == RepeatMode.OFF ? "accent" : "plain";
    return html`
      <div class="repeat div-${icon_size} ${div_layout}">
        <ha-button
          appearance="${appearance}"
          variant="brand"
          size="${icon_size}"
          class="icon-${icon_size} ${icon_style.box_shadow ? `has-box-shadow` : ``} icon-${appearance}"
          @click=${this.onRepeat}
        >
          <ha-svg-icon
            ${slotHtml}
            .path=${icon}
            class="svg-${icon_size}"
          ></ha-svg-icon>
          ${labelHtml}
        </ha-button>
      </div>
    `
  }
  
  protected renderControlsLeft(): TemplateResult {
    const layout = this.layoutConfig;
    const previousButton = this.renderPrevious();
    const shuffleButton = this.renderShuffle();
    return html`
      <div class="controls-left controls-${layout.controls_layout}">
        ${layout.controls_layout == PlayerControlsLayout.COMPACT ? previousButton : shuffleButton}
        ${layout.controls_layout == PlayerControlsLayout.COMPACT ? shuffleButton : previousButton}
      </div>
    `
  }
  protected renderControlsRight(): TemplateResult {
    const layout = this.layoutConfig;
    return html`
      <div class="controls-right controls-${layout.controls_layout}">
         ${this.renderNext()}
        ${this.renderRepeat()}
      </div>
    `
  }

  protected render(): TemplateResult {
    return html`
      <div class="controls">
        ${this.renderControlsLeft()}
        ${this.renderPlayPause()}
        ${this.renderControlsRight()}
      </div>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-player-controls', MassPlayerControls);
