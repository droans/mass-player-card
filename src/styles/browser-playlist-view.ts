import { css } from "lit";

export default css`
  :host {
    --playlist-header-height: 12em;
    --playlist-header-min-height: calc(var(--playlist-header-height) / 2);
  }
  mass-menu-button::part(menu-button) {
    --ha-ripple-color: rgba(0, 0, 0, 0);
  }
  mass-menu-button::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
  mass-menu-button::part(menu-select-menu) {
    --mdc-icon-size: 5em;
    --control-select-menu-height: 6em;
    --control-select-menu-background-color: unset;
  }
  mass-menu-button::part(menu-svg) {
    color: var(--md-sys-color-primary);
    background-color: var(
      --ha-card-background,
      var(--card-background-color, #fff)
    );
    border-radius: 50%;
  }
  #container {
    height: 100%;
  }
  #enqueue {
    width: 20%;
    display: flex;
    align-self: flex-end;
  }
  #header {
    display: flex;
    height: var(--playlist-header-height);
    will-change: height;
  }
  #img-header {
    display: flex;
    height: 10em;
    margin-top: 1.5em;
    margin-left: 1.2em;
    border-radius: 15%;
    will-change: transform;

  }
  #overview {
    display: block;
    width: 75%;
    align-self: center;
    justify-items: end;
    line-height: normal;
  }
  #playlist-image {
    display: flex;
    place-content: center;
  }
  #playlist-info {
    margin-right: 0.5em;
    font-size: 1.2em;
    will-change: font-size;
  }
  #title {
    font-size: 3em;
    font-style: italic;
    will-change: font-size;
    transition: font-size;
  }
  #tracks {
    height: calc(var(--mass-player-card-height) - 10em);
    overflow: scroll;
    scrollbar-width: none;
  }
  @keyframes scroll-image {
    to {
      transform: scale(0.5);
    }
  }
`