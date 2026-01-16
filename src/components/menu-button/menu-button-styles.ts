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
  }
  :host {
    border-radius: var(--used-border-radius);
  }
  :host([elevation="0"]) {
    --button-elevation: var(--md-sys-elevation-level0);
    --hover-button-elevation: var(--md-sys-elevation-level1);
  }
  :host([elevation="1"]) {
    --button-elevation: var(--md-sys-elevation-level1);
    --hover-button-elevation: var(--md-sys-elevation-level2);
  }
  :host([elevation="2"]) {
    --button-elevation: var(--md-sys-elevation-level2);
    --hover-button-elevation: var(--md-sys-elevation-level3);
  }
  :host([elevation="3"]) {
    --button-elevation: var(--md-sys-elevation-level3);
    --hover-button-elevation: var(--md-sys-elevation-level4);
  }
  :host([elevation="4"]) {
    --button-elevation: var(--md-sys-elevation-level4);
    --hover-button-elevation: var(--md-sys-elevation-level5);
  }
  :host([elevation="5"]) {
    --button-elevation: var(--md-sys-elevation-level5);
    --hover-button-elevation: var(--md-sys-elevation-level5);
  }

  :host([elevation]:not(hover)),
  #menu-button:not(hover) {
    animation: elevate-hover-off var(--animation-duration) linear forwards;
  }

  :host([elevation]:hover),
  #menu-button:hover {
    animation: elevate-hover var(--animation-duration) linear forwards;
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
  mpc-menu-item {
    height: 100%;
    width: 100%;
    display: block;
    border: none;
  }
  mpc-menu-item:first-of-type {
    margin-top: 10px;
  }
  mpc-menu-item:last-of-type {
    margin-bottom: 10px;
  }
  #menu-button {
    border-radius: var(--used-border-radius);
  }
  .menu-expressive {
    --mdc-theme-text-primary-on-background: var(
      --mass-menu-text-color-expressive
    );
    --mdc-theme-text-icon-on-background: var(--mass-menu-icon-color-expressive);
    --mdc-theme-surface: var(--mass-menu-background-color-expressive);
    --mdc-shape-medium: var(--default-border-radius);
    --mdc-list-vertical-padding: 0px;
  }
  .menu-expressive.vibrant {
    --mdc-theme-text-primary-on-background: var(
      --mass-menu-text-color-expressive-vibrant
    );
    --mdc-theme-text-icon-on-background: var(
      --mass-menu-icon-color-expressive-vibrant
    );
    --mdc-theme-surface: var(--mass-menu-background-color-expressive-vibrant);
  }
  #menu-select-menu {
    --control-select-menu-padding: unset;
    --ha-ripple-hover-opacity: 0%;
    --ha-ripple-pressed-opacity: 0%;
    border-radius: var(--used-border-radius);
  }
  .svg-menu {
    border-radius: var(--used-border-radius);
  }
  .svg-menu:not(.expressive) {
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

  @keyframes elevate-hover {
    from {
      box-shadow: var(--button-elevation);
    }
    to {
      box-shadow: var(--hover-button-elevation);
    }
  }
  @keyframes elevate-hover-off {
    from {
      box-shadow: var(--hover-button-elevation);
    }
    to {
      box-shadow: var(--button-elevation);
    }
  }
`;
