import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  *[hide] {
    display: none;
  }

  *[background] {
    background-color: rgba(var(--player-blur-color), 0.9);
    border-radius: 10px;
  }

  mass-artwork {
    display: flex;
    justify-content: center;
  }

  #active-track-lg {
    width: 100%;
  }
  #active-track-med {
    width: 100%;
  }
  #active-track-sm {
    width: 100%;
  }

  #active-track-text {
    z-index: 1;
    position: relative;
  }
  .active-track-text-expressive {
  }
  .active-track-text-rounded {
    border-radius: 8px 8px 0px 0px;
  }

  .artwork-large {
    max-height: 35em !important;
  }
  .artwork-med {
    max-height: 22em !important;

  }
  .artwork-sm {

  }
  #artwork-div-lg {
    position: absolute;
    aspect-ratio: 1;
    justify-self: center;
    height: var(--mass-player-card-height);
    width: 100%;
    place-content: center;
    top: -3em;
    
  }
  #artwork-div-med {
    aspect-ratio: 1;
    justify-self: center;
    place-content: center;
    height: 100%;
    top: -2em;
    position: absolute;
  }
  #artwork-div-sm {
    position: relative;
    height: 10em;
    display: flex;
    justify-self: center;
  }

  .bg-art-lg {
    z-index: 1;
  }
  .bg-art-med {

  }
  .bg-art-sm {

  }

  #container {
    height: var(--mass-player-card-height);
  }
  .container-expressive {
    border-radius: var(--expressive-border-radius-container);
  }

  .controls-art-lg {

  }
  .controls-art-med {
    
  }
  .controls-art-sm {
    
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

  .header-art-lg {
    z-index: 2;
    position: relative;
  }
  .header-art-lg::part(header) {
    z-index: 0;
  }
  .header-art-med {

  }
  .header-art-sm {
    position: relative;
  }

  #grouped-players-menu {
    --control-select-thickness: 2.5em;
    max-width: var(--control-select-menu-height);
  }

  .grouped-players-item {
    height: calc(var(--control-select-menu-height) * 2);
    display: contents;
  }

  .grouped-players-volume-slider {
    display: contents;
  }
  #grouped-volume, .grouped-players-volume-slider::part(slider) {
    position: relative;
    width: 96%;
    left: 2%;
    height: 2.5em;
  }
  .grouped-button-unjoin {
    width: var(--media-row-icon-width);
    align-content: center;
  }
  .grouped-button-unjoin::part(base) {
    height: 30px;
    width: 30px;
    border-radius: 25%;
  }
  .grouped-button-unjoin-expressive::part(base) {
    box-shadow: var(--md-sys-elevation-level1);
    --ha-button-border-radius: var(--button-small-border-radius) !important;
    background-color: var(--expressive-row-button-color);
    --inherited-background-color: var(--expressive-row-button-color);
  }
  .grouped-button-unjoin-expressive::part(base):hover {
    background-color: var(--expressive-row-button-color-hover) !important;
    --inherited-background-color: var(--expressive-row-button-color-hover) !important;
    box-shadow: var(--md-sys-elevation-level1);
    --ha-button-border-radius: var(--button-small-border-radius) !important;
  }

  .grouped-button-unjoin-expressive > .title {
    color: var(--expressive-row-color-text);
  }
  .grouped-svg-unjoin {
    height: var(--row-icon-button-height);
    width: var(--row-icon-button-height);
  }
  .grouped-svg-unjoin-expressive {
    color: var(--expressive-row-button-color-text);
  }
  .grouped-svg-unjoin-expressive:hover {
    color: var(--expressive-row-button-color-text-hover)
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

  .media-controls {
    backdrop-filter: blur(3px);
    background: var(--player-blur-color);
    position: absolute;
    bottom: 0;
    width: 100%;
  }
  
  .media-controls:not(.media-controls-expressive) {
    background: linear-gradient(transparent, var(--player-blur-color) 10%) !important;
  }
  .media-controls-expressive {
    background: linear-gradient(transparent, var(--expressive-player-blur-color) 10%) !important;
  }

  .menu-header::part(menu-select-menu) {
    border-radius: 50%; 
    height: 2.5em;
    width: 2.5em;
    --control-select-menu-padding: 7px;
    --mdc-icon-size: 1.5em;
    --control-select-menu-height: 2.5em;
  }
  .menu-header-expressive::part(menu-select-menu) {
    --control-select-menu-background-color: var(--md-sys-color-secondary-container) !important;
    background-color: unset !important;
    box-shadow: var(--md-sys-elevation-level1);
    border-radius: var(--button-small-border-radius);
  }
  .menu-header-expressive::part(menu-svg) {
    color: var(--md-sys-color-secondary-on-container) !important;
  }

  #player-card {
    z-index: 0;
    height: var(--mass-player-card-height);
    background-repeat: no-repeat;
    background-position: center;
    background-size: 22em;
    position: relative;
  }
  .player-card-expressive {
    background-color: var(--md-sys-color-background);
    border-radius: 8px 8px 0px 0px;
  }
  #player-card-header {
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;
    border-radius: 28px 28px 0px 0px;
  }
  .player-card-header {
    background: linear-gradient(var(--player-blur-color) 90%, transparent) !important;
  }
  .player-card-header-expressive {
    background: linear-gradient(var(--expressive-player-blur-color) 90%, transparent) !important;

  }
  .player-card-header, .player-card-header-expressive {
    backdrop-filter: blur(3px);
  }
  .player-header {
    margin: 0em 1.75em 0em 1.75em;
    text-align: center;
    overflow: hidden;
    height: 5em;
  }

  .player-name {
    font-size: 0.8rem;
    color: var(--player-name-color);
  }
  .player-name-expressive {
    color: var(--md-sys-color-on-primary-container) !important;
  }

  .grouped-players-select-item, #players-select-menu::part(menu-list-item) {
    height: 3.5em;
  }
  .grouped-players-select-item {
    width: 320px;
  }
  .players-select-item-icon,  .grouped-players-select-item-icon {
    height: 2em;
    width: 2em;
    color: var(--md-sys-color-primary);
  }
  #players-select-menu, #grouped-players-menu {
    --control-select-menu-height: 2.5em;
  }

  .player-track-artist {
    font-size: 1em;
    text-shadow: 0 0 var(--md-sys-color-on-primary-container);
  }
  .player-track-artist-expressive {
    font-size: 1em;
    color: var(--md-sys-color-on-primary-container) !important;
  }
  .player-track-title {
    font-size: 1.5rem;
    color: var(--player-track-color, var(--md-sys-color-primary));
    white-space: nowrap;
    text-overflow: clip;
    text-shadow: 0px 0px var(--md-sys-color-primary);
  }

  #players-select-menu::part(menu-button), #grouped-players-menu::part(menu-button) {
    --ha-ripple-color: rgba(0,0,0,0);
  }
  #players-select-menu::part(menu-list-item) {
  }
  #players-select-menu::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
  .menu-header::part(menu-select-menu) {
    background-color: var(--wa-color-brand-fill-normal, var(--wa-color-neutral-fill-normal));
  }
  .menu-header::part(menu-svg):not(.svg-menu-expressive) {
    color: var(--wa-color-brand-on-normal, var(--wa-color-neutral-on-normal));
    border-radius: 50%;
  }

  #volume {
    width: 100%;
  }

  .volume-expressive::part(volume-div) {
    padding-bottom: 6px;
    position: relative;
  }

  .vol-art-lg {
    z-index: 1;
    position: relative;
  }
  .vol-art-lg::part(volume-div) {
    z-index: 0;
  }
  .vol-art-med {
  }
  .vol-art-sm {

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