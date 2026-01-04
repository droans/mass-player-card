import { css } from "lit";

export default css`
  :host {
    --playlist-header-height: 12em;
    --playlist-header-min-height: calc(var(--playlist-header-height) / 2);
    --header-expanded-menu-icon-size: 5em;
    --header-expanded-menu-control-size: 5em;
    --header-collapsed-menu-icon-size: 4em;
    --header-collapsed-menu-control-size: 4em;
  }
  mass-menu-button::part(menu-button) {
    --ha-ripple-color: rgba(0, 0, 0, 0);
  }
  mass-menu-button::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
  mass-menu-button::part(menu-select-menu) {
    --mdc-icon-size: var(--header-expanded-menu-icon-size);
    --control-select-menu-height: var(--header-expanded-menu-control-size);
    --control-select-menu-background-color: unset;
    --control-select-menu-padding: unset;
    padding-left: 10px;
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
    height: calc(100% - 1em);
    overflow: hidden;
  }
  #enqueue {
    width: 20%;
    display: flex;
    align-self: center;
  }
  #header {
    display: flex;
    height: var(--playlist-header-height);
    will-change: height;
    position: absolute;
    width: 100%;
    z-index: 1;
    background-color: var(--md-sys-color-background, var(--ha-card-background));
    border-top-left-radius: var(--default-border-radius);
    border-top-right-radius: var(--default-border-radius);
  }
  #img-header {
    display: flex;
    height: 10em;
    margin-top: 0.5em;
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
  #playlist-duration {
    font-size: 1em;
    margin-right: 0.5em;
    font-style: italic;
    font-family: "Google Sans Flex";
  }
  #playlist-image {
    display: flex;
    place-content: center;
  }
  #playlist-info {
    margin-right: 0.5em;
    font-size: 1.2em;
    will-change: font-size;
    font-family: "Google Sans Flex";
  }
  #title {
    font-size: 3em;
    font-style: italic;
    will-change: font-size;
    transition: font-size;
    font-family: "Google Sans Flex";
    font-variation-settings: "slnt" 0, "GRAD" 0, "ROND" 100;
    font-weight: 800;
    font-stretch: 50%;
  }
  #tracks {
    height: calc(var(--mass-player-card-height) - 4em);
    padding-top: calc(var(--playlist-header-height) 0 var(--playlist-header-min-height));
    position: relative;
    overflow: scroll;
    scrollbar-width: none;
  }
  #tracks-container {
    border-top-left-radius: var(--default-border-radius);
    border-top-right-radius: var(--default-border-radius);
    overflow: hidden;
  }
  #tracks-padding {
    height: var(--playlist-header-height);
  }
  @keyframes scroll-image {
    to {
      transform: scale(0.5);
    }
  }
`