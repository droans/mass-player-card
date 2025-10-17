import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  :host {
    --me-font-color: var(--md-sys-color-on-primary-container);
    --me-icon-color: var(--md-sys-color-primary-container);
  }

  .action-button {
    width: var(--media-row-icon-width);
    transform: scale(1);
    align-content: center;
  }
  .action-button::part(base) {
    height: 30px;
    width: 30px;
    border-radius: 25%;
  }

  .action-button-expressive::part(base):hover {
    background-color: var(--md-sys-color-primary-container) !important;
    --inherited-background-color: var(--md-sys-color-primary-container) !important;
    box-shadow: var(--md-sys-elevation-level1);
    --ha-button-border-radius: var(--button-small-border-radius) !important;
  }
  .action-button-expressive::part(base) {
    box-shadow: var(--md-sys-elevation-level1);
    --ha-button-border-radius: var(--button-small-border-radius) !important;
    background-color: var(--me-icon-color);
  }

  .button-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    height: 48px;
    right: 0;
    padding-right: 16px;
    position: absolute;
  }

  .button {
    margin: 0.15rem;
    border-radius: 0.7rem;
    background: var(--media-row-background-color);
    height: var(--media-row-height);
  }

  .button-active {
    margin: 0.15rem;
    border-radius: 0.7rem;
    background-color: var(--media-row-background-color-active, var(--md-sys-color-secondary-container));
    height: var(--media-row-height);
    padding-inline-start: 0px;
    padding-inline-end: 8px;
    color: var(--accent-color);
  }

  .button-expressive {
    background-color: var(--expressive-media-row-color);
  }
  .button-expressive > .title {
    color: var(--expressive-media-row-color-text);
  }
  .button-expressive-active {
    background-color: var(--expressive-media-row-color-active);
    --primary-text-color: var(--me-font-color) !important;
    --font-color: var(--me-font-color) !important;
  }
  .button-expressive-active > .title {
    color: var(--expressive-media-row-color-text-active);
  }

  .divider::before {
    content: " ";
    display: block;
    height: 1px;
    background-color: var(--divider-color);
    margin-left: 8px;
    margin-right: 8px;
  }

  .headline-expressive {
    color: var(--expressive-media-row-color-text);
  }
  .headline-expressive-active {
    color: var(--expressive-media-row-color-text-active);
  }

  .svg-action-button {
    height: 1.5rem;
    width: 1.5rem;
  }
  .svg-action-button-expressive {
    color: var(--me-font-color);
  }

  .thumbnail {
    width: var(--media-row-thumbnail-height);
    height: var(--media-row-thumbnail-height);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: left;
    border-radius: 0.7rem;
  }
  .thumbnail-disabled {
    width: var(--media-row-thumbnail-height);
    height: var(--media-row-thumbnail-height);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: left;
    border-radius: 0.7rem;
    filter: opacity(0.5);
  }

  .title {
    font-size: 1.1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    color: var(--font-color);
  }
`;