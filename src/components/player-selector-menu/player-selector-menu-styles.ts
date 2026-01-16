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
  }
  .menu-header.expressive::part(menu-select-menu) {
    --control-select-menu-background-color: var(
      --md-sys-color-secondary-container
    ) !important;
  }
  .menu-header.expressive::part(menu-svg) {
    color: var(--md-sys-color-secondary-on-container) !important;
  }
  .menu-header:not(.expressive)::part(menu-select-menu) {
    background-color: var(--control-select-menu-background-color);
  }
  .menu-header::part(menu-svg):not(.expressive) {
    color: var(--wa-color-brand-on-normal, var(--wa-color-neutral-on-normal));
    border-radius: 50%;
  }
`;
