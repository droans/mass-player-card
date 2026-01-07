import { css } from "lit";
export default css`
  :host {
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
  .menu-expressive {
    --mdc-theme-text-primary-on-background: var(
      --mass-menu-text-color-expressive
    );
    --mdc-theme-text-icon-on-background: var(--mass-menu-icon-color-expressive);
    --mdc-theme-surface: var(--mass-menu-background-color-expressive);
    --mdc-shape-medium: var(--menu-border-radius);
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
  .svg-expressive {
    margin-left: 14px;
  }
  .svg-menu-expressive {
    color: var(--md-sys-color-on-secondary-container);
  }
  .title-md,
  .title,
  .menu-list-item-image,
  .menu-list-item-svg {
    touch-action: none;
  }
`;
