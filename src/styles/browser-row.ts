import { css } from "lit"

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  .action-button {
    width: var(--media-row-icon-width);
    transform: scale(1);
    align-content: center;
  }
  .button {
    margin: 0.25rem;
    border-radius: 0.7rem;
    background: var(--media-row-background-color);
    height: var(--media-row-height);
  }
  .button-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
  }
  .divider::before {
    content: " ";
    display: block;
    height: 1px;
    background-color: var(--divider-color);
    margin-left: 8px;
    margin-right: 8px;
  }
  .thumbnail {
    width: var(--media-row-thumbnail-height);
    height: var(--media-row-thumbnail-height);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: left;
    border-radius: 0.7rem;
  }
  .title {
    font-size: 1.1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    color: var(--font-color);
  }
`
