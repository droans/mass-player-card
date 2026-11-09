import assert from "node:assert/strict";
import { test } from "node:test";
import { rollup } from "rollup";
import typescript from "@rollup/plugin-typescript";

const bundle = await rollup({
  input: "src/actions/folder-actions.ts",
  plugins: [typescript()],
});
const { output } = await bundle.generate({ format: "es" });
await bundle.close();
const { FolderActions, folderItemName, sortFolderItems } = await import(
  `data:text/javascript;base64,${Buffer.from(output[0].code).toString("base64")}`
);

const track = (filename, name = filename) => ({
  name,
  uri: `filesystem://track/Music/${encodeURIComponent(filename)}`,
  media_type: "track",
});
const folder = (name, path) => ({
  name,
  uri: `filesystem://folder/${name}`,
  path,
  media_type: "folder",
});
const libraryTrack = (filename, id, name) => ({
  name,
  uri: `library://track/${id}`,
  media_type: "track",
  provider_mappings: [
    {
      item_id: "98765",
      provider_domain: "spotify",
      provider_instance: "spotify-instance",
    },
    {
      item_id: `Music/${filename}`,
      provider_domain: "filesystem_local",
      provider_instance: "filesystem-instance",
    },
  ],
});

function connection(listings) {
  const requests = [];
  const services = [];
  return {
    requests,
    services,
    hass: {
      async callWS(request) {
        requests.push(request);
        if (request.type === "mass_queue/get_info") {
          return { entries: { mass_queue: "queue-config" } };
        }
        assert.equal(request.service, "send_command");
        assert.equal(request.service_data.command, "music/browse");
        assert.equal(request.service_data.config_entry_id, "queue-config");
        assert.equal(request.return_response, true);
        assert.deepEqual(Object.keys(request.service_data.data), ["path"]);
        const path = request.service_data.data.path;
        assert.ok(
          Object.hasOwn(listings, path),
          `Unexpected browse path: ${path}`,
        );
        if (listings[path] instanceof Error) {
          throw listings[path];
        }
        return { response: { response: listings[path] } };
      },
      async callService(...parameters) {
        services.push(parameters);
      },
    },
  };
}

test("sorts filenames lexically, not by title metadata or natural-number order", () => {
  const items = [
    track("2.flac", "A"),
    track("10.flac", "Z"),
    track("01.flac", "Y"),
  ];
  assert.deepEqual(sortFolderItems(items).map(folderItemName), [
    "01.flac",
    "10.flac",
    "2.flac",
  ]);
  assert.equal(items[0].name, "A");
  assert.equal(folderItemName(track("A space.flac")), "A space.flac");
  assert.equal(
    folderItemName({ ...track("x"), uri: "provider://track/%broken" }),
    "%broken",
  );
});

test("sorts folders before files, with lexical ordering within each group", () => {
  const items = [
    track("01.flac"),
    folder("Z folder", "z://"),
    track("2.flac"),
    folder("A folder", "a://"),
    track("10.flac"),
  ];
  assert.deepEqual(sortFolderItems(items).map(folderItemName), [
    "A folder",
    "Z folder",
    "01.flac",
    "10.flac",
    "2.flac",
  ]);
  assert.equal(items[0].media_type, "track");
});

test("starts at the native MA root and removes synthetic parent links", async () => {
  const mock = connection({
    root: [folder("Z", "z://"), folder("A", "a://"), folder("..", "root")],
  });
  const items = await new FolderActions(mock.hass).browse("media_player.test");
  assert.deepEqual(
    items.map((item) => item.name),
    ["A", "Z"],
  );
  assert.equal(mock.requests[1].service_data.data.path, "root");
});

test("library tracks display and sort by filesystem names while retaining playback URIs", async () => {
  const first = libraryTrack("01 - Opening.flac", "54321", "Z title");
  const second = libraryTrack("10 - Interlude.flac", "12345", "A title");
  const mock = connection({ "filesystem://Music": [second, first] });
  const actions = new FolderActions(mock.hass);
  const items = await actions.browse("media_player.test", "filesystem://Music");
  assert.deepEqual(items.map(folderItemName), [
    "01 - Opening.flac",
    "10 - Interlude.flac",
  ]);
  await actions.enqueue(
    "media_player.test",
    folder("Music", "filesystem://Music"),
    "replace",
  );
  assert.deepEqual(mock.services[0][2], {
    entity_id: "media_player.test",
    media_id: [first.uri, second.uri],
    enqueue: "replace",
  });
});

test("raw filesystem names are not URI-decoded and missing mappings never expose library IDs", () => {
  assert.equal(
    folderItemName(libraryTrack("01 - 100%20real.flac", "12345", "Title")),
    "01 - 100%20real.flac",
  );
  assert.equal(
    folderItemName({ ...track("x"), path: "Music\\Actual filename.flac" }),
    "Actual filename.flac",
  );
  assert.equal(
    folderItemName({
      name: "Title",
      uri: "library://track/12345",
      media_type: "track",
    }),
    "Title",
  );
});

for (const option of [
  "play",
  "next",
  "replace",
  "replace_next",
  "add",
  "radio",
]) {
  test(`folder queue option ${option} sends one ordered batch using browse paths`, async () => {
    const mock = connection({
      "filesystem://Music": [
        track("2.flac", "A"),
        folder("..", "root"),
        track("01.flac", "Z"),
        track("10.flac", "Y"),
        { ...track("00-unavailable.flac"), available: false },
        folder("Subfolder", "filesystem://Music/Subfolder"),
      ],
      "filesystem://Music/Subfolder": [
        track("sub-02.flac"),
        folder("..", "filesystem://Music"),
        track("sub-01.flac"),
        folder("Cycle", "filesystem://Music"),
      ],
    });
    await new FolderActions(mock.hass).enqueue(
      "media_player.test",
      folder("Music", "filesystem://Music"),
      option,
      "listener",
    );
    assert.equal(mock.services.length, 1);
    const [domain, service, data] = mock.services[0];
    assert.equal(domain, "music_assistant");
    assert.equal(service, "play_media");
    assert.deepEqual(
      data.media_id,
      ["01.flac", "10.flac", "2.flac", "sub-01.flac", "sub-02.flac"].map(
        (filename) => track(filename).uri,
      ),
    );
    assert.equal(data.entity_id, "media_player.test");
    assert.equal(data.username, "listener");
    assert.equal(Object.hasOwn(data, "shuffle"), false);
    if (option === "radio") {
      assert.equal(data.radio_mode, true);
      assert.equal(data.enqueue, undefined);
    } else {
      assert.equal(data.enqueue, option);
      assert.equal(data.radio_mode, undefined);
    }
  });
}

test("empty folders never clear or modify the queue", async () => {
  const mock = connection({ "empty://": [] });
  await new FolderActions(mock.hass).enqueue(
    "media_player.test",
    folder("Empty", "empty://"),
    "replace",
  );
  assert.equal(mock.services.length, 0);
});

test("individual files keep their identity and do not browse or change shuffle", async () => {
  const mock = connection({});
  const item = track("01.flac");
  await new FolderActions(mock.hass).enqueue("media_player.test", item, "next");
  assert.equal(mock.requests.length, 0);
  assert.deepEqual(mock.services[0][2], {
    entity_id: "media_player.test",
    media_id: [item.uri],
    enqueue: "next",
  });
});

test("a failed subfolder aborts before any partial queue mutation", async () => {
  const mock = connection({
    "music://": [track("01.flac"), folder("Broken", "broken://")],
    "broken://": new Error("Unavailable"),
  });
  await assert.rejects(
    new FolderActions(mock.hass).enqueue(
      "media_player.test",
      folder("Music", "music://"),
      "replace",
    ),
    /Unavailable/,
  );
  assert.equal(mock.services.length, 0);
});
