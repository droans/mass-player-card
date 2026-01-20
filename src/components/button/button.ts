import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import styles from "./button-styles";
import { property } from "lit/decorators.js";
import { ButtonColorRole } from "../../const/enums";
import { consume } from "@lit/context";
import { configContext } from "../../const/context";
import { Config } from "../../config/config";

const DEFAULT_COLOR_ROLE = ButtonColorRole.Filled;
const DEFAULT_BUTTON_SIZE = "small";

const BUTTON_ROLE_MAP: Record<ButtonColorRole, string> = {
  filled: "accent",
  "filled-variant": "filled",
  plain: "plain",
  standard: "plain",
  tonal: "filled",
  variant: "accent",
};

class MassButton extends LitElement {
  @property({ attribute: false }) onPressService!: (event_: Event) => void;
  @property({ attribute: "role", type: String }) colorRole: ButtonColorRole =
    DEFAULT_COLOR_ROLE;
  @property({ attribute: "size", type: String }) size:
    | "small"
    | "medium"
    | "large" = DEFAULT_BUTTON_SIZE;
  @property({ attribute: "disabled", type: Boolean }) disabled = false;
  @property({ attribute: "selected", type: Boolean }) selected = false;
  @property({ attribute: "selectable", type: Boolean }) selectable = false;
  @property({ attribute: "elevation", type: Number }) elevation = 0;
  @property({ attribute: "outlined", type: Boolean }) outlined = false;
  @property({ attribute: false }) private onHoldService?: (
    event_: Event,
  ) => void;
  @property({ attribute: "hold-delay", type: Number }) holdDelayMs = 1000;
  private timeout!: number | undefined;

  @consume({ context: configContext, subscribe: true }) config!: Config;

  private onHold = (event_: Event) => {
    const function_ = this.onHoldService ?? this.onPressService;
    function_(event_);
  };
  private onPointerUp = (event_: Event) => {
    if (this.timeout || !this.onHoldService) {
      clearTimeout(this.timeout);
      this.onPressService(event_);
      this.timeout = undefined;
    }
  };
  private onPointerDown = (event_: Event) => {
    if (!this.onHoldService) {
      return;
    }
    this.timeout = window.setTimeout(() => {
      if (!this.timeout) {
        return;
      }
      this.timeout = undefined;
      this.onHold(event_);
    }, this.holdDelayMs);
  };

  protected render(): TemplateResult {
    const expressive = this.config.expressive ? `expressive` : ``;
    const elevation = `elevation-${this.elevation.toString()}`;
    const disabled = this.disabled ? `disabled` : ``;
    const outlined = this.outlined ? `outlined` : ``;
    /* eslint-disable prettier/prettier */
    const selected =
      !this.selected && this.selectable
        ? `unselected`
        : (this.selected
          ? `selected`
          : ``);
    /* eslint-enable prettier/prettier */
    return html`
      <ha-button
        appearance="${BUTTON_ROLE_MAP[this.colorRole]}"
        @pointerdown=${this.onPointerDown}
        @pointerup=${this.onPointerUp}
        size="${this.size}"
        class="${this.colorRole} ${this
          .size} ${expressive} ${elevation} ${disabled} ${outlined} ${selected}"
        part="button"
      >
        <slot name="start" slot="start"></slot>
        <slot name="end" slot="end"></slot>
        <slot></slot>
      </ha-button>
    `;
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define("mass-player-card-button", MassButton);
