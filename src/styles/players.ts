import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  *[selected] {
    color: var(--accent-color);
  }
  *[hide] {
    display: none;
  }
  :host {
    --media-row-normal-border-radius: 8px;
    --media-row-end-border-radius: var(--default-border-radius);
  }
  .player-row:first-of-type {
    --media-row-top-border-radius: var(--media-row-end-border-radius);
  }
  .player-row:last-of-type {
    --media-row-bottom-border-radius: var(--media-row-end-border-radius);
  }
  .player-row {
    --media-row-top-border-radius: var(--media-row-normal-border-radius);
    --media-row-bottom-border-radius: var(--media-row-normal-border-radius);
  }

  #container {
    overflow: hidden;
    width: 100%;
    justify-content: center;
    box-shadow: unset;
    height: 100%;
  }
  #container.expressive {
    border-radius: var(--expressive-border-radius-container);
  }
  .div-players-title {
    display: flex;
    padding-inline: 8px;
  }
  .players-title {
    font-size: 1.2rem;
    text-wrap: nowrap;
  }
  .div-players-title .divider {
    width: 100%;
    background-color: var(--divider-color);
    height: 1px;
    align-self: center;
    margin-left: 8px;
  }

  .header {
    display: flex;
    flex-direction: column;
    font-size: 1.5rem;
    text-align: center;
    font-weight: 600;
    padding-top: 12px;
    height: auto;
  }

  .main {
    display: flex;
    height: 100%;
    margin: auto;
    padding: 6px 16px 6px 16px;
    width: 100%;
    justify-content: space-around;
    overflow-x: scroll;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  .list {
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding-left: 4px;
    padding-right: 4px;
    border-radius: var(--players-border-radius-expressive, 28px);
  }
  .list:not(.padded) {
    --queue-height: calc(100% - 3.5em);
    height: var(--queue-height);
  }
  .list.padded {
    --queue-height: 100%;
    height: var(--mass-player-card-height);
  }
  .list.expressive {
    background-color: var(--md-sys-color-background);
  }
  .list:not(.expressive) {
    border-radius: var(--players-border-radius, 12px);
  }

  .name {
    font-weight: 300;
    font-size: var(--fontSize);
    line-height: var(--fontSize);
    cursor: pointer;
  }
  .title {
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
  }
`;
