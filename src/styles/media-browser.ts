import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  ha-card {
    box-shadow: unset;
    height: var(--mass-player-card-height);
  }
.header {
  padding-top: 12px;
  height: auto;
  display: flex;
}
  #title {
    width: 100%;
    text-transform: capitalize;
    font-size: 1.5rem;
    text-align: center;
    font-weight: 600;
  }
  #back-button {
    margin-left: 1em;
    height: 1em;
    width: 1em;
    margin-top: -2px
  }
`;