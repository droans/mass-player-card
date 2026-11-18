import { css } from "lit";

export default css`
  :host {
    --group-menu-width: 15rem;
    --group-menu-height: 3rem;
  }
  .audio-bars {
    width: 0.55rem;
    position: relative;
    right: -1rem;
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
  .audio-bars-div {
    place-self: end;
  }
  .audio-bars-inactive {
  }
  .controlling {
    font-weight: 700;
    font-variation-settings: "ROND" 100;
  }
  #container {
    margin: 4px;
    border-radius: 24px;
    background-color: var(--md-sys-color-secondary-container);
    padding-block: 1rem;
    color: var(--md-sys-color-on-secondary-container);
  }
  #group-dropdown {
  }
  .group-dropdown-item {
    width: var(--group-menu-width);
  }
  .group-label {
    padding-inline: 0.5rem 2.5rem;
    font-size: 1.3rem;
    font-variation-settings: "ROND" 100;
  }
  .player-group {
    justify-self: center;
    padding-top: 1rem;
  }
  .player-image {
  }
  .player-info {
    align-content: center;
    line-height: 1.8rem;
    width: 100%;
    overflow: hidden;
  }
  .player-name {
    font-size: 1.8rem;
    font-weight: 700;
    font-stretch: 75%;
    font-variation-settings: "ROND" 100;
    text-wrap: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .player-name-bars {
    width: 90%;
  }
  .player-overview {
    display: flex;
    padding-inline: 1rem;
    column-gap: 1rem;
  }
  .player-track-status {
    display: flex;
    gap: 0.25rem;
  }
  .thumbnail {
    height: calc(var(--media-row-thumbnail-height) * 1.5);
    border-radius: 50%;
  }
  #trigger-button {
    --used-button-border-radius: 1.5rem;
    --button-button-height: 3rem;
    --button-button-width: var(--group-menu-width);
    --button-padding-left: 8px;
    --button-padding-right: 4px;
    height: 100%;
    display: block;
  }
  .trigger-icon {
    height: 30px;
    width: 30px;
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
