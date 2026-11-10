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
    display: block;
    height: auto;
  }
  :host([direction="vertical"]) #cards-virtualizer {
    width: 100%;
  }
  .cards-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 8px;
    width: 100%;
    padding-bottom: 8px;
  }
  :host([direction="horizontal"]) mpc-browser-media-card {
    height: 8em;
    width: 8em;
    --container-height: 8em;
    --container-width: 8em;
  }
  :host([direction="vertical"]) mpc-browser-media-card {
    display: block;
    width: 100%;
    height: auto;
    max-height: none;
    padding-inline: 0;
    --container-width: 100%;
    --container-height: 100%;
  }
  mpc-browser-media-card {
    max-height: 100%;
    aspect-ratio: 1;
    height: 100%;
    /* width: 100%; */
    justify-content: center;
    padding-inline: 4px;
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
    height: 8em;
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
