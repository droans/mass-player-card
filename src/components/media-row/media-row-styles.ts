import { css } from "lit";

export default css`
  :host {
    --primary-text-color: var(--md-sys-color-on-surface);
    --ha-ripple-hover-color: var(--md-sys-color-on-surface);
    --animation-duration: 0.25s;
  }
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
    --button-button-height: 40px;
    --used-button-height: 40px;
    --button-padding-left: 8px;
    --button-padding-right: 8px;
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
  #action-buttons-row {
    --ha-row-item-padding-block: 0px;
  }
  #action-buttons-div.open,
  #action-buttons-headline.open {
    height: var(--media-row-height);
    transition: height var(--animation-duration);
  }
  #action-buttons-div.closed,
  #action-buttons-headline.closed {
    height: 0px;
    transition: height var(--animation-duration);
  }
  #action-buttons-headline {
    place-self: center;
    padding-block-end: 8px;
  }

  .button {
    margin: 0.15rem;
  }
  .button::part(base) {
    height: var(--media-row-height);
    padding-inline: 6px;
  }
  .button.expressive {
    --md-list-item-leading-space: 0px;
  }
  .button.expressive::part(base) {
    border-top-left-radius: var(
      --media-row-top-border-radius,
      var(--default-border-radius)
    );
    border-top-right-radius: var(
      --media-row-top-border-radius,
      var(--default-border-radius)
    );
    border-bottom-left-radius: var(
      --media-row-bottom-border-radius,
      var(--default-border-radius)
    );
    border-bottom-right-radius: var(
      --media-row-bottom-border-radius,
      var(--default-border-radius)
    );
  }
  .button:not(.expressive)::part(base) {
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
    border-top-left-radius: var(
      --media-row-top-border-radius,
      var(--default-border-radius)
    );
    border-top-right-radius: var(
      --media-row-top-border-radius,
      var(--default-border-radius)
    );
    border-bottom-left-radius: var(
      --media-row-bottom-border-radius,
      var(--default-border-radius)
    );
    border-bottom-right-radius: var(
      --media-row-bottom-border-radius,
      var(--default-border-radius)
    );
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
    right: 4px;
    position: absolute;
  }
  .chevron-div {
    width: 56px;
  }
  .chevron-icon {
    height: 30px;
    width: 30px;
  }

  #headline {
    line-height: 1.5em;
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
