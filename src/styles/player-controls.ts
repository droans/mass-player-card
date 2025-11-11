import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  .controls {
    grid-area: controls;
    overflow-y: auto;
    margin: 0.25rem;
    padding: 0.5rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .controls-left {
    display: flex;
    flex-direction: column;
    align-items: end;
    justify-content: center;
  }
  .controls-right {
    display: flex;
    align-items: start;
    justify-content: center;
  }

  .controls-compact {
    flex-direction: column;
  }
  .controls-spaced {
    flex-direction: row;
    gap: 1em;
    margin-left: 1em;
    margin-right: 1em;
  }

  .controls-previous-next::part(base) {
    height: 30px;
    width: 60px;
  }

  .div-medium {
    --ha-button-height: var(--player-play-pause-icon-size);
    margin: 0px 6px 0px 6px;
    --ha-button-border-radius: 50%;
    border-radius: 50%;
  }

  .div-spaced {
    align-self: center;
  }

  .has-box-shadow::part(base) {
    box-shadow: rgba(0, 0, 0, 0.16) 0px 2px 4px 0px;
  }

  .icon-medium {
  }
  .icon-small {
  }

  .icon-accent {
  }
  .icon-accent::part(base) {
    background-color: var(--md-sys-color-primary);
  }
  .icon-accent::part(label) {
    color: var(--md-sys-color-on-primary);
  }

  .icon-filled {
  }

  .icon-outlined {
  }
  .icon-outlined::part(label) {
  }

  .icon-plain {
  }

  .player-controls {
    width: var(--player-control-icon-width);
    height: var(--player-control-icon-width);
  }

  .svg-medium {
    height: 4em;
    width: 4em;
  }
  .svg-small {
    height: 2em;
    width: 2em;
  }
`;
