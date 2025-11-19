import { CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
import { MassPlayerControlsBase } from "./player-controls-base";
import { RepeatMode } from "../const/common";
import { getRepeatIcon } from "../utils/music-player";
import styles from "../styles/player-controls-expressive";
import './button'

class MassPlayerControlsExpressive extends MassPlayerControlsBase {
  protected renderPrevious(): TemplateResult {
    return html`
      <mass-player-card-button
        .onPressService=${this.onPrevious}
        role="filled-variant"
        size="large"
        id="button-previous"
        class="button-next-previous"
      >
        <ha-svg-icon
          .path=${this.Icons.SKIP_PREVIOUS}
          class="icons-next-previous"
          id="icon-previous"
        ></ha-svg-icon>
      </mass-player-card-button>
    `;
  }
  protected renderPlayPause(): TemplateResult {
    const playing = this.playing;
    return html`
      <mass-player-card-button
        .onPressService=${this.onPlayPause}
        role="filled-variant"
        size="large"
        elevation=1
        selectable
        ?selected=${playing}
        id="${playing ? `button-play` : `button-pause`}"
        class="button-play-pause"
      >
        <ha-svg-icon
          .path=${playing ? this.Icons.PAUSE : this.Icons.PLAY}
          id="${playing ? `icon-play` : `icon-pause`}"
          class="icon-play-pause"
        ></ha-svg-icon>
      </mass-player-card-button>
    `;
  }
  protected renderNext(): TemplateResult {
    return html`
      <mass-player-card-button
        .onPressService=${this.onNext}
        role="filled-variant"
        size="large"
        id="button-next"
        class="button-next-previous"
      >
        <ha-svg-icon
          .path=${this.Icons.SKIP_NEXT}
          class="icons-next-previous"
          id="icon-previous"
        ></ha-svg-icon>
      </mass-player-card-button>
    `;
  }
  protected renderPower(): TemplateResult {
    if (this.hiddenElements.power) {
      return html``;
    }
    return html`
      <mass-player-card-button
        .onPressService=${this.onPower}
        role="variant"
        size="medium"
        id="button-power"
        class="button-lower"
      >
        <ha-svg-icon
          slot="start"
          .path=${this.Icons.POWER}
          class="icons-power icons-lower"
        ></ha-svg-icon>
        ${this.controller.translate("player.controls.power")}
      </mass-player-card-button>
    `;
  }
  protected renderShuffle(): TemplateResult {
    if (this.hiddenElements.shuffle) {
      return html``;
    }
    const shuffle = this.shuffle;
    return html`
      <mass-player-card-button
        .onPressService=${this.onShuffle}
        role="variant"
        size="medium"
        selectable
        ?selected=${shuffle}
        elevation=${shuffle ? 1 : 0}
        id="button-shuffle"
        class="button-lower ${shuffle ? `button-lower-active` : ``}"
      >
        <ha-svg-icon
          slot="start"
          .path=${shuffle ? this.Icons.SHUFFLE : this.Icons.SHUFFLE_DISABLED}
          class="icons-shuffle icons-lower${shuffle ? `-active` : ``}"
        ></ha-svg-icon>
        ${this.controller.translate("player.controls.shuffle")}
      </mass-player-card-button>
    `;
  }
  protected renderRepeat(): TemplateResult {
    if (this.hiddenElements.repeat) {
      return html``;
    }
    const repeat = this.repeat;
    const repeat_on = repeat != RepeatMode.OFF;
    const icon = getRepeatIcon(repeat, this.Icons);
    return html`
      <mass-player-card-button
        .onPressService=${this.onRepeat}
        role="variant"
        size="medium"
        selectable
        ?selected=${repeat_on}
        elevation=${repeat_on ? 1 : 0}
        id="button-repeat"
        class="button-lower ${repeat_on ? `button-lower-active` : ``}"
      >
        <ha-svg-icon
          slot="start"
          .path=${icon}
          class="icons-repeat icons-lower${repeat_on ? `-active` : ``}"
        ></ha-svg-icon>
        ${this.controller.translate("player.controls.repeat")}
      </mass-player-card-button>
    `;
  }
  protected renderFavorite(): TemplateResult {
    if (this.hiddenElements.favorite) {
      return html``;
    }
    const favorite = this.favorite;
    return html`
      <mass-player-card-button
        .onPressService=${this.onFavorite}
        role="variant"
        size="medium"
        selectable
        ?selected=${favorite}
        elevation=${favorite ? 1 : 0}
        id="button-favorite"
        class="button-lower ${favorite ? `button-lower-active` : ``}"
      >
        <ha-svg-icon
          slot="start"
          .path=${favorite ? this.Icons.HEART : this.Icons.HEART_PLUS}
          class="icons-favorite icons-lower${favorite ? `-active` : ``}"
        ></ha-svg-icon>
        ${this.controller.translate("player.controls.favorite")}
      </mass-player-card-button>
    `;
  }
  protected renderUpperControls(): TemplateResult {
    return html`
      <div id="player-controls-upper" class="player-controls">
        ${this.renderPrevious()} ${this.renderPlayPause()} ${this.renderNext()}
      </div>
    `;
  }
  protected renderLowerControls(): TemplateResult {
    const h = this.hiddenElements;
    const all_hidden = h.power && h.shuffle && h.repeat && h.favorite;
    if (all_hidden) {
      return html``;
    }
    return html`
      <div
        id="player-controls-lower"
        class="player-controls"
      >
          ${this.renderPower()}
          ${this.renderShuffle()}
          ${this.renderRepeat()}
          ${this.renderFavorite()}
        </nav>
      </div>
    `;
  }
  protected render(): TemplateResult {
    return html`
      <link
        href="https://cdn.jsdelivr.net/npm/beercss@3.12.11/dist/cdn/beer.min.css"
        rel="stylesheet"
      />
      <div id="div-controls">
        ${this.renderUpperControls()} ${this.renderLowerControls()}
      </div>
    `;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return super.shouldUpdate(_changedProperties);
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define(
  "mass-player-controls-expressive",
  MassPlayerControlsExpressive,
);
