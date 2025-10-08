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
  }
  .action-button {
    width: var(--media-row-icon-width);
    transform: scale(1);
    align-content: center;
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
`;