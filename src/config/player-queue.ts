export function queueConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} } },
    {
      name: "",
      type: "grid",
      schema: [
        { name: "limit_before", selector: { number: { min: 0, max: 500, mode: "box"}}},
        { name: "limit_after", selector: { number: { min: 0, max: 500, mode: "box"}}},
        { name: "show_album_covers", selector: { boolean: {} } },
        { name: "show_artist_names", selector: { boolean: {} } },
      ]
    }
  ]
}