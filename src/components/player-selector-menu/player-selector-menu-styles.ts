import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  #players-select-menu::part(menu-list-item) {
    height: 3.5em;
  }
  #players-select-menu::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
  .menu-header {
    --menu-button-border-radius: 50%;
  }
  .menu-header::part(menu-select-menu) {
    height: 2.5em;
    width: 2.5em;
    --control-select-menu-padding: 7px;
    --mdc-icon-size: 1.5em;
    --control-select-menu-height: 2.5em;
    --control-select-menu-background-color: var(
      --md-sys-color-surface-container-low
    ) !important;
    background-color: var(--control-select-menu-background-color);
  }
  .menu-header::part(menu-select-menu) {
  }
  .menu-header::part(menu-svg) {
    color: var(--md-sys-color-on-primary);
  }
  #trigger-button {
    --used-button-border-radius: 1.5rem;
    --button-padding-left: 16px;
    --button-padding-right: 12px;
    --button-button-height: 3rem;
  }
  #trigger-icon-player {
    --mdc-icon-size: 2rem;
  }
`;
