import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  #container {
    height: var(--mass-player-card-height);
  }
  .player-header {
    margin: 0em 1.75em 0em 1.75em;
    text-align: center;
    overflow: hidden;
    height: 5em;
  }
  #player-card {
    z-index: 0;
    height: calc(var(--mass-player-card-height) - 3em);
    background-repeat: no-repeat;
    background-position: center;
    background-size: 22em;
    position: relative;
  }
  #active-track {
    position: absolute;
    top: 0;
    width: 100%;
  }
  #artwork-div {
    position: absolute;
    aspect-ratio: 1;
    justify-self: center;
    height: var(--mass-player-card-height);
    width: 100%;
    place-content: center;
    top: -3em;
  }
  #artwork-img {
    border-radius: var(--ha-card-border-radius);
    max-height: 22em;
    max-width: 100%;
    justify-self: center;
    display: block;
  }
  #active-track-text {
    background: rgba(from var(--ha-card-background) r g b / 0.6);
    z-index: 1;
    position: relative;
    backdrop-filter: blur(3px);
  }
  .player-name {
    font-size: 0.8rem;
    color: var(--player-name-color);
  }
  .player-track-title {
    font-size: 1.5rem;
    color: var(--player-track-color, var(--md-sys-color-primary));
    white-space: nowrap;
    text-overflow: clip;
  }
  .player-track-artist {
    font-size: 1em;
  }
  .media-controls {
    backdrop-filter: blur(3px);
    background: rgba(from var(--ha-card-background) r g b / 0.6);
    position: absolute;
    bottom: 40px;
    width: 100%;
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
    color: var(--md-sys-color-primary);
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
    color: var(--md-sys-color-primary);
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
    color: var(--md-sys-color-primary);
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
    color: var(--md-sys-color-primary);
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
  #volume {
    position: absolute;
    bottom: 0.5em;
    width: 100%;
  }
  .artwork-large {
    max-height: 35em !important;
  }
  .bg-art-lg {
    z-index: 1;
  }
  .header-art-lg {
    z-index: 1;
    position: relative;
  }
  .header-art-lg::part(header) {
    background: rgba(from var(--ha-card-background) r g b / 0.6);
    backdrop-filter: blur(3px);
    z-index: 0;
  }
  .vol-art-lg {
    z-index: 1;
    position: relative;
  }
  .vol-art-lg::part(volume-div) {
    backdrop-filter: blur(3px);
    z-index: 0;
  }
`;