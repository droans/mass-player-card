import { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { html, literal } from "lit/static-html.js";
import { MassPlayerControlsBase } from "./player-controls-base";
import { VibrationPattern } from "../const/common";
import { getRepeatIcon } from "../utils/music-player";
import styles from "../styles/player-controls-expressive";
import "./button";
import { PlayerIcon } from "../config/player";
import { RepeatMode } from "../const/enums";

class MassPlayerControlsExpressive extends MassPlayerControlsBase {
  protected onFavoriteHold = () => {
    navigator.vibrate(VibrationPattern.Player.ACTION_FAVORITE_HOLD);
    const e = new Event("open-add-to-playlist-dialog");
    this.controller.host.dispatchEvent(e);
  };
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
        elevation="1"
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
    const label = this.renderLabel(
      "player.controls.power",
      this.layoutConfig.icons.power,
    ) as string | undefined;
    const icon = this.renderLowerIcon(
      this.Icons.POWER,
      `icons-power icons-lower`,
    );
    const no_label_class = !label?.length ? `no-label` : ``;
    return html`
      <mass-player-card-button
        .onPressService=${this.onPower}
        role="variant"
        size="medium"
        id="button-power"
        class="button-lower ${no_label_class}"
      >
        ${icon} ${label}
      </mass-player-card-button>
    `;
  }
  protected renderShuffle(): TemplateResult {
    if (this.hiddenElements.shuffle) {
      return html``;
    }
    const shuffle = this.shuffle;
    const label = this.renderLabel(
      "player.controls.shuffle",
      this.layoutConfig.icons.power,
    ) as string | undefined;
    const _icon = shuffle ? this.Icons.SHUFFLE : this.Icons.SHUFFLE_DISABLED;
    const no_label_class = !label?.length ? `no-label` : ``;
    const active_class = shuffle ? `button-lower-active` : ``;

    const icon_html = this.renderLowerIcon(
      _icon,
      `icons-shuffle icons-lower${shuffle ? `-active` : ``}`,
      label,
    );
    return html`
      <mass-player-card-button
        .onPressService=${this.onShuffle}
        role="variant"
        size="medium"
        selectable
        ?selected=${shuffle}
        elevation=${shuffle ? 1 : 0}
        id="button-shuffle"
        class="button-lower ${active_class} ${no_label_class}"
      >
        ${icon_html} ${label}
      </mass-player-card-button>
    `;
  }
  protected renderRepeat(): TemplateResult {
    if (this.hiddenElements.repeat) {
      return html``;
    }
    const repeat = this.repeat;
    const repeat_on = repeat != RepeatMode.OFF;

    const label = this.renderLabel(
      "player.controls.repeat",
      this.layoutConfig.icons.power,
    ) as string | undefined;
    const _icon = getRepeatIcon(repeat, this.Icons);
    const no_label_class = !label?.length ? `no-label` : ``;
    const active_class = repeat_on ? `button-lower-active` : ``;

    const icon_html = this.renderLowerIcon(
      _icon,
      `icons-repeat icons-lower${repeat_on ? `-active` : ``}`,
      label,
    );
    return html`
      <mass-player-card-button
        .onPressService=${this.onRepeat}
        role="variant"
        size="medium"
        selectable
        ?selected=${repeat_on}
        elevation=${repeat_on ? 1 : 0}
        id="button-repeat"
        class="button-lower ${active_class} ${no_label_class}"
      >
        ${icon_html} ${label}
      </mass-player-card-button>
    `;
  }
  protected renderFavorite(): TemplateResult {
    if (this.hiddenElements.favorite) {
      return html``;
    }
    const favorite = this.favorite;
    const label = this.renderLabel(
      "player.controls.favorite",
      this.layoutConfig.icons.favorite,
    ) as string | undefined;
    const no_label_class = !label?.length ? `no-label` : ``;
    const active_class = favorite ? `button-lower-active` : ``;
    const _icon = favorite ? this.Icons.HEART_ALT : this.Icons.HEART_PLUS;

    const icon_html = this.renderLowerIcon(
      _icon,
      `icons-favorite icons-lower${favorite ? `-active` : ``}`,
      label,
    );
    return html`
      <mass-player-card-button
        .onPressService=${this.onFavorite}
        .onHoldService=${this.onFavoriteHold}
        role="variant"
        size="medium"
        selectable
        ?selected=${favorite}
        elevation=${favorite ? 1 : 0}
        id="button-favorite"
        class="button-lower ${active_class} ${no_label_class}"
      >
        ${icon_html} ${label}
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
  private renderLowerIcon(
    path: string,
    _class: string,
    _label: string | null = null,
  ) {
    const slot_attr = _label?.length ? literal`slot="start"` : ``;
    return html`
      <ha-svg-icon ${slot_attr} .path=${path} class="${_class}"></ha-svg-icon>
    `;
  }
  private renderLabel(label_key: string, icon_config: PlayerIcon): string {
    const hide_labels = this.layoutConfig.hide_labels;
    const hide_icon = !icon_config.label;
    if (hide_labels || hide_icon) {
      return ``;
    }
    return this.controller.translate(label_key) as string;
  }
}

customElements.define(
  "mass-player-controls-expressive",
  MassPlayerControlsExpressive,
);
