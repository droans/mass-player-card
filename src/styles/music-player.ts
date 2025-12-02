import { css } from "lit";

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
    z-index: 0;
    transform: translate3d(0, 0, -1px);
    -webkit-transform: translate3d(0, 0, -1px);
    position: relative;
  }
  .active-track-text-expressive {
  }
  .active-track-text-rounded {
    border-radius: 8px 8px 0px 0px;
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

  #dialog-favorites { 
    --dialog-content-padding: 12px;
  }
  .dialog-playlist-item { /* button, button-active */
    margin: 0.15rem;
    border-radius: var(--media-row-border-radius);
    background: var(--media-row-background-color);
    height: var(--media-row-height);
  }
  #dialog-favorites-expressive .dialog-playlist-item { /* button-expressive, button-expressive-active */
    background-color: var(--expressive-row-color) !important;
    --md-list-item-hover-state-layer-color: var(--md-sys-color-on-surface);
    border-radius: var(--default-border-radius);
    --md-ripple-hover-color: var(--md-sys-color-on-surface);
    --md-ripple-pressed-color: var(--md-sys-color-on-surface);
  }
  .dialog-playlist-thumbnail { /* thumbnail */
    width: var(--media-row-thumbnail-height);
    height: var(--media-row-thumbnail-height);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: left;
    border-radius: var(--media-row-border-radius);
    margin-left: 14px;

  }
  .dialog-playlist-title { /* title */
    font-size: 1.1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    color: var(--font-color);
    
  }
  #dialog-favorites-expressive .dialog-playlist-title {
    color: var(--expressive-row-color-text);
    
  }
  .dialog-playlist-divider {
    --divider-color: var(--md-sys-color-outline-variant);
  }
  .dialog-playlist-divider::before {
    content: " ";
    display: block;
    height: 1px;
    background-color: var(--divider-color);
    margin-left: 64px;
    margin-right: 24px;
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
  #grouped-volume,
  .grouped-players-volume-slider::part(slider) {
    position: relative;
    width: 96%;
    left: 2%;
    height: 2.5em;
  }
  .grouped-button-unjoin {
    --button-button-width: var(--media-row-icon-width);
    --button-button-height: 30px;
    --button-border-radius: 25%;
    --button-padding: 0px;
    align-content: center;
  }
  .grouped-svg-unjoin {
    --button-button-height: var(--row-icon-button-height);
    width: var(--row-icon-button-height);
  }
  .grouped-svg-unjoin-expressive {
    color: var(--expressive-row-button-color-text);
  }
  .grouped-svg-unjoin-expressive:hover {
    color: var(--expressive-row-button-color-text-hover);
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
    backdrop-filter: blur(8px);
    background: var(--player-blur-color);
    position: absolute;
    bottom: 0;
    width: 100%;
    mask: linear-gradient(transparent, black 5%, black);
  }

  .media-controls:not(.media-controls-expressive) {
    background: linear-gradient(
      transparent,
      var(--player-blur-color) 10%
    ) !important;
  }
  .media-controls-expressive {
    background: linear-gradient(
      transparent,
      var(--expressive-player-blur-color) 10%
    ) !important;
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
    --control-select-menu-background-color: var(
      --md-sys-color-secondary-container
    ) !important;
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
    border-top-left-radius: 28px;
    border-top-right-radius: 28px;
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
    border-radius: var(--default-border-radius) var(--default-border-radius) 0px
      0px;
  }
  .player-card-header::before {
    background: linear-gradient(
      var(--player-blur-color) 90%,
      transparent
    ) !important;
  }
  .player-card-header-expressive::before {
    content: '';
    height: 100%;
    width: 100%;
    display: block;
    position: absolute;
    top: 0;
    mask: linear-gradient(black, black 95%, transparent);
    background: linear-gradient(
      var(--expressive-player-blur-color) 90%,
      transparent
    ) !important;
    
  }
  #player-card-header::before {
    content: '';
    height: 100%;
    width: 100%;
    display: block;
    position: absolute;
    top: 0;
    mask: linear-gradient(black, black 95%, transparent);
    backdrop-filter: blur(8px);
    border-radius: var(--default-border-radius) var(--default-border-radius) 0px 0px;
    overflow: hidden;
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

  .grouped-players-select-item,
  #players-select-menu::part(menu-list-item) {
    height: 3.5em;
  }
  .grouped-players-select-item {
    width: 320px;
  }
  .players-select-item-icon,
  .grouped-players-select-item-icon {
    height: 2em;
    width: 2em;
    color: var(--md-sys-color-primary);
  }
  #players-select-menu,
  #grouped-players-menu {
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
    color: var(--player-track-color, var(--md-sys-color-on-primary-container));
    white-space: nowrap;
    text-overflow: clip;
    text-shadow: 0px 0px var(--md-sys-color-primary);
  }

  #players-select-menu::part(menu-button),
  #grouped-players-menu::part(menu-button) {
    --ha-ripple-color: rgba(0, 0, 0, 0);
  }
  #players-select-menu::part(menu-list-item) {
  }
  #players-select-menu::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
  .menu-header::part(menu-select-menu) {
    background-color: var(--control-select-menu-background-color);
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
