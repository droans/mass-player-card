import { css } from "lit";

export default css`
  :host {
    --background-color-normal-active: var(--mdc-theme-primary);
    --background-color-expressive-active: var(
      --md-sys-color-secondary-container
    );
    --background-color-expressive-vibrant-active: var(--md-sys-color-tertiary);

    --text-color-normal-active: var(--mdc-theme-on-primary);
    --text-color-expressive: var(--md-sys-color-on-surface);
    --text-color-expressive-vibrant: var(--md-sys-color-on-tertiary-container);
    --text-color-expressive-active: var(--md-sys-color-on-secondary-container);
    --text-color-expressive-vibrant-active: var(--md-sys-color-on-tertiary);

    --ripple-hover-color-expressive: var(--md-sys-color-on-surface);
    --ripple-hover-color-expressive-vibrant: var(
      --md-sys-color-on-tertiary-container
    );
    --ripple-hover-color-expressive-active: var(--md-sys-color-on-surface);
    --ripple-hover-color-expressive-vibrant-active: var(
      --md-sys-color-on-tertiary-container
    );
  }
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
  /* Base */
  ha-dropdown-item {
    padding-inline: unset;
    padding-right: 14px;
  }
  .menu-list-item-md {
    border-radius: 1.5em;
    padding-top: 0px;
    padding-bottom: 0px;
  }

  /*
    Vibrant: False
    Selected: False
  */
  .menu-list-item-md:not(.vibrant):not(.selected) {
    --wa-color-text-normal: var(--text-color-expressive);
    --wa-color-neutral-fill-normal: rgba(
      from var(--ripple-hover-color-expressive) r g b / 0.08
    );
    color: var(--text-color-expressive);
  }

  /*
    Vibrant: False
    Selected: True
  */
  .menu-list-item-md.selected:not(.vibrant) {
    background-color: var(--background-color-expressive-active);
    --wa-color-text-normal: var(--text-color-expressive-active);
    --wa-color-neutral-fill-normal: rgba(
      from var(--ripple-hover-color-expressive-active) r g b / 0.08
    );
  }

  /*
    Vibrant: True
    Selected: False
  */
  .menu-list-item-md.vibrant:not(.selected) {
    --wa-color-text-normal: var(--text-color-expressive-vibrant);
    --wa-color-neutral-fill-normal: rgba(
      from var(--ripple-hover-color-expressive-vibrant) r g b / 0.08
    );
  }

  /*
    Vibrant: True
    Selected: True
  */
  .menu-list-item-md.vibrant.selected {
    background-color: var(--background-color-expressive-vibrant-active);
    --wa-color-text-normal: var(--text-color-expressive-vibrant-active);
    --wa-color-neutral-fill-normal: rgba(
      from var(--ripple-hover-color-expressive-vibrant-active) r g b / 0.08
    );
  }

  .menu-list-item-svg:not(.vibrant) {
    color: var(--md-sys-color-on-surface-variant);
    fill: var(--md-sys-color-on-surface-variant);
  }
  .menu-list-item-svg.vibrant {
    color: var(--md-sys-color-on-tertiary-container);
    fill: var(--md-sys-color-on-tertiary-container);
  }

  .menu-list-item-svg,
  .menu-list-item-image {
    margin-left: 14px;
    height: 3em;
    width: 3em;
  }
  .menu-list-item-image {
    border-radius: var(--media-row-thumbnail-border-radius);
  }
  .title {
    font-family: var(--expressive-font-family);
    font-variation-settings: "ROND" 100;
    font-size: 1.2em;
  }
`;
