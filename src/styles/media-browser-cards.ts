import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  :host {
    width: 100%;
  }
  .icons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow-y: scroll;
    height: 100%;
    width: 100%;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
`;