import { LitVirtualizer } from "@lit-labs/virtualizer/LitVirtualizer.js";

if (!customElements.get("lit-virtualizer")) {
  customElements.define("lit-virtualizer", LitVirtualizer);
}
