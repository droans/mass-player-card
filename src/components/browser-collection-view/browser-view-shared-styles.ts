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
    margin-top: -8px;
  }
  mass-menu-button {
    --menu-button-border-radius: 50%;
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
    /* padding-left: 10px; */
  }
  mass-menu-button::part(menu-svg) {
    color: var(--md-sys-color-primary);
    background-color: var(
      --ha-card-background,
      var(--card-background-color, #fff)
    );
  }
  #animation-image {
    display: block;
  }
  #collection-image {
    display: flex;
    /* place-content: center; */
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
  }
  #enqueue {
    display: flex;
    align-self: end;
    position: relative;
    right: 37.5%;
    bottom: -12.5%;
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
  }
  /* #header-wrapper {
    height: var(--view-header-wrapper-height);
    position: absolute;
    width: 100%;
  }
  #header-wrapper::before {
    content: " ";
    display: block;
    height: 1em;
    width: 100%;
  } */
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
    font-family: "Google Sans Flex";
    font-variation-settings:
      "slnt" 0,
      "GRAD" 0,
      "ROND" 100;
    font-weight: 900;
    font-stretch: 25%;
    text-align: end;
  }
  #title-text {
    padding-right: 4px;
  }
  #tracks {
    height: calc(var(--mass-player-card-height) - 4em);
    padding-top: calc(
      var(--view-header-height) 0 var(--view-header-min-height)
    );
    position: relative;
    overflow: scroll;
    scrollbar-width: none;
  }
  #tracks-container {
    border-top-left-radius: var(--default-border-radius);
    border-top-right-radius: var(--default-border-radius);
    overflow: hidden;
  }
  #tracks-length {
    margin-right: 0.5em;
    will-change: font-size;
    font-family: "Google Sans Flex";
  }
  #tracks-padding {
    height: var(--view-header-height);
  }
  @keyframes scroll-image {
    to {
      transform: scale(0.5);
    }
  }
`;
