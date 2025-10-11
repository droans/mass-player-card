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

  .svg-plain {
    color: var(--md-sys-color-primary);
    height: 3em;
    width: 3em;
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
    --control-slider-color: var(--md-sys-color-primary);
    border-radius: 10px;
  } 
  .volume-slider-expressive {
    box-shadow: var(--md-sys-elevation-level1);
  }
`