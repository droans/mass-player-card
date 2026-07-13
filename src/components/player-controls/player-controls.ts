import { CSSResultGroup, html, TemplateResult } from "lit";
import { MassPlayerControlsBase } from "./player-controls-base";
import { PlayerControlsLayout, PlayerIconSize } from "../../config/player";
import {
  generateControlLabelHtml,
  generateControlSlotHtml,
  getRepeatIcon,
} from "../../utils/music-player";
import { RepeatMode } from "../../const/enums";
import styles from "./player-controls-styles";
import { customElement } from "lit/decorators.js";

@customElement("mpc-player-controls")
export class MassPlayerControls extends MassPlayerControlsBase {
  protected renderShuffle(): TemplateResult {
    if (this.hiddenElements.shuffle_button) {
      return html``;
    }
    const iconStyle = this.layoutConfig.icons.shuffle;
    const iconSize = iconStyle.size == PlayerIconSize.LARGE ? "m" : "s";
    const slotHtml = generateControlSlotHtml(iconStyle);
    const label = this.controller.translate(
      "player.controls.shuffle",
    ) as string;
    const labelHtml = generateControlLabelHtml(
      iconStyle,
      label,
      this.layoutConfig.hide_labels,
    );
    const divLayout = this.layoutConfig.controls_layout;
    const appearance = this._playerData.shuffle ? "accent" : "plain";
    return html`
      <div class="shuffle div ${iconSize} ${divLayout}">
        <ha-button
          appearance="${appearance}"
          variant="brand"
          @click=${this.onShuffle}
          size="${iconSize}"
          class="icon ${iconSize} ${iconStyle.box_shadow
            ? `has-box-shadow`
            : ``}  ${appearance}"
        >
          <ha-svg-icon
            ${slotHtml}
            .path=${this._playerData.shuffle
              ? this.Icons.SHUFFLE
              : this.Icons.SHUFFLE_DISABLED}
            class="svg ${iconSize}"
          ></ha-svg-icon>
          <div class="button-label">${labelHtml}</div>
        </ha-button>
      </div>
    `;
  }
  protected renderPrevious(): TemplateResult {
    const iconStyle = this.layoutConfig.icons.previous;
    const iconSize = iconStyle.size == PlayerIconSize.LARGE ? "m" : "s";
    const divLayout = this.layoutConfig.controls_layout;
    const slotHtml = generateControlSlotHtml(iconStyle);
    const label = this.controller.translate(
      "player.controls.previous",
    ) as string;
    const labelHtml = generateControlLabelHtml(
      iconStyle,
      label,
      this.layoutConfig.hide_labels,
    );
    return html`
      <div class="track-previous div ${iconSize} ${divLayout}">
        <ha-button
          appearance="outlined"
          variant="brand"
          @click=${this.onPrevious}
          size="${iconSize}"
          class="icon ${iconSize} ${iconStyle.box_shadow
            ? `has-box-shadow`
            : ``}"
        >
          <ha-svg-icon
            ${slotHtml}
            .path=${this.Icons.SKIP_PREVIOUS}
            class="svg ${iconSize} icon-outlined"
          ></ha-svg-icon>
          <div class="button-label">${labelHtml}</div>
        </ha-button>
      </div>
    `;
  }
  protected renderPlayPause(): TemplateResult {
    const iconStyle = this.layoutConfig.icons.play_pause;
    const iconSize = iconStyle.size == PlayerIconSize.LARGE ? "m" : "s";
    const divLayout = this.layoutConfig.controls_layout;
    const slotHtml = generateControlSlotHtml(iconStyle);
    const key = this._playerData.playing
      ? "player.controls.play"
      : "player.controls.pause";
    const label = this.controller.translate(key) as string;
    const labelHtml = generateControlLabelHtml(
      iconStyle,
      label,
      this.layoutConfig.hide_labels,
    );
    const appearance = this._playerData.playing ? "filled" : "outlined";
    return html`
      <div
        class="play-pause div ${iconSize} ${divLayout}
        ${this._playerData.playing ? `playing` : `paused`}"
      >
        <ha-button
          appearance="${appearance}"
          variant="brand"
          size="${iconSize}"
          class="mpc-button-play-pause icon ${iconSize} ${iconStyle.box_shadow
            ? `has-box-shadow`
            : ``} ${appearance}"
          @click=${this.onPlayPause}
        >
          <ha-svg-icon
            ${slotHtml}
            .path=${this._playerData.playing
              ? this.Icons.PAUSE
              : this.Icons.PLAY}
            class="svg ${iconSize} icon-outlined"
          ></ha-svg-icon>
          <div class="button-label">${labelHtml}</div>
        </ha-button>
      </div>
    `;
  }
  protected renderNext(): TemplateResult {
    const iconStyle = this.layoutConfig.icons.next;
    const iconSize = iconStyle.size == PlayerIconSize.LARGE ? "m" : "s";
    const divLayout = this.layoutConfig.controls_layout;
    const slotHtml = generateControlSlotHtml(iconStyle);
    const label = this.controller.translate("player.controls.next") as string;
    const labelHtml = generateControlLabelHtml(
      iconStyle,
      label,
      this.layoutConfig.hide_labels,
    );
    return html`
      <div class="track-next div ${iconSize} ${divLayout}">
        <ha-button
          appearance="outlined"
          variant="brand"
          @click=${this.onNext}
          size="${iconSize}"
          class="icon ${iconSize} ${iconStyle.box_shadow
            ? `has-box-shadow`
            : ``}"
          style="display: block;"
        >
          <ha-svg-icon
            ${slotHtml}
            .path=${this.Icons.SKIP_NEXT}
            class="svg ${iconSize}"
          ></ha-svg-icon>
          <div class="button-label">${labelHtml}</div>
        </ha-button>
      </div>
    `;
  }
  protected renderRepeat(): TemplateResult {
    if (this.hiddenElements.repeat_button) {
      return html``;
    }
    const icon = getRepeatIcon(this._playerData.repeat, this.Icons);
    const divLayout = this.layoutConfig.controls_layout;
    const iconStyle = this.layoutConfig.icons.repeat;
    const iconSize = iconStyle.size == PlayerIconSize.LARGE ? "m" : "s";
    const slotHtml = generateControlSlotHtml(iconStyle);
    const label = this.controller.translate("player.controls.repeat") as string;
    const labelHtml = generateControlLabelHtml(
      iconStyle,
      label,
      this.layoutConfig.hide_labels,
    );
    const appearance =
      this._playerData.repeat == RepeatMode.OFF ? "accent" : "plain";
    return html`
      <div class="repeat div ${iconSize} ${divLayout}">
        <ha-button
          appearance="${appearance}"
          variant="brand"
          size="${iconSize}"
          class="icon ${iconSize} ${iconStyle.box_shadow
            ? `has-box-shadow`
            : ``} ${appearance}"
          @click=${this.onRepeat}
        >
          <ha-svg-icon
            ${slotHtml}
            .path=${icon}
            class="svg ${iconSize}"
          ></ha-svg-icon>
          <div class="button-label">${labelHtml}</div>
        </ha-button>
      </div>
    `;
  }

  protected renderControlsLeft(): TemplateResult {
    const layout = this.layoutConfig;
    const previousButton = this.renderPrevious();
    const shuffleButton = this.renderShuffle();
    return html`
      <div class="controls left ${layout.controls_layout}">
        ${layout.controls_layout == PlayerControlsLayout.COMPACT
          ? previousButton
          : shuffleButton}
        ${layout.controls_layout == PlayerControlsLayout.COMPACT
          ? shuffleButton
          : previousButton}
      </div>
    `;
  }
  protected renderControlsRight(): TemplateResult {
    const layout = this.layoutConfig;
    return html`
      <div class="controls right ${layout.controls_layout}">
        ${this.renderNext()} ${this.renderRepeat()}
      </div>
    `;
  }

  protected render(): TemplateResult {
    return html`
      <div class="controls-div">
        ${this.renderControlsLeft()} ${this.renderPlayPause()}
        ${this.renderControlsRight()}
      </div>
    `;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
