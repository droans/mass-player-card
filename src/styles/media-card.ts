import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  mass-menu-button::part(menu-button) {
    position: absolute;
    bottom: 1.5em;
    right: -0.75em;
    --ha-ripple-color: rgba(0,0,0,0);
  }
  mass-menu-button::part(menu-list-item) {
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
    background-color: var(--ha-card-background,var(--card-background-color,#fff));
    border-radius: 50%;
  }

  wa-card {
    --inner-border-radius: var(--ha-card-border-radius);
    --wa-panel-border-radius: var(--ha-card-border-radius);
    --wa-panel-border-style: var(--ha-card-border-style);
    --wa-color-surface-border: var(--ha-color-border-neutral-normal);
    --wa-panel-border-width: var(--ha-card-border-width);
    --wa-shadow-s: var(--ha-card-box-shadow);
    height: 100%;
    width: 100%;
  }

  #container {
    width: 100%;
    position: relative;
    display: flex;
    border-radius: var(--ha-card-border-radius) !important;
    overflow: visible !important;
    margin: 0px 3px 3px 3px;
    aspect-ratio: 1;
  }

  #card-button-div {
    position: absolute;
    width: 100%;
    height: 100%;
    display: contents;
    top: 0;
    left: 0;
  }

  #enqueue-list-item {
  }
  .enqueue-item-svg {
    height: 2em;
    width: 2em;
  }
  #enqueue-menu-control {
    --control-select-menu-background-color: unset;
    --ha-ripple-color: rgba(0,0,0,0);
    --mdc-icon-size: 5em;
    --control-select-menu-height: 6em;
  }
  #enqueue-svg {
    color: var(--md-sys-color-primary);
    background-color: var(--ha-card-background,var(--card-background-color,#fff));
    border-radius: 50%;
  }

  .media-card {
    border-radius: var(--ha-card-border-radius) !important;
    overflow: hidden;
  }
  .media-card::part(body) {
    padding: unset;
    text-align: center;
  }
  .media-card-expressive {
    box-shadow: var(--md-sys-elevation-level2);
  }

  .thumbnail {
    border-radius: 28px;
    overflow: hidden !important
  }
  #thumbnail-div {
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
  }
  .thumbnail-section {
    background-repeat: no-repeat;
    background-size: contain;
    width: 100%;
    aspect-ratio: 1;
  }
  
  #title-div {
    font-size: 1.2rem;
    text-transform: capitalize;
    position: absolute;
    width: 100%;
    line-height: 160%;
    bottom: 0;
    background-color: rgba(from var(--ha-card-background) r g b / 0.9);
    border-radius: 0px 0px 28px 28px;
  }
`;