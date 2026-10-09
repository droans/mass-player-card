import { LitVirtualizer } from "@lit-labs/virtualizer/LitVirtualizer.js";

if (!customElements.get("mass-player-virtualizer")) {
  customElements.define("mass-player-virtualizer", LitVirtualizer);
}
