import { css } from "lit";

export default css`
  .browser-card-section {
    padding-inline: 8px;
  }
  .button-group.chips {
    padding-top: 8px;
    padding-left: 8px;
    display: flex;
  }
  #button-search {
    color: var(--md-sys-color-on-primary);
  }
  #button-search::part(button) {
    --button-button-height: 35px;
    --button-button-width: 35px;
    --button-padding: 0px;
  }
  #container {
    box-shadow: unset;
    overflow: hidden;
    height: 100%;
    border-radius: var(--expressive-border-radius-container);
    background-color: var(--expressive-color-container);
  }
  .chip.button {
    --ha-button-start-border-radius: 16px;
    --ha-button-end-border-radius: 16px;
    --used-button-border-radius: 16px;
  }
  .chip-icon {
    padding-left: 8px;
  }
  .chip-title {
    padding-right: 8px;
  }
  #mass-browser {
    overflow-y: scroll;
    scrollbar-width: none;
    padding-bottom: 8em;
    background-color: var(--md-sys-color-background, var(--ha-card-background));
    height: calc(100% - 8em);
    border-radius: var(--expressive-border-radius-container);
  }
  sl-input::part(base) {
    background-color: var(--md-sys-color-surface-container-high);
  }
  sl-input::part(input)::placeholder {
    color: var(--search-placeholder-text-color);
  }
  sl-input::part(input) {
    color: var(--search-text-color);
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
  #search-media-type-menu {
    border-radius: var(--button-small-border-radius);
    height: 30px;
    width: 30px;
  }
  #search-media-type-menu::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
  #search-media-type-menu::part(menu-select-menu) {
    --mdc-icon-size: 1.5em;
    --control-select-menu-padding: 0px;
    --control-select-menu-background-color: unset;
    height: 30px;
    width: 30px;
  }
  #search-media-type-menu::part(menu-svg) {
    height: 30px;
    width: 30px;
  }
  .search-media-type-menu.expressive::part(menu-svg),
  .search-library-button.expressive .svg.menu.expressive {
    color: var(--md-sys-color-on-surface-variant) !important;
  }
  #search-options {
    height: 35px;
    display: flex;
  }

  #subsection-buttons {
    margin-inline: 8px;
    overflow-x: scroll;
    padding-bottom: 8px;
    scrollbar-width: none;
  }
`;
