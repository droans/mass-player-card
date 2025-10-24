import { css } from 'lit';
export default css`
  :host {
    --me-menu-background-color: var(--md-sys-color-secondary-container);
    --me-menu-text-color: var(--md-sys-color-on-secondary-container);
    --mass-menu-selected-background-color: var(--md-sys-color-secondary);
    --mass-menu-selected-text-color: var(--md-sys-color-on-secondary);
  }
  .menu-expressive {
  --mdc-theme-text-primary-on-background: var(--me-menu-text-color);
  --mdc-theme-text-icon-on-background: var(--me-menu-text-color);
  --mdc-theme-surface: var(--me-menu-background-color);
  --mdc-shape-medium: var(--menu-border-radius);
  --mdc-list-vertical-padding: 0px;
  }
  .svg-menu {
    color: var(--md-sys-color-primary);
  }
  .inactive-item {
    background-color: var(--mdc-theme-surface);
  }
  .selected-item {
    --mdc-theme-text-icon-on-background: var(--mdc-theme-on-primary);
    --mdc-theme-text-primary-on-background: var(--mdc-theme-on-primary);
    background-color: var(--mdc-theme-primary);
  }
  .selected-item-expressive {
    --mdc-theme-text-icon-on-background: var(--mass-menu-selected-text-color);
    --mdc-theme-text-primary-on-background: var(--mass-menu-selected-text-color);
    background-color: var(--mass-menu-selected-background-color);
    border-radius: var(--menu-selected-item-border-radius);
  }
  .svg-menu-expressive {
    color: var(--md-sys-color-on-background);
  }
`