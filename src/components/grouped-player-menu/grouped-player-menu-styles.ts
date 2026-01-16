import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  .divider {
    margin-top: 2px;
    margin-bottom: 2px;
  }
  .divider::before {
    content: " ";
    display: block;
    height: 1px;
    background-color: var(--divider-color);
    margin-left: 24px;
    margin-right: 24px;
  }
  .grouped-button-unjoin {
    --button-button-width: var(--media-row-icon-width);
    --button-button-height: 30px;
    --button-border-radius: 25%;
    --button-padding: 0px;
    align-content: center;
  }
  .grouped-players-item {
    height: calc(var(--control-select-menu-height) * 2);
    display: contents;
  }
  #grouped-players-menu {
    --control-select-thickness: 2.5em;
    max-width: var(--control-select-menu-height);
  }
  #grouped-players-menu ha-md-list-item {
    padding-left: 12px;
  }
  #grouped-players-menu ha-md-list-item:not(.grouped-players-volume-item) {
    padding-right: 12px;
  }
  #grouped-players-menu::part(menu-button) {
    --ha-ripple-color: rgba(0, 0, 0, 0);
  }
  .grouped-players-select-item {
    width: 320px;
    height: 100%;
  }
  .grouped-players-select-item-image,
  .grouped-players-select-item-icon {
    height: 3em;
    width: 3em;
  }
  .grouped-players-select-item-icon.expressive,
  .grouped-players-select-item-image.expressive {
    margin-left: 14px;
  }
  .grouped-players-select-item-image.expressive {
    border-radius: 12px;
  }
  .grouped-players-volume-item {
    --md-list-item-top-space: 0px;
  }
  .grouped-svg-unjoin {
    --button-button-height: var(--row-icon-button-height);
    width: var(--row-icon-button-height);
  }
  .grouped-svg-unjoin.expressive {
    color: var(--expressive-row-button-color-text);
  }
  .grouped-svg-unjoin.expressive:hover {
    color: var(--expressive-row-button-color-text-hover);
  }
  #grouped-volume,
  .grouped-players-volume-slider::part(slider) {
    position: relative;
    width: 96%;
    left: 2%;
    height: 2.5em;
  }
  .grouped-volume .player-name-icon {
    margin-top: 10px;
    color: var(--md-sys-color-primary);
  }
  .menu-header {
    --menu-button-border-radius: 50%;
  }
  .menu-header::part(menu-select-menu) {
    height: 2.5em;
    width: 2.5em;
    --control-select-menu-padding: 7px;
    --mdc-icon-size: 1.5em;
    --control-select-menu-height: 2.5em;
    background-color: var(--control-select-menu-background-color);
  }
  .menu-header::part(menu-svg):not(.svg-menu-expressive) {
    color: var(--wa-color-brand-on-normal, var(--wa-color-neutral-on-normal));
  }
  .menu-header.expressive::part(menu-select-menu) {
    --control-select-menu-background-color: var(
      --md-sys-color-secondary-container
    ) !important;
  }
  .menu-header.expressive::part(menu-svg) {
    color: var(--md-sys-color-secondary-on-container) !important;
  }
`;
