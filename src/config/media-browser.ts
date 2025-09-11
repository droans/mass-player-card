function favoritesConfigForm(section: string) {
  return {
    name: section,
    type: "expandable",
    schema: [ { name: "enabled", description: { suffix: section}, selector: { boolean: {} }, default: true } ]
  }
}
export function mediaBrowserConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} } },
    favoritesConfigForm("album"),
    favoritesConfigForm("artists"),
    favoritesConfigForm("audiobooks"),
    favoritesConfigForm("playlists"),
    favoritesConfigForm("podcasts"),
    favoritesConfigForm("radios"),
    favoritesConfigForm("tracks"),

  ]
}