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
    grid-template-rows: 'min-content' 'min-content' 'auto' 'min-content';
    grid-template-areas:
      'header'
      'progress'
      'artwork'
      'controls';
  }
  .header {
    grid-area: header;
    margin: 0.75em 1.75em 0em 1.75em;
    text-align: center;
    overflow: hidden;
    height: 5.25em;
  }
  .player-name {
    font-size: 0.8rem;
    color: var(--player-name-color);
  }
  .player-track-title {
    font-size: 1.5rem;
    color: var(--player-track-color);
    white-space: nowrap;
    text-overflow: clip;
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
    padding-left: 2em;
    padding-right: 2em;
  }
  ha-control-slider {
    --control-slider-thickness: 1.75em;
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
    border-radius: 50%;
    box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.16);
  }
  .shuffle {
  }
  .repeat {
  }
  .artwork {
    background-size: 100%;
    height: 300px;
    width: 300px;
    justify-self: center;
    border-radius: 36px;
    background-repeat: no-repeat;
  }
  *[hide] {
    display: none;
  }

  *[background] {
    background-color: rgba(var(--rgb-card-background-color), 0.9);
    border-radius: 10px;
  }
  .marquee {
    animation: marquee var(--marquee-time) linear infinite;
    position: relative;
  }
  @keyframes marquee {
    0% {
      left: 0px;
    }
    25% {
      left: 0px;
    }
    75% {
      left: var(--marquee-left-offset);
    }
    100% {
      left: var(--marquee-left-offset);
    }
  }
`;