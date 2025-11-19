import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import styles from '../styles/button'
import { property } from "lit/decorators.js";
import { ButtonColorRole } from "../const/common.js";
import { consume } from "@lit/context";
import { configContext } from "../const/context.js";
import { Config } from "../config/config.js";

const DEFAULT_COLOR_ROLE = ButtonColorRole.Filled;
const DEFAULT_BUTTON_SIZE = "small"

const BUTTON_ROLE_MAP: Record<ButtonColorRole, string> = {
  filled: "accent",
  "filled-variant": "filled",
  plain: 'plain',
  standard: "plain",
  tonal: "filled",
  variant: "accent"
}

class MassButton extends LitElement {
  @property({ attribute: false }) onPressService!: (ev: Event) => void;
  @property( { attribute: 'role', type: String }) colorRole: ButtonColorRole = DEFAULT_COLOR_ROLE;
  @property( { attribute: 'size', type: String }) size: "small" | "medium" | "large" = DEFAULT_BUTTON_SIZE;
  @property( { attribute: 'disabled', type: Boolean  }) disabled = false;
  @property( { attribute: 'selected', type: Boolean  }) selected = false;
  @property( { attribute: 'selectable', type: Boolean  }) selectable = false;
  @property( { attribute: 'elevation', type: Number }) elevation = 0;
  @property( { attribute: 'outlined', type: Boolean }) outlined = false;
  @consume( { context: configContext, subscribe: true }) config!: Config;

  private onPress = (ev: Event) => {
    this.onPressService(ev);
  }

  protected render(): TemplateResult {
    const expressive = this.config.expressive ? `expressive` : ``
    const elevation = `elevation-${this.elevation.toString()}`;
    const disabled = this.disabled ? `disabled` : ``;
    const outlined = this.outlined ? `outlined` : ``;
    const selected = !this.selected && this.selectable ? `unselected` : this.selected ? `selected` : ``;
    return html`
      <ha-button
        appearance="${BUTTON_ROLE_MAP[this.colorRole]}"
        @click=${this.onPress}
        size="${this.size}"
        class="${this.colorRole} ${this.size} ${expressive} ${elevation} ${disabled} ${outlined} ${selected}"
        part="button"
      >
        <slot name="start" slot="start"></slot>
        <slot name="end" slot="end"></slot>
        <slot></slot>
      </ha-button>
    `
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define("mass-player-card-button", MassButton);