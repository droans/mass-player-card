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

  mpc-artwork {
    display: flex;
    justify-content: center;
  }

  #active-track-lg,
  #active-track-med,
  #active-track-sm {
    width: 100%;
    position: relative;
    z-index: -1;
  }

  #active-track-text {
    z-index: 0;
    transform: translate3d(0, 0, -1px);
    -webkit-transform: translate3d(0, 0, -1px);
    position: relative;
  }
  .active-track-text-rounded {
    border-radius: 8px 8px 0px 0px;
  }

  #container {
    height: var(--mass-player-card-height);
  }
  .container-expressive {
    border-radius: var(--expressive-border-radius-container);
  }

  #dialog-favorites {
    --dialog-content-padding: 12px;
  }
  .dialog-playlist-item {
    margin: 0.15rem;
    border-radius: var(--media-row-border-radius);
    height: var(--media-row-height);
  }
  #dialog-favorites-expressive .dialog-playlist-item {
    background-color: var(--expressive-row-color) !important;
    --md-list-item-hover-state-layer-color: var(--md-sys-color-on-surface);
    border-radius: var(--default-border-radius);
    --md-ripple-hover-color: var(--md-sys-color-on-surface);
    --md-ripple-pressed-color: var(--md-sys-color-on-surface);
  }
  .dialog-playlist-thumbnail {
    width: var(--media-row-thumbnail-height);
    height: var(--media-row-thumbnail-height);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: left;
    border-radius: var(--media-row-border-radius);
    margin-left: 14px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }
  .dialog-playlist-title {
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
  .header-art-lg {
    z-index: 2;
    position: relative;
  }
  .header-art-lg::part(header) {
    z-index: 0;
  }
  .header-art-sm {
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
      to top,
      var(--expressive-player-blur-color),
      rgb(from var(--expressive-player-blur-color) r g b / 0.7) 40%,
      rgb(from var(--expressive-player-blur-color) r g b / 0.4) 75%,
      transparent 100%
    ) !important;
  }
  #player-card {
    z-index: 0;
    height: var(--mass-player-card-height);
    background-repeat: no-repeat;
    background-position: center;
    background-size: 22em;
    position: relative;
    border-top-left-radius: var(--default-border-radius);
    border-top-right-radius: var(--default-border-radius);
  }
  .player-card-expressive {
    background-color: var(--md-sys-color-background, var(--ha-card-background));
    border-radius: 8px 8px 0px 0px;
  }
  #player-card-header {
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 3;
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
    content: "";
    height: 100%;
    width: 100%;
    display: block;
    position: absolute;
    top: 0;
    mask: linear-gradient(black, black 95%, transparent);
    background: linear-gradient(
      to bottom,
      var(--expressive-player-blur-color),
      rgb(from var(--expressive-player-blur-color) r g b / 0.7) 40%,
      rgb(from var(--expressive-player-blur-color) r g b / 0.4) 75%,
      transparent 100%
    ) !important;
  }
  #player-card-header::before {
    content: "";
    height: 100%;
    width: 100%;
    display: block;
    position: absolute;
    top: 0;
    mask: linear-gradient(black, black 95%, transparent);
    backdrop-filter: blur(8px);
    border-radius: var(--default-border-radius) var(--default-border-radius) 0px
      0px;
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
    color: var(--md-sys-color-on-primary-container);
    white-space: nowrap;
    text-overflow: clip;
    text-shadow: 0px 0px var(--md-sys-color-primary);
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
`;
