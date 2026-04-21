import { css } from "lit";

export default css`
  :host {
    --view-header-height: 12em;
    --view-header-min-height: 8em;
    --view-header-wrapper-border-div-height: 1em;
    --view-header-wrapper-height: calc(
      var(--view-header-height) + var(--view-header-wrapper-border-div-height)
    );
    --view-header-wrapper-min-height: calc(
      var(--view-header-min-height) +
        var(--view-header-wrapper-border-div-height)
    );
    --header-expanded-menu-icon-size: 5em;
    --header-expanded-menu-control-size: 5em;
    --header-collapsed-menu-icon-size: 3em;
    --header-collapsed-menu-control-size: 3em;
  }
  :host {
    display: block;
  }
  mpc-menu-button {
    --menu-button-border-radius: 50%;
    border-radius: var(--menu-button-border-radius);
  }
  mpc-menu-button::part(menu-button) {
    --ha-ripple-color: rgba(0, 0, 0, 0);
  }
  mpc-menu-button::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
  mpc-menu-button::part(base) {
    --ha-button-border-radius: unset;
    height: 72px;
  }
  mpc-menu-button::part(menu-button) {
    --button-button-height: var(--mdc-icon-size);
    --button-button-width: var(--mdc-icon-size);
  }
  mpc-menu-button::part(menu-select-menu) {
    --menu-button-background-color: var(--md-sys-color-background);
    --control-select-menu-height: unset;
    --control-select-menu-background-color: unset;
    --control-select-menu-padding: unset;
  }
  mpc-menu-button::part(menu-svg) {
    --mdc-icon-size: var(--header-expanded-menu-icon-size);
    --button-icon-color: var(--md-sys-color-primary);
  }
  mpc-collection-track-row {
    width: 100%;
    padding-left: 4px;
    padding-right: 4px;
  }
  #animation-image {
    display: block;
  }
  #browser-view {
    background-color: var(--md-sys-color-background);
    border-radius: var(--default-border-radius);
    height: 100%;
    scrollbar-width: none;
  }
  #collection-image {
    display: flex;
    height: 10em;
    aspect-ratio: 1;
    --collection-image-div-collapsed-height: 6em;
    margin-left: 1em;
    margin-top: 1em;
  }
  #collection-info {
    text-align: end;
  }
  #container {
    height: calc(100% - 1em);
    overflow: hidden;
    background-color: var(
      --md-sys-color-secondary-container,
      var(--ha-card-background)
    );
  }
  #enqueue {
    display: flex;
    align-self: end;
    position: relative;
    right: 37.5%;
    bottom: -12.5%;
    z-index: 1;
  }
  #header {
    height: var(--view-header-height);
    display: flex;
    position: absolute;
    width: 100%;
    background-color: var(
      --md-sys-color-secondary-container,
      var(--ha-card-background)
    );
    z-index: 1;
    height: var(--view-header-height);
    border-top-left-radius: var(--default-border-radius);
    border-top-right-radius: var(--default-border-radius);
    z-index: 2;
  }
  #img-header {
    display: flex;
    border-radius: 15%;
    height: 100%;
    width: 100%;
    will-change: transform;
    place-self: center;
  }
  .loading-indicator {
    background-color: var(--md-sys-color-primary);
    justify-self: center;
    top: 2em;
  }
  #overview {
    display: block;
    width: 0%;
    justify-items: end;
    line-height: normal;
    margin-right: 1em;
    height: 100%;
    flex: 1 1 100%;
    padding-top: 1em;
  }
  #title {
    display: block;
    text-wrap: nowrap;
    width: 100%;
    font-size: 3em;
    font-style: italic;
    will-change: font-size;
    transition: font-size;
    font-variation-settings:
      "slnt" 0,
      "GRAD" 0,
      "ROND" 100;
    font-weight: 900;
    font-stretch: 25%;
    text-align: end;
  }
  #title.expressive,
  #tracks-length.expressive {
    font-family: "Google Sans Flex", sans-serif;
  }
  #title::not(.expressive),
  #tracks-length::not(.expressive) {
    font-family: "Roboto", sans-serif;
  }
  #title-text {
    padding-right: 4px;
  }
  #tracks {
    height: calc(var(--mass-player-card-height) - var(--navbar-height));
    padding-bottom: var(--navbar-height);
    padding-top: calc(
      var(--view-header-height) 0 var(--view-header-min-height)
    );
    position: relative;
    scrollbar-width: none;
    top: var(--view-header-height);
  }
  #tracks:not(.no-scroll) #virtualizer {
    overflow: scroll;
  }
  #tracks-container {
    overflow: hidden;
  }
  #tracks-container.expressive {
    border-top-left-radius: var(--default-border-radius);
    border-top-right-radius: var(--default-border-radius);
  }
  #tracks-container:not(.expressive) {
    border-top-left-radius: var(--queue-border-radius);
    border-top-right-radius: var(--queue-border-radius);
  }
  #tracks-length {
    margin-right: 0.5em;
    will-change: font-size;
  }
  #tracks-padding {
    height: 0em;
  }
  #virtualizer {
    background-color: var(
      --md-sys-color-background,
      var(--card-background-color)
    );
    border-radius: var(--default-border-radius);
    scrollbar-width: none;
    height: 100%;
  }
  @keyframes scroll-image {
    to {
      transform: scale(0.5);
    }
  }
`;
