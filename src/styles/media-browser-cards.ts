import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  ha-card {
    height: var(--mass-player-card-height);
    overflow-y: scroll;
    box-shadow: unset;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    margin: 6px;
  }
  :host {
    width: 100%;
  }
  .icons {
    display: grid;
    grid-template-columns: 50% 50%;
    overflow-y: scroll;
    height: calc(var(--mass-player-card-height) - 4em);
    width: 100%;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
`;