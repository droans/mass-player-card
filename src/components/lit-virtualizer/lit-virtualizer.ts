import { LitVirtualizer } from "@lit-labs/virtualizer";

if (!customElements.get("lit-virtualizer")) {
  customElements.define("lit-virtualizer", LitVirtualizer);
}
