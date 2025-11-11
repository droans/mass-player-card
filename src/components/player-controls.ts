import { consume } from "@lit/context"
import { CSSResultGroup, html, TemplateResult } from "lit"
import { state } from "lit/decorators.js"
import { MassPlayerControlsBase } from "./player-controls-base"
import {
  PlayerConfig,
  PlayerControlsLayout,
  PlayerIconSize,
  PlayerLayoutConfig,
} from "../config/player"
import { musicPlayerConfigContext } from "../const/context"
import {
  generateControlLabelHtml,
  generateControlSlotHtml,
  getRepeatIcon,
} from "../utils/music-player"
import { RepeatMode } from "../const/common"
import styles from "../styles/player-controls"
import { jsonMatch } from "../utils/util.js"

class MassPlayerControls extends MassPlayerControlsBase {
  private layoutConfig!: PlayerLayoutConfig
  private _config!: PlayerConfig
  @consume({ context: musicPlayerConfigContext, subscribe: true })
  @state()
  private set config(config: PlayerConfig) {
    if (jsonMatch(this._config, config)) {
      return
    }
    this._config = config
    this.layoutConfig = config.layout
  }

  protected renderShuffle(): TemplateResult {
    if (this.hiddenElements.shuffle) {
      return html``
    }
    const icon_style = this.layoutConfig.icons.shuffle
    const icon_size =
      icon_style.size == PlayerIconSize.LARGE ? "medium" : "small"
    const slotHtml = generateControlSlotHtml(icon_style)
    const label = this.controller.translate("player.controls.shuffle") as string
    const labelHtml = generateControlLabelHtml(icon_style, label)
    const div_layout =
      this.layoutConfig.controls_layout == PlayerControlsLayout.COMPACT
        ? "div-compact"
        : "div-spaced"
    const appearance = this._playerData.shuffle ? "accent" : "plain"
    return html`
      <div class="shuffle div-${icon_size} ${div_layout}">
        <ha-button
          appearance="${appearance}"
          variant="brand"
          @click=${this.onShuffle}
          size="${icon_size}"
          class="icon-${icon_size} ${icon_style.box_shadow
            ? `has-box-shadow`
            : ``} icon-${appearance}"
        >
          <ha-svg-icon
            ${slotHtml}
            .path=${this._playerData.shuffle
              ? this.Icons.SHUFFLE
              : this.Icons.SHUFFLE_DISABLED}
            class="svg-${icon_size}"
          ></ha-svg-icon>
          ${labelHtml}
        </ha-button>
      </div>
    `
  }
  protected renderPrevious(): TemplateResult {
    const icon_style = this.layoutConfig.icons.previous
    const icon_size =
      icon_style.size == PlayerIconSize.LARGE ? "medium" : "small"
    const div_layout =
      this.layoutConfig.controls_layout == PlayerControlsLayout.COMPACT
        ? "div-compact"
        : "div-spaced"
    const slotHtml = generateControlSlotHtml(icon_style)
    const label = this.controller.translate(
      "player.controls.previous",
    ) as string
    const labelHtml = generateControlLabelHtml(icon_style, label)
    return html` <div class="track-previous div-${icon_size} ${div_layout}">
      <ha-button
        appearance="outlined"
        variant="brand"
        @click=${this.onPrevious}
        size="${icon_size}"
        class="icon-${icon_size} ${icon_style.box_shadow
          ? `has-box-shadow`
          : ``}"
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
    const icon_style = this.layoutConfig.icons.play_pause
    const icon_size =
      icon_style.size == PlayerIconSize.LARGE ? "medium" : "small"
    const div_layout =
      this.layoutConfig.controls_layout == PlayerControlsLayout.COMPACT
        ? "div-compact"
        : "div-spaced"
    const slotHtml = generateControlSlotHtml(icon_style)
    const key = this._playerData.playing
      ? "player.controls.play"
      : "player.controls.pause"
    const label = this.controller.translate(key) as string
    const labelHtml = generateControlLabelHtml(icon_style, label)
    const appearance = this._playerData.playing ? "filled" : "outlined"
    return html`
      <div class="play-pause div-${icon_size} ${div_layout}">
        <ha-button
          appearance="${appearance}"
          variant="brand"
          size="${icon_size}"
          class="button-play-pause icon-${icon_size} ${icon_style.box_shadow
            ? `has-box-shadow`
            : ``} icon-${appearance}"
          @click=${this.onPlayPause}
        >
          <ha-svg-icon
            ${slotHtml}
            .path=${this._playerData.playing
              ? this.Icons.PAUSE
              : this.Icons.PLAY}
            class="svg-${icon_size} icon-outlined"
          ></ha-svg-icon>
          ${labelHtml}
        </ha-button>
      </div>
    `
  }
  protected renderNext(): TemplateResult {
    const icon_style = this.layoutConfig.icons.next
    const icon_size =
      icon_style.size == PlayerIconSize.LARGE ? "medium" : "small"
    const div_layout =
      this.layoutConfig.controls_layout == PlayerControlsLayout.COMPACT
        ? "div-compact"
        : "div-spaced"
    const slotHtml = generateControlSlotHtml(icon_style)
    const label = this.controller.translate("player.controls.next") as string
    const labelHtml = generateControlLabelHtml(icon_style, label)
    return html`
      <div class="track-next div-${icon_size} ${div_layout}">
        <ha-button
          appearance="outlined"
          variant="brand"
          @click=${this.onNext}
          size="${icon_size}"
          class="icon-${icon_size} ${icon_style.box_shadow
            ? `has-box-shadow`
            : ``}"
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
    if (this.hiddenElements.repeat) {
      return html``
    }
    const icon = getRepeatIcon(this._playerData.repeat, this.Icons)
    const div_layout =
      this.layoutConfig.controls_layout == PlayerControlsLayout.COMPACT
        ? "div-compact"
        : "div-spaced"
    const icon_style = this.layoutConfig.icons.repeat
    const icon_size =
      icon_style.size == PlayerIconSize.LARGE ? "medium" : "small"
    const slotHtml = generateControlSlotHtml(icon_style)
    const label = this.controller.translate("player.controls.repeat") as string
    const labelHtml = generateControlLabelHtml(icon_style, label)
    const appearance =
      this._playerData.repeat == RepeatMode.OFF ? "accent" : "plain"
    return html`
      <div class="repeat div-${icon_size} ${div_layout}">
        <ha-button
          appearance="${appearance}"
          variant="brand"
          size="${icon_size}"
          class="icon-${icon_size} ${icon_style.box_shadow
            ? `has-box-shadow`
            : ``} icon-${appearance}"
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
    const layout = this.layoutConfig
    const previousButton = this.renderPrevious()
    const shuffleButton = this.renderShuffle()
    return html`
      <div class="controls-left controls-${layout.controls_layout}">
        ${layout.controls_layout == PlayerControlsLayout.COMPACT
          ? previousButton
          : shuffleButton}
        ${layout.controls_layout == PlayerControlsLayout.COMPACT
          ? shuffleButton
          : previousButton}
      </div>
    `
  }
  protected renderControlsRight(): TemplateResult {
    const layout = this.layoutConfig
    return html`
      <div class="controls-right controls-${layout.controls_layout}">
        ${this.renderNext()} ${this.renderRepeat()}
      </div>
    `
  }

  protected render(): TemplateResult {
    return html`
      <div class="controls">
        ${this.renderControlsLeft()} ${this.renderPlayPause()}
        ${this.renderControlsRight()}
      </div>
    `
  }
  static get styles(): CSSResultGroup {
    return styles
  }
}

customElements.define("mass-player-controls", MassPlayerControls)
