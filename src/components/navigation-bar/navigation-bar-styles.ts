import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  @media (width <= 450px) {
    :host {
      --label-font-size: 1rem;
      --nav-icon-width: 24px;
    }
  }
  @media (width > 450px) {
    :host {
      --label-font-size: 1.7rem;
      --nav-icon-width: 36px;
    }
  }
  :host {
    --transform-duration: 350ms;
    interpolate-size: allow-keywords;
    --navbar-border-radius: 4rem;
  }
  .action-button-svg {
    --icon-primary-color: var(--tab-active-icon-color);
    height: 100%;
    width: 100%;
  }
  .action-button-svg.inactive {
    --icon-primary-color: var(--tab-inactive-icon-color);
  }
  .icon-div {
    width: var(--nav-icon-width);
    display: flex;
  }
  .icon-i {
    height: var(--nav-icon-width);
    width: var(--nav-icon-width);
  }
  :is(nav.tabbed > a, .tabs > a):is(:hover)::after {
    opacity: 0 !important;
  }
  #nav-div {
    --tab-active-icon-color: var(--md-sys-color-on-primary-container);
    --tab-active-indicator-color: var(--md-sys-color-secondary-container);
    --tabbed-background-color: var(
      --md-sys-color-secondary-container
    ) !important;
    --tabbed-elevation: var(--md-sys-elevation-level1);
    --tab-icon-height: 24px;
    --tab-inactive-icon-color: var(--md-sys-color-on-surface);

    background-color: var(--tabbed-background-color);
    box-shadow: var(--tabbed-elevation);
    column-gap: 8px;
    display: block;
    height: var(--navbar-height);
    overflow: hidden;
    padding-inline: 8px;
    place-content: center;
    border-radius: var(--navbar-border-radius);
  }
  #navigation {
    align-content: center;
    column-gap: 0.5rem;
    display: block;
    height: 100%;
    width: 100%;
  }
  #navigation a {
    z-index: 2;
    height: 80%;
    transition-property: background-color, color, flex-basis, padding, width;
    transition-duration: var(--transform-duration);
  }
  #navigation a.active {
    --primary-container: var(--md-sys-color-primary-container);
    font-size: var(--label-font-size, 1.7rem);
    font-stretch: 50%;
    font-weight: 600;
    font-variation-settings: "ROND" 100;
    /* flex-basis: 200%; */
    color: var(--tab-active-icon-color);
    width: var(--tab-width);
  }
  #navigation a .label-div {
    overflow: hidden;
    transition: width var(--transform-duration);
    border-radius: unset;
  }
  #navigation a:not(.active) {
    background-color: var(--md-sys-color-surface);
    /* flex-basis: 100%; */
    width: calc(var(--tab-width) - 0.25rem);
  }
  #navigation a:not(.active) .label-div {
    width: 0%;
    display: none;
  }
`;
