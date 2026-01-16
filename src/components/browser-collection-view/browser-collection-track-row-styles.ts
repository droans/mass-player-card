import { css } from "lit";

export default css`
  ha-md-list-item {
    --md-list-item-top-space: 6px;
    --md-list-item-bottom-space: 6px;
    --md-list-item-trailing-space: 0px;
  }
  mass-menu-button::part(menu-select-menu) {
    --control-select-menu-background-opacity: 0;
    width: 2.5em;
    margin-top: var(--md-list-item-top-space);
    margin-bottom: var(--md-list-item-bottom-space);
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
  .menu-button {
    height: 100%;
  }
  .thumbnail {
    width: var(--media-row-thumbnail-height);
    height: var(--media-row-thumbnail-height);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: left;
    border-radius: var(--media-row-border-radius);
    margin-left: 14px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }
`;
