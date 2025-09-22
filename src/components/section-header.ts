import { html, LitElement } from "lit";

import styles from '../styles/section-header';

class MassSectionHeader extends LitElement {
  protected render() {
    return html`
      <div id="header" class="header">
        <slot name="start" part="start" class="start"></slot>
        <slot name="label" part="label" class="label"></slot>
        <slot name="end" part="end" class="end"></slot>
      </div>
    `
  }
  static get styles() {
    return styles;
  }

}

customElements.define('mass-section-header', MassSectionHeader);
