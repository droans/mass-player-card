import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  .button-min,
  filter-menu::part(menu-button) {
    height: 35px;
    width: 35px;
    --wa-color-fill-quiet: rgba(from var(--md-sys-color-primary) r g b / 0.1);
    position: relative;
  }
  .button-min::part(base) {
    --wa-form-control-padding-inline: 0px;
    height: 35px;
    width: 35px;
  }
  .button-expressive::part(base) {
    background-color: var(--md-sys-color-secondary-container);
  }
  .button-expressive::part(base),
  .filter-menu-expressive::part(menu-select-menu) {
    box-shadow: var(--md-sys-elevation-level1);
    border-radius: var(--button-small-border-radius) !important;
  }
  .button-expressive .header-icon,
  .filter-menu-expressive::part(menu-svg),
  .menu-expressive::part(menu-svg) {
    color: var(--md-sys-color-on-primary);
  }
  #button-search::part(base), #button-back::part(base) {
    --inherited-background-color: var(--md-sys-color-primary);
  }

  #container {
    box-shadow: unset;
    height: var(--mass-player-card-height);
  }
  .container-expressive {
    border-radius: var(--expressive-border-radius-container);
    background-color: var(--expressive-color-container);
  }
  #filter-menu {
  }
  #filter-menu::part(menu-button) {
  }
  #filter-menu::part(menu-list-item) {
  }
  #filter-menu::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
  #filter-menu::part(menu-select-menu) {
    --mdc-icon-size: 1.5em;
    --control-select-menu-padding: 0px;
    --control-select-menu-background-color: unset;
    background-color: var(--md-sys-color-primary);
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
  #filter-menu-expressive::part(menu-select-menu) {
    --control-select-menu-background-color: var(
      --md-sys-color-secondary-container
    );
  }
  #filter-menu-expressive::part(menu-svg) {
    color: var(--md-sys-color-on-background);
  }

  #header-buttons-end {
    display: flex;
    gap: 8px;
  }

  .header-icon {
    height: 2rem;
    width: 2rem;
    color: var(--md-sys-color-on-secondary-container);
  }

  #mass-browser {
    padding-top: 8px;
  }
  .mass-browser-expressive {
    background-color: var(--md-sys-color-background);
    height: calc(100% - 3em);
    border-radius: var(--expressive-border-radius-container);
  }

  #search::part(end) {
    width: calc(100% - 3em - 40px);
  }
  #search-favorite-button::part(base) {
    width: 36px;
    vertical-align: top;
  }
  #search-input {
    height: 40px;
    position: relative;
    width: calc(100% - 5em);
    z-index: 2;
  }
  #search-media-type-menu {
  }
  #search-media-type-menu::part(menu-button) {
  }
  #search-media-type-menu::part(menu-list-item) {
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
  .search-media-type-menu-expressive::part(menu-svg), .search-library-button-expressive .svg-menu-expressive {
    color: var(--md-sys-color-on-primary) !important;
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
    text-indent: var(--title-indent);
    text-transform: capitalize;
  }
`;
