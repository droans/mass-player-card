import { css } from "lit";

export default css`
  #volume {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    padding-left: 2em;
    padding-right: 2em;
  }
  #button-power {
    margin-right: 1em;
  }
  #button-mute {
    margin-left: 1em;
  }
  #button-favorite {
    margin-left: 1em;
  }
  ha-control-slider {
    --control-slider-thickness: 2.25em;
    --control-slider-color: var(--md-sys-color-primary) !important;
  } 
`