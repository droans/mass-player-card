export function hiddenElementsConfigItem(items: string[]) {
  const r = items.map((item) => {
    return { name: item, selector: { boolean: {} }, default: false }
  })
  return {
    name: "hide",
    type: "expandable",
    schema: r,
  }
}
