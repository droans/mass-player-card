import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  :host {
    width: 100%;
  }
  :host([direction="horizontal"]) #cards {
    overflow-x: scroll;
    scrollbar-width: none;
    row-gap: 8px;
  }
  :host([direction="vertical"]) #cards {
    overflow-y: scroll;
    scrollbar-width: none;
    row-gap: 8px;
    justify-content: center;
    display: flex;
    flex-flow: wrap;
    columns: 2;
  }
  :host([direction="horizontal"]) mpc-browser-media-card {
    height: 8em;
    width: 8em;
  }
  :host([direction="vertical"]) mpc-browser-media-card {
    width: 48%;
  }
  mpc-browser-media-card {
    max-height: 100%;
    aspect-ratio: 1;
    width: 100%;
    justify-content: center;
  }
  #drill-button {
    margin-top: 2px;
  }
  .icons {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
    row-gap: 20px;
    overflow-y: scroll;
    max-height: calc(
      var(--mass-player-card-height) - var(--navbar-height) - 8px
    );
    scrollbar-width: none;
    padding-bottom: 8px;
    padding-top: 8px;
  }
  .loading-indicator {
    background-color: var(--md-sys-color-primary);
    justify-self: center;
    top: 2em;
  }
  #cards {
    display: flex;
    column-gap: 8px;
    padding-bottom: 8px;
  }
  #title {
    font-size: 1.5em;
    font-weight: 600;
    font-variation-settings: "ROND" 100;
    width: 100%;
    line-height: 1.5em;
  }
  #title-div {
    display: flex;
    width: 100%;
  }
`;
