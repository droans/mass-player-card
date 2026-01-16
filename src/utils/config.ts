import { MediaBrowserHiddenElementsConfig } from "../config/media-browser";
import { PlayerHiddenElementsConfig } from "../config/player";
import { PlayerQueueHiddenElementsConfig } from "../config/player-queue";
import { PlayersHiddenElementsConfig } from "../config/players";

export function hiddenElementsConfigItem(items: string[]) {
  const r = items.map((item) => {
    return { name: item, selector: { boolean: {} }, default: false };
  });
  return {
    name: "hide",
    type: "expandable",
    schema: r,
  };
}

type hiddenElementConfigType =
  | MediaBrowserHiddenElementsConfig
  | PlayerHiddenElementsConfig
  | PlayerQueueHiddenElementsConfig
  | PlayersHiddenElementsConfig;

type intermediateHiddenElementsConfigType = Record<string, boolean>;

function getHiddenElementValueIfExists(
  config: intermediateHiddenElementsConfigType,
  key: string,
): boolean | undefined {
  const keys = Object.keys(config);
  if (keys.includes(key)) {
    return config[key];
  }
  return undefined;
}

export function getHiddenElements(
  defaultHiddenElements: hiddenElementConfigType,
  configSectionHiddenElements: hiddenElementConfigType,
  configEntityHiddenElements: hiddenElementConfigType,
): hiddenElementConfigType {
  const keys = Object.keys(defaultHiddenElements);
  const result: intermediateHiddenElementsConfigType = {};
  const default_: intermediateHiddenElementsConfigType = {
    ...defaultHiddenElements,
  };
  const section_ = { ...configSectionHiddenElements };
  const entity = { ...configEntityHiddenElements };
  keys.forEach((key) => {
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    result[key] =
      getHiddenElementValueIfExists(entity, key) ||
      getHiddenElementValueIfExists(section_, key) ||
      getHiddenElementValueIfExists(default_, key) ||
      false;
    /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */
  });

  return result as hiddenElementConfigType;
}
