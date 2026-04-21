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

  mpc-player-artwork {
    display: flex;
    justify-content: center;
  }

  #active-track.large,
  #active-track.medium,
  #active-track.small {
    width: 100%;
    position: relative;
    z-index: -1;
    position: relative;
    top: -0.5em;
  }

  #active-track-text {
    z-index: 0;
    transform: translate3d(0, 0, -1px);
    -webkit-transform: translate3d(0, 0, -1px);
    position: relative;
  }
  .active-track-text.rounded {
    border-radius: 8px 8px 0px 0px;
  }

  #container {
    height: var(--mass-player-card-height);
  }
  #container.expressive {
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
  #dialog-favorites.expressive .dialog-playlist-item {
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
    border-radius: var(--media-row-thumbnail-border-radius);
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
  .dialog-playlist-title.expressive {
    font-family:
      "Google Sans Flex", "Roboto Flex", var(--ha-font-family-body), "Roboto",
      sans-serif !important;
    font-variation-settings: "ROND" 100;
    font-size: 1.3em;
    font-stretch: 65%;
    font-weight: 500;
  }
  #dialog-favorites.expressive .dialog-playlist-title {
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
  .header-art.large {
    z-index: 2;
    position: relative;
  }
  .header-art.large::part(header) {
    z-index: 2;
  }
  .header-art.small {
    position: relative;
  }
  .media-controls {
    position: absolute;
    bottom: calc(var(--navbar-height) * -1);
    width: 100%;
    padding-bottom: var(--navbar-height);
  }
  .media-controls:not(.expressive) {
    background: var(--player-blur-color) !important;
  }
  .media-controls.expressive {
    background: linear-gradient(
      to top,
      var(--expressive-player-blur-color),
      rgb(from var(--expressive-player-blur-color) r g b / 0.7) 40%,
      rgb(from var(--expressive-player-blur-color) r g b / 0.4) 85%,
      transparent 100%
    ) !important;
    padding-top: 1em;
    border-bottom-left-radius: var(--default-border-radius);
    border-bottom-right-radius: var(--default-border-radius);
    backdrop-filter: blur(8px);
    mask: linear-gradient(transparent, black 5%, black);
  }
  .padded {
    padding-top: 0.5em;
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
  .player-card.expressive {
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
  #player-card-header::before {
    content: "";
    height: 100%;
    width: 100%;
    display: block;
    position: absolute;
    top: 0;
    border-radius: var(--default-border-radius) var(--default-border-radius) 0px
      0px;
    overflow: hidden;
    z-index: -1;
    padding-bottom: 4px;
  }
  #player-card-header:not(.expressive)::before {
    background: var(--player-blur-color) !important;
  }
  #player-card-header.expressive::before {
    mask: linear-gradient(black, black 95%, transparent);
    background: linear-gradient(
      to bottom,
      var(--expressive-player-blur-color),
      rgb(from var(--expressive-player-blur-color) r g b / 0.7) 40%,
      rgb(from var(--expressive-player-blur-color) r g b / 0.4) 85%,
      transparent 100%
    ) !important;
    backdrop-filter: blur(8px);
  }
  .player-header {
    margin: 0em 1.75em 0em 1.75em;
    text-align: center;
    overflow: hidden;
  }

  .player-name {
    position: relative;
  }
  .player-name:not(.expressive) {
    color: var(--player-name-color);
    font-size: 0.8rem;
  }
  .player-name.expressive {
    color: var(--md-sys-color-on-primary-container) !important;
    font-family:
      "Google Sans Flex", "Roboto Flex", var(--ha-font-family-body), "Roboto",
      sans-serif !important;
    font-weight: 700;
    font-size: 0.9rem;
    top: -0.3em;
  }

  .player-track-artist {
    line-height: 1em;
  }
  .player-track-artist:not(.expressive) {
    font-size: 1em;
  }
  .player-track-artist.expressive {
    color: var(--md-sys-color-on-primary-container) !important;
    text-shadow: 0 0 var(--md-sys-color-on-primary-container);
    font-family:
      "Google Sans Flex", "Roboto Flex", var(--ha-font-family-body), "Roboto",
      sans-serif !important;
    font-style: italic;
    font-size: 1.5em;
    font-variation-settings: "ROND" 100;
    font-weight: 300;
    font-stretch: 50%;
  }
  .player-track-title {
    white-space: nowrap;
    text-overflow: clip;
  }
  .player-track-title:not(.expressive) {
    font-size: 1.5rem;
  }
  .player-track-title.expressive {
    color: var(--md-sys-color-on-primary-container);
    text-shadow: 0px 0px var(--md-sys-color-primary);
    font-size: 3rem;
    font-weight: 500;
    font-stretch: 25%;
    font-style: italic;
    font-variation-settings: "ROND" 100;
    line-height: 1.3em;
    font-family:
      "Google Sans Flex", "Roboto Flex", var(--ha-font-family-body), "Roboto",
      sans-serif !important;
    margin-top: -0.2em;
  }

  #volume {
    width: 100%;
  }

  .volume.expressive::part(volume-div) {
    padding-bottom: 6px;
    position: relative;
  }

  .vol-art.large {
    z-index: 1;
    position: relative;
  }
  .vol-art.large::part(volume-div) {
    z-index: 0;
  }
`;
