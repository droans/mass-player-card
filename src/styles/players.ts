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

  #container {
    overflow: hidden;
    width: 100%;
    justify-content: center;
    box-shadow: unset;
    height: var(--mass-player-card-height);
  }
  .container-expressive {
    border-radius: var(--expressive-border-radius-container);
    background-color: var(
      --expressive-color-container,
      var(--ha-card-background)
    );
  }

  .header {
    display: flex;
    flex-direction: column;
    height: 100%;
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
  }
  .list-expressive {
    background-color: var(--md-sys-color-background);
    border-radius: var(--expressive-border-radius-container);
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
