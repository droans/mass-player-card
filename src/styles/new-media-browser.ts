import { css } from "lit";

export default css`
  .browser-card-section {
    padding-inline: 8px;
  }
  .browser-card-section.search {
    padding-top: 1rem;
  }
  .button-group.chips {
    padding-top: 8px;
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
  .collection-view {
    height: 100%;
  }
  #container {
    box-shadow: unset;
    overflow: hidden;
    height: var(--mass-player-card-height);
    border-radius: var(--expressive-border-radius-container);
    display: flex;
    flex-direction: column;
  }
  #mass-browser {
    overflow-y: scroll;
    scrollbar-width: none;
    background-color: var(--md-sys-color-background, var(--ha-card-background));
    height: 100%;
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
  .search-library-button .svg.menu {
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
