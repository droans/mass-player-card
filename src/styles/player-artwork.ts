import { css } from "lit";

export default css`
  .artwork {
    border-radius: var(--artwork-border-radius);
    max-width: 100%;
    justify-self: center;
    display: block;
  }
  .artwork-large {
    border-radius: var(--artwork-border-radius) var(--artwork-border-radius) 0px
      0px;
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
    width: 100%;
  }
  .carousel-medium {
    height: var(--artwork-medium-height);
    aspect-ratio: 1;
    place-content: center;
    position: absolute;
    top: calc(50% - (var(--artwork-medium-height) / 2) - 2em);
  }
  .carousel-small {
    position: absolute;
    height: var(--artwork-small-height);
    display: flex;
    aspect-ratio: 1;
    left: calc(50% - (var(--artwork-small-height) / 2));
    top: calc(50% - (var(--artwork-small-height) / 2));
  }
`;
