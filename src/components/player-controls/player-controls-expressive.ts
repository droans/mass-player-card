import { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { html, literal } from "lit/static-html.js";
import { MassPlayerControlsBase } from "./player-controls-base";
import { VibrationPattern } from "../../const/common";
import { getRepeatIcon } from "../../utils/music-player";
import styles from "./player-controls-expressive-styles";
import "../button/button";
import { PlayerIcon } from "../../config/player";
import { PlayerSupportedFeatures, RepeatMode } from "../../const/enums";
import { playerSupportsFeature } from "../../utils/utility";
import { customElement } from "lit/decorators.js";

@customElement("mpc-player-controls-expressive")
export class MassPlayerControlsExpressive extends MassPlayerControlsBase {
  protected onFavoriteHold = () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (navigator.vibrate) {
      navigator.vibrate(VibrationPattern.Player.ACTION_FAVORITE_HOLD);
    }
    const event_ = new Event("open-add-to-playlist-dialog");
    this.controller.host.dispatchEvent(event_);
  };
  protected renderPrevious(): TemplateResult {
    return html`
      <mpc-button
        .onPressService=${this.onPrevious}
        role="filled-variant"
        size="large"
        id="button-previous"
        class="mpc-button previous"
      >
        <ha-svg-icon
          .path=${this.Icons.SKIP_PREVIOUS}
          class="icons previous"
          id="icon-previous"
        ></ha-svg-icon>
      </mpc-button>
    `;
  }
  protected renderPlayPause(): TemplateResult {
    const playing = this.playing;
    return html`
      <mpc-button
        .onPressService=${this.onPlayPause}
        role="filled-variant"
        size="large"
        elevation="1"
        selectable
        ?selected=${playing}
        id="${playing ? `button-play` : `button-pause`}"
        class="mpc-button play-pause"
      >
        <ha-svg-icon
          .path=${playing ? this.Icons.PAUSE : this.Icons.PLAY}
          id="${playing ? `icon-play` : `icon-pause`}"
          class="icons play-pause"
        ></ha-svg-icon>
      </mpc-button>
    `;
  }
  protected renderNext(): TemplateResult {
    return html`
      <mpc-button
        .onPressService=${this.onNext}
        role="filled-variant"
        size="large"
        id="button-next"
        class="mpc-button next"
      >
        <ha-svg-icon
          .path=${this.Icons.SKIP_NEXT}
          class="icons next"
          id="icon-previous"
        ></ha-svg-icon>
      </mpc-button>
    `;
  }
  protected renderPower(): TemplateResult {
    const feats = this.activeEntity.attributes.supported_features;
    const canToggle =
      playerSupportsFeature(feats, PlayerSupportedFeatures.TURN_ON) &&
      playerSupportsFeature(feats, PlayerSupportedFeatures.TURN_OFF);
    if (this.hiddenElements.power_button || !canToggle) {
      return html``;
    }
    const label = this.renderLabel(
      "player.controls.power",
      this.layoutConfig.icons.power,
    ) as string | undefined;
    const icon = this.renderLowerIcon(this.Icons.POWER, `icons power lower`);
    const no_label_class = label?.length ? `` : `no-label`;
    return html`
      <mpc-button
        .onPressService=${this.onPower}
        role="variant"
        size="medium"
        id="button-power"
        class="mpc-button lower ${no_label_class}"
        elevation="1"
      >
        ${icon} ${label}
      </mpc-button>
    `;
  }
  protected renderShuffle(): TemplateResult {
    if (this.hiddenElements.shuffle_button) {
      return html``;
    }
    const shuffle = this.shuffle;
    const label = this.renderLabel(
      "player.controls.shuffle",
      this.layoutConfig.icons.power,
    ) as string | undefined;
    const _icon = shuffle ? this.Icons.SHUFFLE : this.Icons.SHUFFLE_DISABLED;
    const no_label_class = label?.length ? `` : `no-label`;
    const active_class = shuffle ? `active` : ``;

    const icon_html = this.renderLowerIcon(
      _icon,
      `icons shuffle lower ${active_class}`,
      label,
    );
    return html`
      <mpc-button
        .onPressService=${this.onShuffle}
        role="variant"
        size="medium"
        selectable
        ?selected=${shuffle}
        elevation=${shuffle ? 2 : 1}
        id="button-shuffle"
        class="mpc-button lower ${active_class} ${no_label_class}"
      >
        ${icon_html} ${label}
      </mpc-button>
    `;
  }
  protected renderRepeat(): TemplateResult {
    if (this.hiddenElements.repeat_button) {
      return html``;
    }
    const repeat = this.repeat;
    const repeat_on = repeat != RepeatMode.OFF;

    const label = this.renderLabel(
      "player.controls.repeat",
      this.layoutConfig.icons.power,
    ) as string | undefined;
    const _icon = getRepeatIcon(repeat, this.Icons);
    const no_label_class = label?.length ? `` : `no-label`;
    const active_class = repeat_on ? `active` : ``;

    const icon_html = this.renderLowerIcon(
      _icon,
      `icons repeat lower ${active_class}`,
      label,
    );
    return html`
      <mpc-button
        .onPressService=${this.onRepeat}
        role="variant"
        size="medium"
        selectable
        ?selected=${repeat_on}
        elevation=${repeat_on ? 2 : 1}
        id="button-repeat"
        class="mpc-button lower ${active_class} ${no_label_class}"
      >
        ${icon_html} ${label}
      </mpc-button>
    `;
  }
  protected renderFavorite(): TemplateResult {
    if (this.hiddenElements.favorite_button) {
      return html``;
    }
    const favorite = this.favorite;
    const label = this.renderLabel(
      "player.controls.favorite",
      this.layoutConfig.icons.favorite,
    ) as string | undefined;
    const no_label_class = label?.length ? `` : `no-label`;
    const active_class = favorite ? `active` : ``;
    const _icon = favorite ? this.Icons.HEART_ALT : this.Icons.HEART_PLUS;

    const icon_html = this.renderLowerIcon(
      _icon,
      `icons favorite lower ${active_class}`,
      label,
    );
    return html`
      <mpc-button
        .onPressService=${this.onFavorite}
        .onHoldService=${this.onFavoriteHold}
        role="variant"
        size="medium"
        selectable
        ?selected=${favorite}
        elevation=${favorite ? 2 : 1}
        id="button-favorite"
        class="mpc-button lower ${active_class} ${no_label_class}"
      >
        ${icon_html} ${label}
      </mpc-button>
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
    const all_hidden =
      h.power_button &&
      h.shuffle_button &&
      h.repeat_button &&
      h.favorite_button;
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
        href="https://cdn.jsdelivr.net/npm/beercss@4.0.20/dist/cdn/beer.min.css"
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
    const slot_attribute = _label?.length ? literal`slot="start"` : ``;
    return html`
      <ha-svg-icon
        ${slot_attribute}
        .path=${path}
        class="${_class}"
      ></ha-svg-icon>
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
