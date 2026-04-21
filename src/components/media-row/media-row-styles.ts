import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  .action-button {
    width: var(--media-row-icon-width);
    align-content: center;
  }
  .action-button::part(button) {
    --button-button-height: 38px;
    --button-button-width: 38px;
  }
  .action-button.expressive::part(button) {
    --button-border-radius: 4px !important;
  }
  .action-button.expressive::part(button):hover {
    background-color: var(--expressive-row-button-color-hover) !important;
    --button-border-radius: var(--button-small-border-radius) !important;
  }
  .action-button.expressive:first-of-type::part(button) {
    --button-border-radius: var(--button-small-border-radius) 4px 4px
      var(--button-small-border-radius) !important;
  }
  .action-button.expressive:first-of-type::part(button):hover {
    --button-border-radius: var(--button-small-border-radius) !important;
  }
  .action-button.expressive:last-of-type::part(button) {
    --button-border-radius: 4px var(--button-small-border-radius)
      var(--button-small-border-radius) 4px !important;
  }
  .action-button.expressive:last-of-type::part(button):hover {
    --button-border-radius: var(--button-small-border-radius) !important;
  }
  .action-button.expressive:only-of-type::part(button) {
    --button-border-radius: var(--button-small-border-radius) !important;
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
    right: 0;
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
  }

  .thumbnail,
  .thumbnail-disabled {
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
  .thumbnail-disabled {
    opacity: 0.38;
  }

  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    color: var(--font-color);
  }
  .title.track.expressive {
    font-family:
      "Google Sans Flex", "Roboto Flex", var(--ha-font-family-body), "Roboto",
      sans-serif !important;
    font-variation-settings: "ROND" 100;
    font-size: 1.3em;
    font-stretch: 50%;
    font-weight: 450;
  }
  .title.artist.expressive {
    font-family:
      "Google Sans Flex", "Roboto Flex", var(--ha-font-family-body), "Roboto",
      sans-serif !important;
    font-variation-settings: "ROND" 100;
    font-size: 1.2em;
    font-stretch: 60%;
    font-weight: 350;
    font-style: italic;
  }
  .title-disabled {
    opacity: 0.38;
  }
`;
