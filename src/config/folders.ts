import { mdiFolder } from "@mdi/js";

export interface FoldersConfig {
  enabled: boolean;
  show_collection_view: boolean;
}

export const DEFAULT_FOLDERS_CONFIG: FoldersConfig = {
  enabled: true,
  show_collection_view: true,
};

export function foldersConfigForm() {
  return {
    name: "folders",
    type: "expandable",
    iconPath: mdiFolder,
    schema: [
      { name: "enabled", selector: { boolean: {} }, default: true },
      {
        name: "show_collection_view",
        selector: { boolean: {} },
        default: true,
      },
    ],
  };
}
