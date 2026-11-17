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
  }
  #navigation a {
    z-index: 2;
    height: 80%;
    transition-property: flex-basis, padding;
    transition-duration: var(--transform-duration);
  }
  #navigation a.active {
    --primary-container: var(--md-sys-color-primary-container);
    font-size: var(--label-font-size, 1.7rem);
    font-stretch: 50%;
    font-weight: 600;
    font-variation-settings: "ROND" 100;
    flex-basis: 200%;
    color: var(--tab-active-icon-color);
  }
  #navigation a:not(.active) .label-div {
    width: 0%;
    display: none;
  }
  #navigation a .label-div {
    overflow: hidden;
    transition: width var(--transform-duration);
    border-radius: unset;
  }
  #navigation a:not(.active) {
    background-color: var(--md-sys-color-surface);
    flex-basis: 100%;
  }
  :is(nav.tabbed > a, .tabs > a):is(:hover)::after {
    opacity: 0 !important;
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
  nav {
    height: var(--navbar-height);
  }
  nav.tabbed {
    background-color: var(--tabbed-background-color);
    overflow: hidden;
    /* display: block; */
    place-content: center;
  }
  #tab-indicator {
    height: 100%;
    max-height: var(--navbar-height);
    position: absolute;
    /* box-shadow: var(--md-sys-elevation-level2); */
    background-color: var(--md-sys-color-secondary-container);
    z-index: 1;
    will-change: transform;
    border-radius: var(--default-border-radius);
    /* width: 40%; */
    top: 0;
    left: var(--left);
  }
  #tab-indicator.left {
    animation: bounce-left var(--transform-duration);
  }
  #tab-indicator.right {
    animation: bounce-right var(--transform-duration);
  }
  .tabbed {
    --tabbed-elevation: var(--md-sys-elevation-level1);
    --tab-active-icon-color: var(--md-sys-color-on-primary-container);
    --tab-active-indicator-color: var(--md-sys-color-secondary-container);
    --tab-inactive-icon-color: var(--md-sys-color-on-surface);
    --tab-icon-height: 24px;
  }
  .tabbed:not(.expressive) {
    --tabbed-background-color: var(--tabbed-background-color);
  }
  .tabbed.expressive {
    --tabbed-background-color: var(
      --md-sys-color-secondary-container
    ) !important;
    box-shadow: var(--tabbed-elevation);
    padding-inline: 8px;
    column-gap: 8px;
  }
  @keyframes bounce-left {
    0% {
      left: var(--initial-left);
    }
    60% {
      left: var(--left);
    }
    80% {
      left: calc(var(--left) - (var(--left) * 0.2));
    }
    95% {
      left: calc(var(--left) + (var(--left) * 0.1));
    }
    100% {
      left: var(--left);
    }
  }
  @keyframes bounce-right {
    0% {
      left: var(--initial-left);
    }
    60% {
      left: var(--left);
    }
    80% {
      left: calc(var(--left) + (var(--left) * 0.2));
    }
    95% {
      left: calc(var(--left) = (var(--left) * 0.1));
    }
    100% {
      left: var(--left);
    }
  }
`;
