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
  .asleep {
    height: 100%;
    width: 100%;
  } 
  .asleep-expressive {
    color: rgba(from var(--md-sys-color-primary) r g b / 0.7);
  }

  #carousel {
    --aspect-ratio: 1;
    position: absolute;
  }
  .carousel-large {
    height: var(--mass-player-card-height) !important;
    aspect-ratio: 1;
    height: var(--mass-player-card-height);
    width: 100%;
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