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
  #volume-slider {
    --control-slider-thickness: 2.25em;
    --control-slider-color: var(--md-sys-color-primary);
  } 
  .button-min::part(base) {
    --wa-form-control-padding-inline: 0px;
  }
  .button-min {
    height: 40px;
    width: 40px;
  }
`