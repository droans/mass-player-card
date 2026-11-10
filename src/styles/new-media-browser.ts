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
  #subsection-buttons {
    margin-inline: 8px;
    overflow-x: scroll;
    padding-bottom: 8px;
    scrollbar-width: none;
  }
`;
