import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  :host {
    width: 100%;
  }
  mass-media-card {
    max-height: 100%;
    aspect-ratio: 1;
    width: 30em;
    justify-content: center;
  }
  .icons {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
    row-gap: 20px;
    overflow-y: scroll;
    max-height: calc(var(--mass-player-card-height) - 4em);
    scrollbar-width: none;
  }
`;