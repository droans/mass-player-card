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

  .action-button-expressive::part(base) {
    box-shadow: var(--md-sys-elevation-level1);
    --ha-button-border-radius: var(--button-small-border-radius) !important;
    background-color: var(--expressive-row-button-color);
    --inherited-background-color: var(--expressive-row-button-color);
  }
  .action-button-expressive::part(base):hover {
    background-color: var(--expressive-row-button-color-hover) !important;
    --inherited-background-color: var(--expressive-row-button-color-hover) !important;
    box-shadow: var(--md-sys-elevation-level1);
    --ha-button-border-radius: var(--button-small-border-radius) !important;
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
    border-radius: var(--player-row-border-radius);
    background: var(--media-row-background-color);
    height: var(--media-row-height);
  }

  .button-active {
    margin: 0.15rem;
    border-radius: var(--player-row-border-radius);
    background-color: var(--media-row-active-background-color, var(--md-sys-color-secondary-container));
    height: var(--media-row-height);
    padding-inline-start: 0px;
    padding-inline-end: 8px;
    color: var(--accent-color);
  }

  .button-expressive {
    background-color: var(--expressive-row-color) !important;
  }
  .button-expressive > .title {
    color: var(--expressive-row-color-text);
  }
  .button-expressive-active {
    --primary-text-color: var(--expressive-row-active-color-text) !important;
    --font-color: var(--expressive-row-active-color-text) !important;
    background-color: var(--expressive-row-active-color) !important;
  }
  .button-expressive-active > .title {
    color: var(--expressive-row-active-color-text);
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
    color: var(--expressive-row-color-text);
  }
  .headline-expressive-active {
    color: var(--expressive-row-color-text-active);
  }

  .svg-action-button {
    height: var(--row-icon-button-height);
    width: var(--row-icon-button-height);
  }
  .svg-action-button-expressive {
    color: var(--expressive-row-button-color-text);
  }
  .svg-action-button-expressive:hover {
    color: var(--expressive-row-button-color-text-hover)
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