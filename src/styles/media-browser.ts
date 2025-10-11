import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  .button-min {
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
    box-shadow: var(--md-sys-elevation-level1);
    border-radius: 12px;
    background-color: var(--md-sys-color-secondary-container);
  }
  
  #container {
    box-shadow: unset;
    height: var(--mass-player-card-height);
  }
  .container-expressive {
    border-radius: var(--expressive-border-radius-container);
    background-color: var(--expressive-color-container);
  }

  .header-icon {
    height: 2rem;
    width: 2rem;
    color: var(--md-sys-color-on-secondary-container);
  }

  .mass-browser {
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
  }
  #search-media-type-menu::part(menu-svg) {
    color: var(--md-sys-color-primary);
    border-radius: 50%;
  }
  #title {
    text-indent: var(--title-indent);
    text-transform: capitalize;
  }
`;