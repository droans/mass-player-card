import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  .button-min::part(button) {
    --button-button-height: 35px;
    --button-button-width: 35px;
    --button-padding: 0px;
  }
  .filter-menu-expressive::part(menu-select-menu) {
    box-shadow: var(--md-sys-elevation-level1);
    border-radius: var(--button-small-border-radius) !important;
  }
  .button-expressive .header-icon,
  .filter-menu-expressive::part(menu-svg),
  .menu-expressive::part(menu-svg) {
    color: var(--md-sys-color-on-primary);
  }

  #container {
    box-shadow: unset;
    height: var(--mass-player-card-height);
  }
  .container-expressive {
    border-radius: var(--expressive-border-radius-container);
    background-color: var(--expressive-color-container);
  }
  #filter-menu::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
  #filter-menu::part(menu-select-menu) {
    --mdc-icon-size: 1.5em;
    --control-select-menu-padding: 0px;
    --control-select-menu-height: 35px;
    width: 35px;
  }
  #filter-menu::part(menu-svg) {
    height: 30px;
    width: 30px;
    position: absolute;
    top: 2.5px;
    left: 2.5px;
  }
  #filter-menu:not(.filter-menu-expressive)::part(menu-select-menu) {
    --control-select-menu-background-color: var(
      --md-sys-color-secondary-container
    );
    background-color: var(--md-sys-color-secondary-container);
    border-radius: 12px;
  }
  #filter-menu.filter-menu-expressive::part(menu-select-menu) {
    --control-select-menu-background-color: unset;
    background-color: var(--md-sys-color-primary);
  }

  #header-buttons-end {
    display: flex;
    gap: 8px;
  }

  .header-icon {
    height: 2rem;
    width: 2rem;
  }

  #mass-browser {
    padding-top: 8px;
  }
  .mass-browser-expressive {
    background-color: var(--md-sys-color-background, var(--ha-card-background));
    height: calc(100% - 3em);
    border-radius: var(--expressive-border-radius-container);
  }
  sl-input::part(base) {
    background-color: var(--md-sys-color-surface-container-high);
  }
  sl-input::part(input)::placeholder {
    color: var(--md-sys-color-on-surface);
  }
  #search::part(end) {
    width: calc(100% - 3em - 40px);
  }
  #search-favorite-button::part(button) {
    --button-button-width: 36px;
    vertical-align: top;
  }
  #search-input {
    height: 40px;
    position: relative;
    width: calc(100% - 5em);
    z-index: 2;
  }
  #search-media-type-menu::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
  #search-media-type-menu::part(menu-select-menu) {
    --mdc-icon-size: 1.5em;
    --control-select-menu-padding: 0px;
    --control-select-menu-background-color: unset;
    height: 35px;
    width: 35px;
  }
  #search-media-type-menu::part(menu-svg) {
    height: 30px;
    width: 30px;
    position: absolute;
    top: 2.5px;
    left: 2.5px;
  }
  .search-media-type-menu-expressive::part(menu-svg),
  .search-library-button-expressive .svg-menu-expressive {
    color: var(--md-sys-color-on-surface-variant) !important;
  }
  #search-options {
    height: 35px;
    display: flex;
  }

  .svg-menu-expressive {
    color: var(--md-sys-color-primary);
  }
  .svg-xs {
    height: 30px;
    width: 30px;
  }

  #title {
    text-transform: capitalize;
  }
`;
