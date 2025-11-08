import { css } from "lit";

export default css`
  .button-min {
    height: 40px;
    width: 40px;
    --wa-color-fill-quiet: rgba(from var(--md-sys-color-primary) r g b / 0.1);
  }
  .button-min::part(base) {
    --wa-form-control-padding-inline: 0px;
  }

  #button-favorite {
    margin-left: 1em;
  }
  #button-mute {
    margin-left: 1em;
  }
  #button-power {
    margin-right: 1em;
  }
  
  #div-slider {
    width: 100%;
    height: var(--player-volume-slider-height);
    position: relative;
  }

  .svg-plain {
    color: var(--md-sys-color-primary);
    height: 3em;
    width: 3em;
  }

  #ticks {
    height: var(--player-volume-slider-height);
    width: inherit;
    position: absolute;
    display: flex;
    justify-content: space-evenly;
    top: 0;
    align-items: center;
    pointer-events: none;
  }
  .tick {
    width: 1%;
    aspect-ratio: 1;
    display: inline-flex;
    flex-direction: row;
    vertical-align: bottom;
    position: relative;
    height: max-content;
    border-radius: 50%;

  }
  .tick-in {
    background-color: var(--md-sys-color-on-primary)
  }
  .tick-out {
    background-color: var(--md-sys-color-on-primary-container)
  }

  #volume {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    padding-left: 2em;
    padding-right: 2em;
  }

  #volume-slider {
    --control-slider-thickness: 2.25em;
    border-radius: 10px;
    --disabled-color: var(--control-slider-color);
    height: var(--player-volume-slider-height);
  } 
  .volume-slider-expressive {
    --control-slider-color: var(--md-sys-color-primary);
    box-shadow: var(--md-sys-elevation-level1);
  }
`