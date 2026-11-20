import { css } from "lit";

export default css`
  #artist-albums,
  #similar-artists {
    padding-left: 4px;
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
