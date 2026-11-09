import { createServer } from "node:http";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { rollup } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

const entry = resolve("folders-preview-entry.js");
const imports = `
import { ContextProvider } from "@lit/context";
import { LitElement, html, svg, css } from "lit";
import { DEFAULT_CONFIG } from "./src/config/config.ts";
import { DEFAULT_MEDIA_BROWSER_CONFIG } from "./src/config/media-browser.ts";
import { getIcons } from "./src/const/icons.ts";
import * as contexts from "./src/const/context.ts";
import "./src/sections/media-browser.ts";
`;

function setupPreview() {
  class PreviewIcon extends LitElement {
    static properties = { path: {} };
    static styles = css`
      :host {
        display: inline-flex;
        width: 24px;
        height: 24px;
      }
      svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
      }
    `;
    render() {
      return svg`<svg viewBox="0 0 24 24"><path d=${this.path}></path></svg>`;
    }
  }
  customElements.define("ha-svg-icon", PreviewIcon);
  class PreviewDropdown extends LitElement {
    static properties = { open: { type: Boolean, reflect: true } };
    static styles = css`
      :host {
        display: block;
        position: relative;
      }
      .menu {
        display: none;
        position: absolute;
        right: 0;
        top: 40px;
        width: 280px;
        z-index: 20;
        background: white;
        box-shadow: 0 3px 14px #0004;
        border-radius: 4px;
        padding: 4px;
      }
      :host([open]) .menu {
        display: block;
      }
    `;
    constructor() {
      super();
      this.open = false;
    }
    render() {
      return html`<slot
          name="trigger"
          @click=${() => {
            this.open = !this.open;
          }}
        ></slot>
        <div class="menu"><slot></slot></div>`;
    }
  }
  customElements.define("ha-dropdown", PreviewDropdown);
  class PreviewDropdownItem extends LitElement {
    static styles = css`
      :host {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        cursor: pointer;
      }
      :host(:hover) {
        background: #eee;
      }
      ::slotted(ha-svg-icon) {
        width: 24px;
        height: 24px;
      }
    `;
    render() {
      return html`<slot name="icon"></slot><slot></slot>`;
    }
  }
  customElements.define("ha-dropdown-item", PreviewDropdownItem);

  const host = document.querySelector("#host");
  const config = {
    ...DEFAULT_CONFIG,
    expressive: false,
    media_browser: {
      ...DEFAULT_MEDIA_BROWSER_CONFIG,
      default_section: "folders",
    },
  };
  const folder = (name, path) => ({
    name,
    path,
    uri: "files://folder/" + name,
    media_type: "folder",
  });
  const track = (filename, name = filename) => ({
    name,
    uri: "files://track/Music/" + encodeURIComponent(filename),
    media_type: "track",
  });
  const listings = {
    root: [
      folder("Local Music", "files://Music"),
      folder("Radio Archive", "files://Radio"),
      folder("Empty", "files://Empty"),
    ],
    "files://Music": [
      folder("..", "root"),
      track("2 - Evening.flac", "A title"),
      track("01 - Opening.flac", "Z title"),
      folder("Live Recordings", "files://Music/Live"),
      track("10 - Interlude.flac"),
      track(
        "20 - A very long filename that must wrap cleanly on a narrow phone screen without pushing the queue menu outside its row.flac",
      ),
    ],
    "files://Music/Live": [
      folder("..", "files://Music"),
      track("02 - Encore.flac"),
      track("01 - Concert.flac"),
    ],
    "files://Radio": [track("Archive.mp3")],
    "files://Empty": [],
  };
  window.previewCalls = [];
  window.previewRequests = [];
  const hass = {
    language: "de",
    themes: { darkMode: false },
    states: {},
    async callWS(request) {
      window.previewRequests.push(request);
      if (request.type === "mass_queue/get_info")
        return { entries: { mass_queue: "fixture" } };
      return {
        response: { response: listings[request.service_data.data.path] ?? [] },
      };
    },
    async callService(...parameters) {
      window.previewCalls.push(parameters);
    },
  };
  const values = {
    hassContext: hass,
    configContext: config,
    mediaBrowserConfigContext: config.media_browser,
    mediaBrowserHiddenElementsConfigContext: config.media_browser.hide,
    activeEntityIDContext: "media_player.preview",
    activeEntityConfigContext: { entity_id: "media_player.preview" },
    browserControllerContext: { _host: host, massUser: "listener" },
    IconsContext: getIcons(false),
    useExpressiveContext: false,
    useVibrantContext: false,
    mediaBrowserCardsContext: {
      favorites: { main: [] },
      recents: { main: [] },
      recommendations: { main: [] },
      search: [],
    },
  };
  for (const [key, value] of Object.entries(values))
    new ContextProvider(host, { context: contexts[key], initialValue: value });
  const browser = document.createElement("mpc-media-browser");
  browser.config = config.media_browser;
  browser.onMediaSelectedAction = () => {};
  host.append(browser);
  window.previewBrowser = browser;
  const cache = document.createDocumentFragment();
  document.querySelector("#disc").onclick = () => host.append(browser);
  document.querySelector("#player").onclick = () => cache.append(browser);
  document.querySelector("#category").onchange = (event) => {
    browser.shadowRoot
      .querySelector("#filter-menu")
      .dispatchEvent(
        new CustomEvent("menu-item-selected", {
          detail: { option: event.target.value },
        }),
      );
  };
  document.querySelector("#collection").onchange = (event) => {
    config.media_browser.folders.show_collection_view = event.target.checked;
  };
}
const source = `${imports}\n(${setupPreview.toString()})();`;

const bundle = await rollup({
  input: entry,
  plugins: [
    {
      name: "folder-preview",
      resolveId: (id) => (id === entry ? entry : null),
      load: (id) => (id === entry ? source : null),
    },
    nodeResolve(),
    commonjs(),
    typescript(),
  ],
});
const { output } = await bundle.generate({ format: "es" });
await bundle.close();
const html = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Folders Preview</title>
<style>
:root{font-family:"Segoe UI",sans-serif;color:#202124;background:#eceef0;--primary-text-color:#202124;--secondary-text-color:#60666b;--divider-color:#e0e3e5;--secondary-background-color:#f4f6f7;--md-sys-color-primary:#17685d;--md-sys-color-on-primary:white;--md-sys-color-secondary-container:#d9e9e5;--md-sys-color-on-secondary-container:#193c35;--md-sys-color-surface-container-high:#e9eeee;--button-small-border-radius:4px}body{margin:0;padding:24px}nav{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px}nav button,select{font:inherit;padding:8px}#host{background:white;border:1px solid #d6dade;width:min(760px,100%);height:620px;box-sizing:border-box}mpc-media-browser{display:block;height:100%}mpc-media-browser::part(none){display:block}@media(max-width:500px){body{padding:10px}#host{height:620px}}
</style><nav><button id="disc">Disc</button><button id="player">Player</button><select id="category"><option value="folders">Folders</option><option value="favorites">Favorites</option></select><label><input id="collection" type="checkbox" checked>Show collection view</label></nav><div id="host"></div><script type="module" src="/preview.js"></script></html>`;

const server = createServer((request, response) => {
  const screenshot = request.url?.match(
    /^\/screenshots\/(folders-(?:desktop|mobile|mobile-menu)\.png)$/,
  );
  if (request.method === "POST" && screenshot) {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", async () => {
      await writeFile(
        resolve("static/media_browser", screenshot[1]),
        Buffer.concat(chunks),
      );
      response.end("Saved");
    });
    return;
  }
  response.setHeader(
    "Content-Type",
    request.url === "/preview.js" ? "text/javascript" : "text/html",
  );
  response.end(request.url === "/preview.js" ? output[0].code : html);
});
server.listen(0, "127.0.0.1", () => {
  process.stdout.write(
    `Folders preview: http://127.0.0.1:${server.address().port}\n`,
  );
});
