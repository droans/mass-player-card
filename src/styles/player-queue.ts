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

  .button-min {
    height: 35px;
    width: 35px;
    --wa-color-fill-quiet: rgba(from var(--md-sys-color-primary) r g b / 0.1);
    position: relative;
  }
  .button-min::part(base) {
    --wa-form-control-padding-inline: 0px;
    height: 35px;
    width: 35px;
  }
  .button-expressive::part(base) {
    box-shadow: var(--md-sys-elevation-level1);
    border-radius: var(--button-small-border-radius) !important;
    background-color: var(--md-sys-color-secondary-container);
  }

  #container {
    overflow: hidden;
    width: 100%;
    justify-content: center;
    box-shadow: unset;
    height: var(--mass-player-card-height);
  }
  .container-expressive {
    border-radius: var(--expressive-border-radius-container);
    background-color: var(--expressive-color-container);
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

  .list {
    height: calc(var(--mass-player-card-height) - 4em);
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
    border-radius: var(--queue-border-radius, 12px);
  }
  .list-expressive {
    background-color: var(--md-sys-color-background);
    border-radius: var(--expressive-border-radius-container);
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
