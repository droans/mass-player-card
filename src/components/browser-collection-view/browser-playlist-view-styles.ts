import { css } from "lit";

export default css`
  #playlist-duration,
  #playlist-owner {
    font-size: 1em;
    margin-right: 0.5em;
    font-style: italic;
  }
  #playlist-duration::not(.expressive),
  #playlist-owner::not(.expressive) {
    font-family: "Roboto", sans-serif;
  }
  #playlist-duration.expressive,
  #playlist-owner.expressive {
    font-family: "Google Sans Flex", sans-serif;
  }
  #overview {
    position: relative;
  }
`;
