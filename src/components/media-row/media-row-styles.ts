import { css } from "lit";

export default css`
  .action-button {
    width: var(--media-row-icon-width);
    align-content: center;
  }
  .action-button:not(.expressive)::part(button) {
    --button-button-height: 38px;
    --button-button-width: 38px;
  }
  .action-button.expressive {
    --button-border-radius: 8px !important;
    --ha-button-start-border-radius: 8px !important;
    --ha-button-end-border-radius: 8px !important;
    --button-button-height: 48px;
    --used-button-height: 48px;
  }
  .action-button.expressive:hover {
    background-color: var(--expressive-row-button-color-hover) !important;
    --button-border-radius: 16px !important;
    transition: border-radius background-color var(--animation-duration);
    --ha-button-start-border-radius: 16px !important;
    --ha-button-end-border-radius: 16px !important;
  }
  .action-button.expressive:first-of-type {
    --button-border-radius: 24px 8px 8px 24px !important;
    --ha-button-start-border-radius: 24px !important;
    --ha-button-end-border-radius: 8px !important;
  }
  .action-button.expressive:first-of-type:hover {
    --button-border-radius: 24px 16px 16px 24px !important;
    --ha-button-end-border-radius: 16px !important;
  }
  .action-button.expressive:last-of-type {
    --button-border-radius: 8px 24px 24px 8px !important;
    --ha-button-start-border-radius: 8px !important;
    --ha-button-end-border-radius: 24px !important;
  }
  .action-button.expressive:last-of-type:hover {
    --button-border-radius: 16px 24px 24px 16px !important;
    --ha-button-start-border-radius: 16px !important;
  }
  .action-button.expressive:only-of-type {
    --button-border-radius: 16px !important;
    --ha-button-start-border-radius: 16px !important;
    --ha-button-end-border-radius: 16px !important;
    --button-button-width: 48px;
    --used-button-width: 48px;
  }
  .action-button.expressive:only-of-type:hover {
    --button-border-radius: 16px !important;
  }

  .button {
    margin: 0.15rem;
    height: var(--media-row-height);
  }
  .button.expressive {
    border-radius: var(--default-border-radius);
  }
  .button:not(.expressive) {
    border-radius: var(--media-row-border-radius);
  }
  .button.active {
    margin: 0.15rem;
    background-color: var(
      --media-row-active-background-color,
      var(--md-sys-color-secondary-container)
    );
    height: var(--media-row-height);
    padding-inline-start: 0px;
    color: var(--accent-color);
  }
  .button.active :host {
    --md-sys-color-primary: unset;
  }

  .button.expressive {
    background-color: var(--expressive-row-color) !important;
    --md-list-item-hover-state-layer-color: var(--md-sys-color-on-surface);
    border-radius: var(--default-border-radius);
    --md-ripple-hover-color: var(--md-sys-color-on-surface);
    --md-ripple-pressed-color: var(--md-sys-color-on-surface);
  }
  .button.expressive > .title {
    color: var(--expressive-row-color-text);
  }

  .button.expressive.active {
    --primary-text-color: var(--expressive-row-active-color-text) !important;
    --font-color: var(--expressive-row-active-color-text) !important;
    background-color: var(--expressive-row-active-color) !important;
    border-radius: var(--default-border-radius);
    --md-ripple-hover-color: var(--md-sys-color-on-surface);
    --md-ripple-pressed-color: var(--md-sys-color-on-surface);
  }
  .button.expressive.active > .title {
    color: var(--expressive-row-active-color-text);
  }

  .button-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 2px;
    height: 48px;
    right: 8px;
    padding-right: 8px;
    position: absolute;
  }

  .divider {
    --divider-color: var(--md-sys-color-surface-variant);
  }
  .divider::before {
    content: " ";
    display: block;
    height: 1px;
    background-color: var(--divider-color);
    margin-left: 64px;
    margin-right: 24px;
  }
  .hide-covers .title {
    margin-left: 14px;
  }

  .svg-action-button {
    height: var(--row-icon-button-height);
    width: var(--row-icon-button-height);
    color: var(
      --md-sys-color-on-secondary-container,
      var(--md-sys-color-on-secondary-container)
    ) !important;
  }
  .svg-action-button.expressive {
    color: var(--expressive-row-button-color-text);
  }
  .svg-action-button.expressive:hover {
    color: var(--expressive-row-button-color-text-hover);
    transition: color var(--animation-duration);
  }

  .thumbnail {
    width: var(--media-row-thumbnail-height);
    height: var(--media-row-thumbnail-height);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: left;
    border-radius: var(--media-row-thumbnail-border-radius);
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }
  .thumbnail.disabled {
    opacity: 0.38;
  }

  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    color: var(--font-color);
  }
  .title.expressive {
    font-family: var(--expressive-font-family);
    font-variation-settings: "ROND" 100;
    text-transform: uppercase;
  }
  .title.track.expressive {
    font-size: 1.3em;
    font-stretch: 25%;
    font-weight: 500;
  }
  .title.artist.expressive {
    font-size: 1.2em;
    font-stretch: 30%;
    font-weight: 275;
  }
  .title.disabled {
    opacity: 0.38;
  }
`;
