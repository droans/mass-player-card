import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  ha-card {
    box-shadow: unset;
    display: flex;
    position: relative;
  }
  ha-control-button {
    --section-thumbnail-size: calc(var(--mass-player-card-height) / 5);
    --thumbnail-size: calc(var(--mass-player-card-height) / 2.5 - 2em);
    width: 98%;
    height: 98%;
    margin: 1%;
  }
  #container {
    width: 100%;
    height: var(--thumbnail-size);
    position: relative;
  }

  #thumbnail-div {
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    margin: 0 6%;
    height: var(--thumbnail-size);
    width: var(--thumbnail-size);
    padding-bottom: 2em;
    padding-left: 1em;
    padding-right: 1em;
  }

  #title-div {
    font-size: 1.2rem;
    text-transform: capitalize;
    position: absolute;
    width: 100%;
    line-height: 160%;
    bottom: 0;
    background-color: rgba(from var(--ha-card-background) r g b / 0.9);
  }

  #enqueue-menu-control {
    --control-select-menu-background-color: unset;
    --ha-ripple-color: rgba(0,0,0,0);
    --mdc-icon-size: 5em;
    --control-select-menu-height: 6em;
  }
  #card-button-div {
    position: absolute;
    width: 100%;
    height: 100%;
    display: contents;
    top: 0;
    left: 0;
  }
  #enqueue-button-div {
    position: absolute;
    bottom: 1.5em;
    right: -0.75em;
  }
  #enqueue-list-item {
  }
  .enqueue-item-svg {
    height: 2em;
    width: 2em;
  }
  #enqueue-svg {
    color: var(--mdc-theme-primary);
  }
`;