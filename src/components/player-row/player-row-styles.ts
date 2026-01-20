import { css } from "lit";

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
  .action-button::part(button) {
    --button-button-height: 38px;
    --button-button-width: 38px;
    --button-border-radius: 25%;
  }

  .action-button-expressive::part(button) {
    --button-border-radius: var(--button-small-border-radius) !important;
  }
  .action-button-expressive:first-of-type::part(button) {
    --button-border-radius: var(--button-small-border-radius) 4px 4px
      var(--button-small-border-radius) !important;
  }
  .action-button-expressive:first-of-type::part(button):hover {
    --button-border-radius: var(--button-small-border-radius) !important;
  }
  .action-button-expressive:last-of-type::part(button) {
    --button-border-radius: 4px var(--button-small-border-radius)
      var(--button-small-border-radius) 4px !important;
  }
  .action-button-expressive:last-of-type::part(button):hover {
    --button-border-radius: var(--button-small-border-radius) !important;
  }
  .action-button-expressive:only-of-type::part(button) {
    --button-border-radius: var(--button-small-border-radius) !important;
  }

  .audio-bars {
    width: 0.55rem;
    position: absolute;
    right: 1rem;
    height: 100%;
    margin-left: 1rem;
  }
  .audio-bars > div {
    bottom: 0.05rem;
    height: 0.15rem;
    position: absolute;
    width: 0.15rem;
    display: block;
    animation: player-active 0ms -800ms linear infinite alternate;
  }
  .audio-bars-normal > div {
    --start-color: var(--audio-bars-color);
    --mid-color: var(--audio-bars-color);
    --end-color: var(--audio-bars-color);
  }
  .audio-bars-expressive > div {
    --start-color: var(--expressive-audio-bars-initial-color);
    --mid-color: var(--expressive-audio-bars-middle-color);
    --max-color: var(--expressive-audio-bars-max-color);
  }
  .audio-bars > div:first-child {
    left: 8px;
    animation-duration: 474ms;
  }
  .audio-bars > div:nth-child(2) {
    left: 12px;
    animation-duration: 433ms;
  }
  .audio-bars > div:nth-child(3) {
    left: 16px;
    animation-duration: 407ms;
  }
  .audio-bars > div:last-child {
    left: 20px;
    animation-duration: 375ms;
  }

  .button-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 2px;
    height: 48px;
    right: 0;
    padding-right: 16px;
    position: absolute;
  }

  .button {
    margin: 0.15rem;
    border-radius: var(--player-row-border-radius);
    height: var(--media-row-height);
  }

  .button-active {
    margin: 0.15rem;
    border-radius: var(--player-row-border-radius);
    background-color: var(
      --media-row-active-background-color,
      var(--md-sys-color-secondary-container)
    );
    height: var(--media-row-height);
    padding-inline-start: 0px;
    padding-inline-end: 8px;
    color: var(--accent-color);
  }

  .button-expressive {
    background-color: var(--expressive-row-color) !important;
    --md-list-item-hover-state-layer-color: var(--md-sys-color-on-surface);
    border-radius: var(--default-border-radius);
    --md-ripple-hover-color: var(--md-sys-color-on-surface);
    --md-ripple-pressed-color: var(--md-sys-color-on-surface);
  }
  .button-expressive > .title {
    color: var(--expressive-row-color-text);
  }
  .button-expressive-active {
    --primary-text-color: var(--expressive-row-active-color-text) !important;
    --font-color: var(--expressive-row-active-color-text) !important;
    background-color: var(--expressive-row-active-color) !important;
    border-radius: var(--default-border-radius);
    --md-ripple-hover-color: var(--md-sys-color-on-surface);
    --md-ripple-pressed-color: var(--md-sys-color-on-surface);
  }
  .button-expressive-active > .title {
    color: var(--expressive-row-active-color-text);
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

  .headline-expressive {
    color: var(--expressive-row-color-text);
  }
  .headline-expressive-active {
    color: var(--expressive-row-color-text-active);
  }

  .svg-action-button {
    height: var(--row-icon-button-height);
    width: var(--row-icon-button-height);
    color: var(
      --md-sys-color-on-secondary-container,
      var(--md-sys-color-on-secondary-container)
    ) !important;
  }
  .svg-action-button-expressive {
    color: var(--expressive-row-button-color-text);
  }
  .svg-action-button-expressive:hover {
    color: var(--expressive-row-button-color-text-hover);
  }

  .thumbnail,
  .thumbnail-disabled {
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }

  .thumbnail {
    width: var(--media-row-thumbnail-height);
    height: var(--media-row-thumbnail-height);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: left;
    border-radius: 0.7rem;
    margin-left: 14px;
  }
  .thumbnail-disabled {
    width: var(--media-row-thumbnail-height);
    height: var(--media-row-thumbnail-height);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: left;
    border-radius: 0.7rem;
    filter: opacity(0.5);
    margin-left: 14px;
  }

  .title {
    font-size: 1.1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    color: var(--font-color);
    width: fit-content;
  }
  .title-bars {
    display: flex;
    flex-direction: row;
    position: relative;
  }

  @keyframes player-active {
    0% {
      height: 4px;
      background-color: var(--start-color);
    }
    50% {
      height: 14px;
      background-color: var(--mid-color);
    }
    100% {
      height: 24px;
      background-color: var(--max-color);
    }
  }
`;
