import {
  html,
  LitElement,
  PropertyValues
} from "lit";

import styles from '../styles/section-header';
import { consume } from "@lit/context";
import { useExpressiveContext } from "../const/context.js";

class MassSectionHeader extends LitElement {
  @consume({ context: useExpressiveContext, subscribe: true })
  private useExpressive!: boolean;
  private _initialUpdate = false;

  protected render() {
    return html`
      <div
        id="header"
        class="${this.useExpressive ? `header-expressive` : `header`}"
        part="header"
      >
        <slot name="start" part="start" class="start"></slot>
        <slot name="label" part="label" class="label"></slot>
        <slot name="end" part="end" class="end"></slot>
      </div>
    `
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return !this._initialUpdate || _changedProperties.size > 0;
  }
  protected firstUpdated(): void {
    this._initialUpdate = true;
  }
  static get styles() {
    return styles;
  }

}

customElements.define('mass-section-header', MassSectionHeader);
