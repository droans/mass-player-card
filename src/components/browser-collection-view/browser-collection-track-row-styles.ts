import { css } from "lit";

export default css`
  mpc-menu-button::part(menu-select-menu) {
    --control-select-menu-background-opacity: 0;
    width: 2.5em;
    margin-top: var(--md-list-item-top-space);
    margin-bottom: var(--md-list-item-bottom-space);
  }
  .button.expressive {
    border-radius: var(--default-border-radius);
  }
  .button {
    border-radius: var(--media-row-border-radius);
    margin: 0.15rem;
    height: var(--media-row-height);
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
    padding-right: 8px;
    position: absolute;
    right: 0;
    place-content: center;
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
  .track-title.expressive {
    font-family: var(--expressive-font-family);
    font-variation-settings: "ROND" 100;
    font-size: 1.3em;
    font-stretch: 50%;
    font-weight: 450;
  }
  .track-artist.expressive {
    font-family: var(--expressive-font-family);
    font-variation-settings: "ROND" 100;
    font-size: 1.2em;
    font-stretch: 60%;
    font-weight: 350;
    font-style: italic;
  }
`;
