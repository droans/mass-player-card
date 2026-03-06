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
  /* 
    Expressive: True
  */
  .menu-list-item-md.expressive {
    border-radius: 1.5em;
  }
  .menu-list-item-md.expressive {
    padding-top: 0px;
    padding-bottom: 0px;
  }

  /* 
    Expressive: True
    Vibrant: False
    Selected: False
  */
  .menu-list-item-md.expressive:not(.vibrant):not(.selected) {
    --wa-color-text-normal: var(--text-color-expressive);
    --wa-color-neutral-fill-normal: rgba(
      from var(--ripple-hover-color-expressive) r g b / 0.08
    );
  }
  .menu-list-item-md:not(.vibrant):not(.selected) {
    color: var(--text-color-expressive);
  }

  /* 
    Expressive: True
    Vibrant: False
    Selected: True
  */
  .menu-list-item-md.expressive.selected:not(.vibrant) {
    background-color: var(--background-color-expressive-active);
    --wa-color-text-normal: var(--text-color-expressive-active);
    --wa-color-neutral-fill-normal: rgba(
      from var(--ripple-hover-color-expressive-active) r g b / 0.08
    );
  }

  /* 
    Expressive: True
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
    Expressive: True
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

  .menu-list-item-svg.expressive:not(.vibrant) {
    color: var(--md-sys-color-on-surface-variant);
    fill: var(--md-sys-color-on-surface-variant);
  }
  .menu-list-item-svg.expressive.vibrant {
    color: var(--md-sys-color-on-tertiary-container);
    fill: var(--md-sys-color-on-tertiary-container);
  }

  .menu-list-item-svg.expressive,
  .menu-list-item-image.expressive {
    margin-left: 14px;
    height: 3em;
    width: 3em;
  }
  .menu-list-item-svg:not(.expressive),
  .menu-list-item-image:not(.expressive) {
    height: 2em;
    width: 2em;
    margin-left: 12px;
  }
  .menu-list-item-image.expressive {
    border-radius: 12px;
  }
`;
