import { css } from "lit";
export default css`
  :host {
    --default-border-radius: var(--control-select-menu-border-radius, 6px);
    --used-border-radius: var(
      --menu-button-border-radius,
      var(--default-border-radius)
    );
    --mass-menu-background-color-expressive: var(
      --md-sys-color-surface-container-low
    );
    --mass-menu-text-color-expressive: var(--md-sys-color-on-surface);
    --mass-menu-icon-color-expressive: var(--md-sys-color-on-surface-variant);

    --mass-menu-background-color-expressive-vibrant: var(
      --md-sys-color-tertiary-container
    );
    --mass-menu-text-color-expressive-vibrant: var(
      --md-sys-color-on-tertiary-container
    );
    --mass-menu-icon-color-expressive-vibrant: var(
      --md-sys-color-on-tertiary-container
    );
    --animation-duration: 0.25s;
    --button-border-radius: var(--used-border-radius);
  }
  :host([scheme="filled"]) {
    --menu-button-background-color: var(--md-sys-color-primary);
    --button-icon-color: var(--md-sys-color-on-primary);
  }
  :host([scheme="tonal"]) {
    --menu-button-background-color: var(--md-sys-color-secondary-container);
    --button-icon-color: var(--md-sys-color-on-secondary-container);
  }
  :host([scheme="standard"]) {
    --menu-button-background-color: unset;
    --button-icon-color: var(--md-sys-color-on-surface-variant);
  }
  :host([scheme="plain"]) {
    --menu-button-background-color: none;
    --button-icon-color: var(--md-sys-color-on-surface-variant);
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
  mpc-button::part(button) {
    --used-button-background-color: var(--menu-button-background-color);
  }
  #menu-button {
    border-radius: var(--used-border-radius);
  }
  .menu-expressive {
    --menu-background-color: var(--mass-menu-background-color-expressive);
    --mdc-shape-medium: var(--default-border-radius);
  }
  .menu-expressive::part(menu) {
    background-color: var(--menu-background-color);
    border-radius: 24px;
  }
  .menu-expressive.vibrant {
    --menu-background-color: var(
      --mass-menu-background-color-expressive-vibrant
    );
  }
  #menu-select-menu {
    border-radius: var(--used-border-radius);
  }
  mpc-menu-item {
    height: 100%;
    width: 100%;
    display: block;
    border: none;
  }
  mpc-menu-item:first-of-type {
    margin-top: 4px;
  }
  mpc-menu-item:last-of-type {
    margin-bottom: 4px;
  }
  .svg-menu {
    border-radius: var(--used-border-radius);
    --icon-primary-color: var(--button-icon-color);
  }
  .svg-menu:not(.expressive) {
    color: var(--md-sys-color-primary);
  }
  .inactive-item {
    background-color: var(--menu-background-color);
  }
  .inactive-item-expressive {
    border-radius: var(--default-border-radius);
  }
  .svg-expressive {
    margin-left: 14px;
  }
  .svg-menu.expressive {
    color: var(--md-sys-color-on-secondary-container);
  }
  .title-md,
  .title,
  .menu-list-item-image,
  .menu-list-item-svg {
    touch-action: none;
  }
`;
