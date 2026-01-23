import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  mass-menu-button {
    --menu-button-border-radius: 50%;
  }
  mass-menu-button::part(menu-list-item-svg) {
    height: 2em;
    width: 2em;
  }
  mass-menu-button::part(menu-select-menu) {
    --mdc-icon-size: calc(10em / var(--columns, 2));
    --control-select-menu-height: unset;
    --control-select-menu-background-color: unset;
  }
  mass-menu-button::part(menu-svg) {
    color: var(--md-sys-color-primary);
    background-color: var(
      --ha-card-background,
      var(--card-background-color, #fff)
    );
  }
  .svg-menu-expressive {
    max-width: 5em;
    max-height: 5em;
    min-width: 2em;
    min-width: 2em;
  }

  wa-card {
    --wa-panel-border-width: var(--ha-card-border-width);
    height: 100%;
    width: 100%;
  }

  #container {
    width: 100%;
    border-radius: var(--browser-card-border-radius) !important;
    overflow: visible !important;
    margin: 0px 3px 3px 3px;
    aspect-ratio: 1;
  }
  #container,
  #container-outer {
    position: relative;
    display: flex;
  }
  #enqueue-button-div {
    position: absolute;
    right: 0.2em;
    bottom: 2.2em;
    overflow: hidden;
  }

  .media-card {
    border-radius: var(--browser-card-border-radius) !important;
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
    border-radius: var(--browser-card-border-radius);
    overflow: hidden !important;
  }
  .thumbnail,
  .thumbnail-section {
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }
  #thumbnail-div {
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    height: 100%;
    aspect-ratio: 1;
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
    background-color: var(--md-sys-color-surface-container-low);
    color: var(--md-sys-color-primary);
    border-radius: 0px 0px var(--default-border-radius)
      var(--default-border-radius);
  }
`;
