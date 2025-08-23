import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  .button {
    margin: 0.15rem;
    border-radius: 0.7rem;
    background: var(--media-row-background-color);
    height: var(--media-row-height);
  }
  .button-active {
    margin: 0.15rem;
    border-radius: 0.7rem;
    background-color: var(--media-row-background-color-active)
    height: var(--media-row-height);
    --font-color: var(--mdc-theme-primary);
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
  .title {
    font-size: 1.1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    color: var(--font-color);
  }
`;