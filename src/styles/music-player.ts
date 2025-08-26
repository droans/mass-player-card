import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  .hoverable:focus,
  .hoverable:hover {
    color: var(--accent-color);
  }

  .hoverable:active {
    color: var(--primary-color);
  }

  .container {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 'min-content' 'min-content' 'auto' 'min-content';
    grid-template-areas:
      'header'
      'progress'
      'artwork'
      'controls';
    min-height: 100%;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }

  .header {
    grid-area: header;
    margin: 0.75rem 3.25rem;
    padding: 0.5rem;
    text-align: center;
  }
  .player-name {
    font-size: 0.8rem;
    color: var(--player-name-color);
  }
  .player-track-title {
    font-size: 1.5rem;
    color: var(--player-track-color);
  }
  .player-track-artist {
  }
  .progress {
    padding-left: 36px;
    padding-right: 36px;
    padding-bottom: 8px;
  }
  .time {
    justify-self: center;
    padding-bottom: 4px;
  }
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
    flex-direction: column;
    align-items: start;
    justify-content: center;
  }
  .volume {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
  }
  .player-controls {
    width: var(--player-control-icon-width);
    height: var(--player-control-icon-width);
  }
  .track-previous {
    margin: 0px 0px 4px 0px;
    width: 100%;
  }
  .track-next {
    margin: 0px 0px 4px 0px;
    width: 100%;
  }
  .play-pause {
    --ha-button-height: var(--player-play-pause-icon-size);
    margin: 0px 6px 0px 6px;
    --ha-button-border-radius: 50%;
  }
  .shuffle {
  }
  .repeat {
  }
  .artwork {
    grid-area: artwork;
    align-self: center;
    flex-grow: 1;
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    min-height: 5rem;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
  }

  *[hide] {
    display: none;
  }

  *[background] {
    background-color: rgba(var(--rgb-card-background-color), 0.9);
    border-radius: 10px;
  }
`;