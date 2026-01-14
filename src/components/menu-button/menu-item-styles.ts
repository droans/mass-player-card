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

    --icon-color-normal-active: var(--mdc-theme-on-primary);
    --icon-color-expressive: var(--md-sys-color-on-surface-variant);
    --icon-color-expressive-vibrant: var(--md-sys-color-on-tertiary-container);
    --icon-color-expressive-active: var(--md-sys-color-on-surface);
    --icon-color-expressive-vibrant-active: var(--md-sys-color-on-tertiary);

    --ripple-hover-color-expressive: var(--md-sys-color-on-surface);
    --ripple-hover-color-expressive-vibrant: var(
      --md-sys-color-on-tertiary-container
    );
    --ripple-hover-color-expressive-active: var(--md-sys-color-on-surface);
    --ripple-hover-color-expressive-vibrant-active: var(
      --md-sys-color-on-tertiary-container
    );

    --ripple-pressed-color-expressive: var(--md-sys-color-on-surface);
    --ripple-pressed-color-expressive-vibrant: var(
      --md-sys-color-on-tertiary-container
    );
    --ripple-pressed-color-expressive-active: var(--md-sys-color-on-surface);
    --ripple-pressed-color-expressive-vibrant-active: var(
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
  .menu-list-item {
    --mdc-list-vertical-padding: 0px;
    --mdc-list-side-padding-left: var(--menu-item-padding-left);
  }
  /* 
    Expressive: False
    Selected: True
  */
  .menu-list-item.selected:not(.expressive) {
    --mdc-theme-text-icon-on-background: var(--icon-color-normal-active);
    --mdc-theme-text-primary-on-background: var(--text-color-normal-active);
    background-color: var(--background-color-normal-active);
  }
  /* 
    Expressive: True
  */
  .menu-list-item.expressive,
  .menu-list-item-md.expressive {
    border-radius: var(--default-border-radius);
  }
  .menu-list-item-md.expressive {
    --md-list-item-top-space: 0px;
    --md-list-item-bottom-space: 0px;
  }

  /* 
    Expressive: True
    Vibrant: False
    Selected: False
  */
  .menu-list-item.expressive:not(.vibrant):not(.selected) {
    --mdc-theme-text-primary-on-background: var(--text-color-expressive);
    --mdc-theme-text-icon-on-background: var(--icon-color-expressive);
    --md-ripple-hover-color: var(--ripple-hover-color-expressive);
    --md-ripple-pressed-color: var(--ripple-pressed-color-expressive);
  }
  .menu-list-item-md.expressive:not(.vibrant):not(.selected) {
    --md-list-item-label-text-color: var(--text-color-expressive);
    --md-list-item-leading-icon-color: var(--icon-color-expressive);
    --ha-ripple-hover-color: var(--ripple-hover-color-expressive);
    --ha-ripple-pressed-color: var(--ripple-pressed-color-expressive);
  }
  .title-md.expressive:not(.vibrant):not(.selected) {
    color: var(--text-color-expressive);
  }

  /* 
    Expressive: True
    Vibrant: False
    Selected: True
  */
  .menu-list-item.expressive.selected:not(.vibrant) {
    background-color: var(--background-color-expressive-active);
    --mdc-theme-text-primary-on-background: var(--text-color-expressive-active);
    --mdc-theme-text-icon-on-background: var(--icon-color-expressive-active);
    --md-ripple-hover-color: var(--ripple-hover-color-expressive-active);
    --md-ripple-pressed-color: var(--ripple-pressed-color-expressive-active);
  }
  .menu-list-item-md.expressive.selected:not(.vibrant) {
    background-color: var(--background-color-expressive-active);
    --md-list-item-label-text-color: var(--text-color-expressive-active);
    --md-list-item-leading-icon-color: var(--icon-color-expressive-active);
    --ha-ripple-hover-color: var(--ripple-hover-color-expressive-active);
    --ha-ripple-pressed-color: var(--ripple-pressed-color-expressive-active);
  }

  /* 
    Expressive: True
    Vibrant: True
    Selected: False
  */
  .menu-list-item.vibrant:not(.selected) {
    --mdc-theme-text-primary-on-background: var(
      --text-color-expressive-vibrant
    );
    --mdc-theme-text-icon-on-background: var(--icon-color-expressive-vibrant);
    --md-ripple-hover-color: var(--ripple-hover-color-expressive-vibrant);
    --md-ripple-pressed-color: var(--ripple-pressed-color-expressive-vibrant);
  }
  .menu-list-item-md.vibrant:not(.selected) {
    --md-list-item-label-text-color: var(--text-color-expressive-vibrant);
    --md-list-item-leading-icon-color: var(--icon-color-expressive-vibrant);
    --ha-ripple-hover-color: var(--ripple-hover-color-expressive-vibrant);
    --ha-ripple-pressed-color: var(--ripple-pressed-color-expressive-vibrant);
  }

  /* 
    Expressive: True
    Vibrant: True
    Selected: True
  */
  .menu-list-item.vibrant.selected {
    background-color: var(--background-color-expressive-vibrant-active);
    --mdc-theme-text-primary-on-background: var(
      --text-color-expressive-vibrant-active
    );
    --mdc-theme-text-icon-on-background: var(
      --icon-color-expressive-vibrant-active
    );
    --md-ripple-hover-color: var(
      --ripple-hover-color-expressive-vibrant-active
    );
    --md-ripple-pressed-color: var(
      --ripple-pressed-color-expressive-vibrant-active
    );
  }
  .menu-list-item-md.vibrant.selected {
    background-color: var(--background-color-expressive-vibrant-active);
    --md-list-item-label-text-color: var(
      --text-color-expressive-vibrant-active
    );
    --md-list-item-leading-icon-color: var(
      --icon-color-expressive-vibrant-active
    );
    --ha-ripple-hover-color: var(
      --ripple-hover-color-expressive-vibrant-active
    );
    --ha-ripple-pressed-color: var(
      --ripple-pressed-color-expressive-vibrant-active
    );
  }

  .svg.expressive {
    margin-left: 14px;
  }
  .title.expressive {
    margin-left: 1em;
  }

  .title-md {
    width: max-content;
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
