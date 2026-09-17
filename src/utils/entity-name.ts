import { HassEntity } from "home-assistant-js-websocket";

import { EntityName, ExtendedHass } from "../const/types";

type HassWithEntityNames = ExtendedHass & {
  formatEntityName: NonNullable<ExtendedHass["formatEntityName"]>;
};

/**
 * `hass.formatEntityName` only accepts a `name` option (a user string, a
 * structured name, or undefined) from Home Assistant 2026.4. Earlier versions
 * expose the same helper with an incompatible signature, so a version check is
 * needed - and a `hass` can report a recent version without carrying the helper
 * at all (during startup, or in a test harness), so both checks are.
 */
export function supportsEntityNames(
  hass: ExtendedHass | undefined,
): hass is HassWithEntityNames {
  if (typeof hass?.formatEntityName !== "function") {
    return false;
  }
  const [major, minor] = hass.config.version.split(".", 2);
  return Number(major) > 2026 || (Number(major) === 2026 && Number(minor) >= 4);
}

/**
 * Resolves a configured `name` against the entity's registry context (entity,
 * device, area, floor). Falls back to the `friendly_name` attribute on older
 * Home Assistant versions, which cannot resolve a structured name.
 */
export function computeEntityName(
  hass: ExtendedHass | undefined,
  stateObject: HassEntity | undefined,
  name?: EntityName,
): string {
  // A configured empty name has always meant "use Home Assistant's name", but
  // formatEntityName returns any string verbatim - including the empty one, which
  // would blank the label. Normalise it to undefined so the formatter composes.
  if (name === "") name = undefined;

  if (typeof name === "string" && name.length > 0) {
    return name;
  }
  if (!stateObject) {
    return "";
  }
  if (supportsEntityNames(hass)) {
    return hass.formatEntityName(stateObject, name) ?? "";
  }
  return stateObject.attributes.friendly_name ?? "";
}
