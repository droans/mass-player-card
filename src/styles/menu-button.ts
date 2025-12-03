import { css } from "lit";
export default css`
  :host {
    --mass-menu-background-color-expressive: var(--md-sys-color-surface);
    --mass-menu-text-color-expressive: var(--md-sys-color-on-surface);
    --mass-menu-icon-color-expressive: var(--md-sys-color-on-surface-variant);
    --mass-menu-item-active-color-expressive: var(--md-sys-color-secondary-container);
    --mass-menu-item-active-text-color-expressive: var(--md-sys-color-on-secondary-container);
    --mass-menu-item-active-icon-color-expressive: var(--md-sys-color-on-surface);

    --mdc-list-side-padding-left: var(--menu-item-padding-left);
  }
  .divider {
    margin-top: 2px;
    margin-bottom: 2px;
  }
  .divider::before {
    content: " ";
    display: block;
    height: 1px;
    background-color: var(--divider-color);
    margin-left: 24px;
    margin-right: 24px;
  }
  ha-list-item:first-of-type {
    margin-top: 10px
  }
  ha-list-item:last-of-type {
    margin-bottom: 10px
  }
  .menu-expressive {
    --mdc-theme-text-primary-on-background: var(--mass-menu-text-color-expressive);
    --mdc-theme-text-icon-on-background: var(--mass-menu-icon-color-expressive);
    --mdc-theme-surface: var(--mass-menu-background-color-expressive);
    --mdc-shape-medium: var(--menu-border-radius);
    --mdc-list-vertical-padding: 0px;
  }
  .svg-menu {
    color: var(--md-sys-color-primary);
  }
  .inactive-item {
    background-color: var(--mdc-theme-surface);
  }
  .inactive-item-expressive {
    border-radius: var(--default-border-radius);
    --md-ripple-hover-color: var(--md-sys-color-on-surface);
    --md-ripple-pressed-color: var(--md-sys-color-on-surface);
  }
  .selected-item {
    --mdc-theme-text-icon-on-background: var(--mdc-theme-on-primary);
    --mdc-theme-text-primary-on-background: var(--mdc-theme-on-primary);
    background-color: var(--mdc-theme-primary);
  }
  .selected-item-expressive {
    --mdc-theme-text-icon-on-background: var(--mass-menu-item-active-icon-color-expressive);
    --mdc-theme-text-primary-on-background: var(--mass-menu-item-active-text-color-expressive);
    background-color: var(--mass-menu-item-active-color-expressive);
    border-radius: var(--default-border-radius);
    --md-ripple-hover-color: var(--md-sys-color-on-surface);
    --md-ripple-pressed-color: var(--md-sys-color-on-surface);
  }
  .svg-expressive {
    margin-left: 14px;
  }
  .svg-menu-expressive {
    color: var(--md-sys-color-on-secondary-container);
  }
`;
