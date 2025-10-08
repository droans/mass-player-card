import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  #container {
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
    color: var(--md-sys-color-primary);
    border-radius: 50%;
  }
  #search-media-type-menu::part(menu-list-item) {
  }
  #search-media-type-menu::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
  #search::part(end) {
    width: calc(100% - 3em - 40px);
  }
  .button-min::part(base) {
    --wa-form-control-padding-inline: 0px;
  }
  .button-min {
    height: 40px;
    width: 40px;
    --wa-color-fill-quiet: rgba(from var(--md-sys-color-primary) r g b / 0.1);
  }
  .header-icon {
    height: 2rem;
    width: 2rem;
    color: var(--md-sys-color-primary);
  }
`;