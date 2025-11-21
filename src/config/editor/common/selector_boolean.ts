import { consume } from "@lit/context";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ExtendedHass, hassExt } from "../../../const/context.js";

@customElement('mass-config-bool-selector')
class BooleanSelector extends LitElement {
  @property({ attribute: 'label' }) label!: string;
  @property({ attribute: false }) path!: string | number;
  @property({ attribute: false }) value = false;
  @property({ attribute: 'required' }) required = false;
  @property() valueChangedFunction!: (ev: Event, path: string | number) => void;
  @consume({ context: hassExt, subscribe: true}) hass!: ExtendedHass

  private onValueChanged = (ev: Event) => {
    ev.stopPropagation();
    this.valueChangedFunction(ev, this.path);
  }
  protected render(): TemplateResult {
    return html`
      <ha-selector
        .hass=${this.hass}
        .selector=${{ boolean: {}}}
        .label=${this.label}
        .value=${this.value}
        .required=${this.required}
        @value-changed=${this.onValueChanged}
      ></ha-selector>
    `
  }
}
