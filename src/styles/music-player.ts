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
  .player-header {
    margin: 0em 1.75em 0em 1.75em;
    text-align: center;
    overflow: hidden;
    height: 5em;
  }
  #player-card {
    z-index: 1;
    height: calc(var(--mass-player-card-height) - 2em);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    position: relative;
  }
  #active-track-text {
    background: rgba(from var(--ha-card-background) r g b / 0.85);
    z-index: 1;
    position: relative;
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
    font-size: 1em;
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
  .media-controls {
    background: rgba(from var(--ha-card-background) r g b / 0.85);
    position: absolute;
    bottom: 0;
    width: 100%;
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
  .controls-previous-next::part(base) {
    height: 30px;
    width: 60px;
  }
  .button-play-pause::part(base) {
    box-shadow: rgba(0, 0, 0, 0.16) 0px 2px 4px 0px;
  }
  .player-controls {
    width: var(--player-control-icon-width);
    height: var(--player-control-icon-width);
  }
  .track-previous {
    margin: 0px 0px 4px 0px;
  }
  .track-next {
    margin: 0px 0px 4px 0px;
  }
  .play-pause {
    --ha-button-height: var(--player-play-pause-icon-size);
    margin: 0px 6px 0px 6px;
    --ha-button-border-radius: 50%;
    border-radius: 50%;
  }
  *[hide] {
    display: none;
  }

  *[background] {
    background-color: rgba(var(--rgb-card-background-color), 0.9);
    border-radius: 10px;
  }
  .marquee-pause-end {
    left: var(--marquee-left-offset);
    position: relative;
  }
  .marquee {
    animation: marquee var(--marquee-time) linear 2s;
    animation-iteration-count: infinite;
    position: relative;
  }
  #players-select-menu {
    --control-select-menu-height: 2.5em;
  }
  .players-select-item {
    height: 2.5em;
  }
  .players-select-item-icon {
    height: 2em;
    width: 2em;
    color: var(--mdc-theme-primary);
  }
  #grouped-players-menu {
    --control-select-menu-height: 2.5em;
    --control-select-thickness: 2.5em;
    max-width: var(--control-select-menu-height);
  }
  .grouped-players-item {
    height: calc(var(--control-select-menu-height) * 2);
    display: contents;
  }
  .grouped-players-select-item {
    height: 2.5em;
  }
  .grouped-players-select-item-icon {
    height: 2em;
    width: 2em;
    color: var(--mdc-theme-primary);
  }
  .grouped-players-volume-slider {
    display: contents;
  }
  .grouped-players-volume-slider::part(slider) {
    position: relative;
    width: 96%;
    left: 2%;
    height: 2.5em;
  }
  .divider {
    margin-top: 4px;
  }
  .divider::before {
    content: " ";
    display: block;
    height: 1px;
    background-color: var(--divider-color);
    margin-left: 8px;
    margin-right: 8px;
  }
  #players-select-menu::part(menu-button) {
    --ha-ripple-color: rgba(0,0,0,0);
  }
  #players-select-menu::part(menu-select-menu) {
    height: 2.5em;
    width: 2.5em;
    --control-select-menu-padding: 7px;
    --mdc-icon-size: 1.5em;
    --control-select-menu-height: 2.5em;
  }
  #players-select-menu::part(menu-svg) {
    color: var(--mdc-theme-primary);
    border-radius: 50%;
  }
  #players-select-menu::part(menu-list-item) {
  }
  #players-select-menu::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
  #grouped-players-menu::part(menu-button) {
    --ha-ripple-color: rgba(0,0,0,0);
  }
  #grouped-players-menu::part(menu-select-menu) {
    height: 2.5em;
    width: 2.5em;
    --control-select-menu-padding: 7px;
    --mdc-icon-size: 1.5em;
    --control-select-menu-height: 2.5em;
  }
  #grouped-players-menu::part(menu-svg) {
    color: var(--mdc-theme-primary);
    border-radius: 50%;
  }
  @keyframes marquee {
    from {
      left: 0px;
    }
    to {
      left: var(--marquee-left-offset);
    }
  }
`;