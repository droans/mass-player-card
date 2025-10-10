import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  :host {
    --me-font-color: var(--md-sys-color-primary);
    --me-icon-color: var(--md-sys-color-primary);
  }
  .button {
    margin: 0.15rem;
    border-radius: 0.7rem;
    background: var(--media-row-background-color);
    height: var(--media-row-height);
  }
  .button-expressive {
    background-color: var(--expressive-media-row-color);
  }
  .button-expressive-active {
    background-color: var(--expressive-media-row-color-active);
  }
  .button-expressive > .title {
    color: var(--expressive-media-row-color-text);
  }
  .button-expressive-active > .title {
    color: var(--expressive-media-row-color-text-active);
  }
  .button-active {
    margin: 0.15rem;
    border-radius: 0.7rem;
    background-color: var(--media-row-background-color-active, var(--md-sys-color-secondary-container));
    height: var(--media-row-height);
    --primary-text-color: var(--me-font-color) !important;
    --font-color: var(--me-font-color) !important;
    padding-inline-start: 0px;
    padding-inline-end: 8px;
    color: var(--accent-color);
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
  .action-button {
    width: var(--media-row-icon-width);
    transform: scale(1);
    align-content: center;
  }
  .action-button-expressive::part(base):hover {
    background-color: var(--md-sys-color-primary-container) !important;
    --inherited-background-color: var(--md-sys-color-primary-container) !important;
    box-shadow: var(--md-sys-elevation-level1);
    border-radius: 25%;
  }
  .action-button::part(base) {
    height: 30px;
    width: 30px;
  }
  .title {
    font-size: 1.1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    color: var(--font-color);
  }
  .divider::before {
    content: " ";
    display: block;
    height: 1px;
    background-color: var(--divider-color);
    margin-left: 8px;
    margin-right: 8px;
  }
  .svg-action-button {
    height: 1.5rem;
    width: 1.5rem;
    color: var(--me-icon-color);
  }
  .headline-expressive {
    color: var(--expressive-media-row-color-text);
  }
  .headline-expressive-active {
    color: var(--expressive-media-row-color-text-active);
  }
`;