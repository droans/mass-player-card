import { css } from "lit";

export default css`
  :host {
    --view-header-height: 12em;
    --view-header-min-height: calc(var(--view-header-height) / 2);
    --header-expanded-menu-icon-size: 5em;
    --header-expanded-menu-control-size: 5em;
    --header-collapsed-menu-icon-size: 3em;
    --header-collapsed-menu-control-size: 3em;
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
  #animation-image {
    display: block;
  }
  #collection-image {
    display: flex;
    place-content: center;
    width: 11em;
    height: 12em;
    --collection-image-div-collapsed-height: 6em;
    margin-left: 1.2em;
  }
  #collection-info {
    text-align: end;
  }
  #container {
    height: calc(100% - 1em);
    overflow: hidden;
  }
  #enqueue {
    width: 20%;
    display: flex;
    align-self: end;
    position: relative;
    right: 67px;
    bottom: 15px;
  }
  #header {
    display: flex;
    height: var(--view-header-height);
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
    border-radius: 15%;
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
    align-self: center;
    justify-items: end;
    line-height: normal;
    margin-right: 1em;
    height: 100%;
    flex: 1 1 100%;
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
