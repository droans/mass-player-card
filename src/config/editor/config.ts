import { fireEvent, LovelaceCardEditor } from "custom-card-helpers";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Config, processConfig } from "../config.js";
import { ExtendedHass } from "../../const/common.js";
import './entities'

interface _LovelaceCardEditor extends Omit<LovelaceCardEditor, 'setConfig'> {
  setConfig(config: Config): void;
}

@customElement('mass-card-config-editor')
class MassCardConfigEditor extends LitElement implements _LovelaceCardEditor {
  @state() _config!: Config;
  @property({ attribute: false }) hass?: ExtendedHass;

  public setConfig(config: Config): void {
    this._config = processConfig(config);
    console.log(this._config);
  }
  private onConfigUpdate = (ev: Event) => {
    console.log(`Got event`);
    console.log(ev);
    console.log(this._config);
    fireEvent(this, 'config-changed', { config: this._config})
  }
  
  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``
    };
    return html`
      <mass-config-entities-editor
        .entitiesConfig=${this._config.entities}
        .host=${this}
        .hass=${this.hass}
      ></mass-config-entities-editor>
    `
  }

  protected firstUpdated(): void {
    this.addEventListener('mass-card-config', this.onConfigUpdate)
  }

}