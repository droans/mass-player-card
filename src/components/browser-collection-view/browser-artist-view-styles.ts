import { css } from "lit";

export default css`
  #artist-albums,
  #similar-artists {
    padding-left: 4px;
  }
  #tracks .label {
    padding-left: 4px;
    font-size: 1.5em;
    font-weight: 600;
    font-variation-settings: "ROND" 100;
    width: 100%;
    line-height: 1.5em;
  }
  #tracks.artist {
    overflow: unset;
    height: unset;
  }
  #tracks-container.artist {
    overflow: scroll;
    scrollbar-width: none;
  }
`;
