import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  :host {
    --media-row-normal-border-radius: 8px;
    --media-row-end-border-radius: var(--default-border-radius);
  }
  *[selected] {
    color: var(--accent-color);
  }
  *[hide] {
    display: none;
  }
  lit-virtualizer {
    height: calc(var(--queue-height) - 8px);
    scrollbar-width: none;
  }
  mpc-queue-media-row {
    width: 100%;
    margin-bottom: 4px;
  }
  mpc-queue-media-row:first-child() {
    --media-row-top-border-radius: var(--media-row-end-border-radius);
  }
  mpc-queue-media-row {
    --media-row-top-border-radius: var(--media-row-normal-border-radius);
    --media-row-bottom-border-radius: var(--media-row-normal-border-radius);
    border-top-left-radius: var(--media-row-top-border-radius);
    border-top-right-radius: var(--media-row-top-border-radius);
    border-bottom-left-radius: var(--media-row-bottom-border-radius);
    border-bottom-right-radius: var(--media-row-bottom-border-radius);
    background-color: var(--expressive-row-color) !important;
  }
  mpc-queue-media-row.active {
    --media-row-top-border-radius: var(--media-row-end-border-radius);
    --media-row-bottom-border-radius: var(--media-row-end-border-radius);
    margin-top: 16px;
    background-color: var(--expressive-row-active-color) !important;
  }
  mpc-queue-media-row.first {
    --media-row-top-border-radius: var(--default-border-radius);
  }
  mpc-queue-media-row.played.last {
    --media-row-bottom-border-radius: var(--default-border-radius);
  }
  .button.min {
    --button-button-height: 35px;
    --button-button-width: 35px;
    --button-padding: 0px;
    position: relative;
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
    background-color: var(
      --expressive-color-container,
      var(--ha-card-background)
    );
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
  .header-icon {
    height: 30px;
    width: 30px;
  }
  .list {
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding-left: 4px;
    padding-right: 4px;
    border-radius: var(--queue-border-radius-expressive, 28px);
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
  .ist:not(.expressive) {
    border-radius: var(--queue-border-radius, 12px);
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
  .media-row.up-next {
    width: 100%;
    display: flex;
    flex-direction: row;
  }
  .media-row.up-next .up-next-title {
    padding-inline-start: 8px;
    font-size: 1.2em;
    padding-top: 8px;
    padding-bottom: 8px;
    width: max-content;
    text-wrap: nowrap;
  }
  .media-row.up-next .divider {
    width: 100%;
    background-color: var(--divider-color);
    height: 1px;
    align-self: center;
    margin-left: 8px;
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
  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;
