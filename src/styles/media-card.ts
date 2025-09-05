import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  ha-control-button {
    width: 98%;
    height: 98%;
    margin: 1%;
  }
  .thumbnail {
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    margin: 0 6%;
    width: 50%;
    height: 50%;
    padding-bottom: 60%
  }
  .title {
    font-size: 1.2rem;
    text-transform: capitalize;
    position: absolute;
    width: 100%;
    line-height: 160%;
    bottom: 0;
    background-color: rgba(var(--rgb-card-background-color), 0.733);
  }
`;