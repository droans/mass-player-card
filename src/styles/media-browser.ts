import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  ha-card {
    box-shadow: unset;
    height: var(--mass-player-card-height);
  }
  #title {
    text-indent: var(--title-indent);
    text-transform: capitalize;
  }
  #search-input {
    height: 40px;
    position: relative;
    width: calc(100% - 5em);
    z-index: 2;
  }
  #search-media-type-menu {
    display: inline-block;
  }
  #search-media-type-menu::part(menu-button) {
  }
  #search-media-type-menu::part(menu-select-menu) {
    --mdc-icon-size: 1.5em;
    --control-select-menu-padding: 0px;
    --control-select-menu-background-color: unset;
  }
  #search-media-type-menu::part(menu-svg) {
    color: var(--mdc-theme-primary);
    border-radius: 50%;
  }
  #search-media-type-menu::part(menu-list-item) {
  }
  #search-media-type-menu::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
`;