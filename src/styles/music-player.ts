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
    grid-template-rows: min-content auto min-content;
    grid-template-areas:
      'header'
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
  }
  .player-name {
  }
  .player-track-title {
  }
  .player-track-album {
  }
  .player-track-artist {
  }

  .controls {
    grid-area: controls;
    overflow-y: auto;
    margin: 0.25rem;
    padding: 0.5rem;
  }
  .primary-controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
  }
  .secondary-controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
  }
  .player-controls {
    width: var(--player-control-icon-width);
    height: var(--player-control-icon-width);
  }
  .play-pause {
    width: var(--play-pause-icon-width);
    height: var(--play-pause-icon-width);
    transform: scale(1.5);
    border-radius: 50%;
    background: var(--player-play-pause-color);
    box-shadow: var(--ha-card-box-shadow,none);
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