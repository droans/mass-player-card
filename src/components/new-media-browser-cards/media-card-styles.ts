import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  :host {
    --mdc-icon-size: calc(10em / var(--columns, 2));
    --browser-card-border-radius: 12px;
  }
  wa-card {
    --wa-panel-border-width: var(--browser-card-border-width);
    height: 100%;
    width: 100%;
  }
  wa-skeleton,
  wa-skeleton::part(indicator) {
    border-radius: var(--browser-card-border-radius) !important;
  }
  img {
    height: 100%;
  }

  #container {
    width: 100%;
    border-radius: var(--browser-card-border-radius) !important;
    overflow: visible !important;
    margin: 0px 0px 3px;
    aspect-ratio: 1;
  }
  #container,
  #container-outer {
    position: relative;
    display: flex;
  }

  .media-card {
    border-radius: var(--browser-card-border-radius) !important;
    overflow: hidden;
  }
  .media-card::part(body) {
    padding: unset;
    text-align: center;
  }
  .media-card.expressive {
    box-shadow: var(--md-sys-elevation-level2);
    border-width: 0px;
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
    font-size: 0.9rem;
    text-transform: capitalize;
    position: absolute;
    width: 100%;
    line-height: 160%;
    bottom: 0;
    background-color: var(--md-sys-color-surface-container-low);
    color: var(--md-sys-color-primary);
    border-radius: 0px 0px var(--browser-card-border-radius)
      var(--browser-card-border-radius);
    overflow: hidden;
    text-wrap: nowrap;
    text-overflow: ellipsis;
  }
  #title-div.expressive {
    font-size: 0.9rem;
    font-family: var(--expressive-font-family);
    font-stretch: 80%;
    font-weight: 700;
    font-variation-settings: "ROND" 100;
  }
  #subtitle-div {
    font-size: 0.8em;
    line-height: 1em;
    padding-bottom: 0.4em;
    font-weight: 400;
  }
  #subtitle-div.expressive {
    font-style: italic;
    font-stretch: 60%;
  }
`;
