import { consume } from "@lit/context";
import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ExtendedHass, hassExt } from "../../../const/context.js";

@customElement('mass-config-number-selector')
class NumberSelector extends LitElement {
  @property({ attribute: 'label' }) label!: string;
  @property({ attribute: false }) path!: string | number;
  @property({ attribute: false }) value = 0;
  @property({ attribute: 'min-val'}) minVal = 0;
  @property({ attribute: 'max-val'}) maxVal = 100;
  @property({ attribute: 'step' }) step = 1;
  @property({ attribute: 'unit' }) unit = '';
  @property({ attribute: 'mode' }) mode: "slider" | "box" = "slider";
  @property({ attribute: 'required' }) required = false;
  @property() valueChangedFunction!: (ev: Event, path: string | number) => void;
  @consume({ context: hassExt, subscribe: true}) hass!: ExtendedHass

  private onValueChanged = (ev: Event) => {
    ev.stopPropagation();
    this.valueChangedFunction(ev, this.path);
  }
  protected render(): TemplateResult {
    const selector = {
      number:{
        min: this.minVal,
        max: this.maxVal,
        step: this.step,
        mode: this.mode,
        unit_of_measurement: this.unit
      }
    }
    return html`
      <ha-selector
        .hass=${this.hass}
        .selector=${selector}
        .label=${this.label}
        .value=${this.value}
        .required=${this.required}
        @value-changed=${this.onValueChanged}
      ></ha-selector>
    `
  }
}
