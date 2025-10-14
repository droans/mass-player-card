import { css } from 'lit';
export default css`
  :host {
    --me-menu-background-color: var(--md-sys-color-secondary-container);
    --me-menu-text-color: var(--md-sys-color-on-secondary-container);
  }
  .menu-expressive {
  --mdc-theme-text-primary-on-background: var(--me-menu-background-color);
  --mdc-theme-text-icon-on-background: var(--me-menu-text-color);
  }
  .svg-menu {
    color: var(--md-sys-color-primary);
    background-color: var(--ha-card-background,var(--card-background-color,#fff));
    border-radius: 50%;
  }
`