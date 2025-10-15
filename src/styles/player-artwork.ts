import { css } from "lit";

export default css`
  .artwork {
    border-radius: var(--ha-card-border-radius);
    max-width: 100%;
    justify-self: center;
    display: block;
  }
  .artwork-large {
  }
  .artwork-medium {

  }
  .artwork-small {

  }

  #carousel {
    --aspect-ratio: 1;
    position: absolute;
  }
  .carousel-large {
    height: var(--mass-player-card-height) !important;
    /* position: absolute; */
    aspect-ratio: 1;
    height: var(--mass-player-card-height);
    width: 100%;
    /* place-content: center; */
    /* top: -3em; */
    /* left: 0; */
  }
  .carousel-medium {
    height: 22em !important;
    aspect-ratio: 1;
    place-content: center;
    position: absolute;
    top: calc(50% - (22em / 2) - 2em);
  }
  .carousel-small {
    position: absolute;
    height: 14em;
    display: flex;
    aspect-ratio: 1;
    left: calc(50% - 7em);
    top: calc(50% - 7em);
  }
`