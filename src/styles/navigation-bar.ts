import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  a.active {
    --primary-container: var(--tab-active-indicator-color);
  }
  a.active-expressive {
    box-shadow: var(--md-sys-elevation-level2);
  }

  .action-button-svg {
    --icon-primary-color: var(--tab-active-icon-color);
    height: var(--tab-icon-height);
    width: var(--tab-icon-height);
  }
  .action-button-svg-inactive {
    --icon-primary-color: var(--tab-inactive-icon-color);
    height: var(--tab-icon-height);
    width: var(--tab-icon-height);
  }

  .icon-i {
    height: 100%;
    width: 100%;
  }

  nav.tabbed {
    background-color: var(--tabbed-background-color);
    box-shadow: var(--tabbed-elevation);
  }

  .player-tabs {
    --primary-container: rgba(from var(--primary-color) r g b / 0.25);
  }

  .tabbed {
    --tabbed-elevation: var(--md-sys-elevation-level1);
    --tabbed-background-color: var(--tabbed-background-color);
    --tab-active-icon-color: var(--md-sys-color-on-secondary-container);
    --tab-active-indicator-color: var(--md-sys-color-secondary-container);
    --tab-inactive-icon-color: var(--md-sys-color-on-primary-container);
    --tab-icon-height: 24px;
  }
  .tabbed-expressive {
    --tabbed-background-color: var(--md-sys-color-surface-container) !important;
  }
`;
