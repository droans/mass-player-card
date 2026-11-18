import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  mpc-player-artwork {
    display: flex;
    justify-content: center;
    justify-self: center;
    height: var(--artwork-height);
    aspect-ratio: 1;
    box-shadow: var(--md-sys-elevation-level4);
    border-radius: var(--artwork-border-radius);
  }
  button.hidden {
    background: unset;
    border: unset;
  }
  .active-track {
    margin-inline: 1.75rem;
    text-align: center;
    overflow: hidden;
    padding-top: 1rem;
  }
  .artwork {
    padding-top: 0.5rem;
  }
  .controls {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  #container {
    height: var(--mass-player-card-height);
    border-radius: var(--expressive-border-radius-container);
    display: flex;
    flex-direction: column;
  }
  #header {
    justify-self: center;
    padding-block: 8px;
    display: flex;
    width: 100%;
  }
  .menu-grouped {
    position: absolute;
    right: 1rem;
  }
  .menu-player {
    position: absolute;
    left: 1rem;
  }
  .menu-player-selector {
    justify-content: center;
    display: flex;
    width: 100%;
  }
  #player-card-header {
    width: 100%;
    z-index: 3;
    border-radius: var(--default-border-radius) var(--default-border-radius) 0px
      0px;
  }
  .player-track-artist {
    line-height: 1em;
    color: var(--md-sys-color-on-primary-container) !important;
    text-shadow: 0 0 var(--md-sys-color-on-primary-container);
    font-family: var(--expressive-font-family);
    font-style: italic;
    font-size: 1.5em;
    font-variation-settings: "ROND" 100;
    font-weight: 300;
    font-stretch: 50%;
  }
  .player-track-title {
    white-space: nowrap;
    text-overflow: clip;
    color: var(--md-sys-color-on-primary-container);
    text-shadow: 0px 0px var(--md-sys-color-primary);
    font-size: 2.5rem;
    font-weight: 500;
    font-stretch: 25%;
    font-style: italic;
    font-variation-settings: "ROND" 100;
    line-height: 1.3em;
    font-family: var(--expressive-font-family);
    margin-top: -0.2em;
  }
  #volume {
    flex: 1;
    align-content: end;
    padding-bottom: 1rem;
  }
`;
