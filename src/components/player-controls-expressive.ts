import { CSSResultGroup, html, TemplateResult } from "lit";
import { MassPlayerControlsBase } from "./player-controls-base";
import { RepeatMode } from "../const/common";
import { getRepeatIcon } from "../utils/music-player";
import styles from "../styles/player-controls-expressive";

class MassPlayerControlsExpressive extends MassPlayerControlsBase {
  protected renderPrevious(): TemplateResult {
    return html`
      <ha-button
        appearance="filled"
        variant="brand"
        @click=${this.onPrevious}
        size="medium"
        id="button-previous"
        class="button-next-previous"
      >
        <ha-svg-icon
          .path=${this.Icons.SKIP_PREVIOUS}
          class="icons-next-previous"
          id="icon-previous"
        ></ha-svg-icon>
      </ha-button>
    `;
  }
  protected renderPlayPause(): TemplateResult {
    const playing = this.playing;
    return html`
      <ha-button
        appearance="filled"
        variant="brand"
        @click=${this.onPlayPause}
        size="medium"
        id="${playing ? `button-play` : `button-pause`}"
        class="button-play-pause"
      >
        <ha-svg-icon
          .path=${playing ? this.Icons.PAUSE : this.Icons.PLAY}
          id="${playing ? `icon-play` : `icon-pause`}"
          class="icon-play-pause"
        ></ha-svg-icon>
      </ha-button>
    `;
  }
  protected renderNext(): TemplateResult {
    return html`
      <ha-button
        appearance="filled"
        variant="brand"
        @click=${this.onNext}
        size="medium"
        id="button-next"
        class="button-next-previous"
      >
        <ha-svg-icon
          .path=${this.Icons.SKIP_NEXT}
          class="icons-next-previous"
          id="icon-previous"
        ></ha-svg-icon>
      </ha-button>
    `;
  }
  protected renderPower(): TemplateResult {
    if (this.hiddenElements.power) {
      return html``;
    }
    return html`
      <ha-button
        appearance="filled"
        variant="brand"
        @click=${this.onPower}
        size="small"
        id="button-power"
        class="button-lower"
      >
        <ha-svg-icon
          slot="start"
          .path=${this.Icons.POWER}
          class="icons-power icons-lower"
        ></ha-svg-icon>
        ${this.controller.translate("player.controls.power")}
      </ha-button>
    `;
  }
  protected renderShuffle(): TemplateResult {
    if (this.hiddenElements.shuffle) {
      return html``;
    }
    const shuffle = this.shuffle;
    return html`
      <ha-button
        appearance="filled"
        variant="brand"
        @click=${this.onShuffle}
        size="small"
        id="button-shuffle"
        class="button-lower ${shuffle ? `button-lower-active` : ``}"
      >
        <ha-svg-icon
          slot="start"
          .path=${shuffle ? this.Icons.SHUFFLE : this.Icons.SHUFFLE_DISABLED}
          class="icons-shuffle icons-lower${shuffle ? `-active` : ``}"
        ></ha-svg-icon>
        ${this.controller.translate("player.controls.shuffle")}
      </ha-button>
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
      <ha-button
        appearance="filled"
        variant="brand"
        @click=${this.onRepeat}
        size="small"
        id="button-repeat"
        class="button-lower ${repeat_on ? `button-lower-active` : ``}"
      >
        <ha-svg-icon
          slot="start"
          .path=${icon}
          class="icons-repeat icons-lower${repeat_on ? `-active` : ``}"
        ></ha-svg-icon>
        ${this.controller.translate("player.controls.repeat")}
      </ha-button>
    `;
  }
  protected renderFavorite(): TemplateResult {
    if (this.hiddenElements.favorite) {
      return html``;
    }
    const favorite = this.favorite;
    return html`
      <ha-button
        appearance="filled"
        variant="brand"
        @click=${this.onFavorite}
        size="small"
        id="button-favorite"
        class="button-lower ${favorite ? `button-lower-active` : ``}"
      >
        <ha-svg-icon
          slot="start"
          .path=${favorite ? this.Icons.HEART : this.Icons.HEART_PLUS}
          class="icons-favorite icons-lower${favorite ? `-active` : ``}"
        ></ha-svg-icon>
        ${this.controller.translate("player.controls.favorite")}
      </ha-button>
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
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define(
  "mass-player-controls-expressive",
  MassPlayerControlsExpressive,
);
