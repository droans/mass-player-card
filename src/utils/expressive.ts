import {
  DynamicScheme,
  Hct,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
  sourceColorFromImage,
} from "@material/material-color-utilities";
import { ExpressiveScheme } from "../config/config.js";
import { ExtendedHass, Thumbnail } from "../const/common.js";
import { getThumbnail } from "./thumbnails.js";

type dynamicSchemeType = new (
  sourceColorHct: Hct,
  isDark: boolean,
  contrastLevel: number,
  specVersion?: "2021" | "2025",
  platform?: "phone" | "watch",
) => DynamicScheme;

type ExpressiveSchemesMap = Record<ExpressiveScheme, dynamicSchemeType>;

const ExpressiveSchemes: ExpressiveSchemesMap = {
  content: SchemeContent,
  expressive: SchemeExpressive,
  fidelity: SchemeFidelity,
  fruit_salad: SchemeFruitSalad,
  monochrome: SchemeMonochrome,
  neutral: SchemeNeutral,
  rainbow: SchemeRainbow,
  tonal_spot: SchemeTonalSpot,
  vibrant: SchemeVibrant,
};
const EXPRESSIVE_KEYS: Record<string, string> = {
  background: "--md-sys-color-background",
  error: "--md-sys-color-error",
  errorContainer: "--md-sys-color-error-container",
  inverseOnSurface: "--md-sys-color-inverse-on-surface",
  inversePrimary: "--md-sys-color-inverse-primary",
  inverseSurface: "--md-sys-color-inverse-surface",
  onBackground: "--md-sys-color-on-background",
  onError: "--md-sys-color-on-error",
  onErrorContainer: "--md-sys-color-on-error-container",
  onPrimary: "--md-sys-color-on-primary",
  onPrimaryContainer: "--md-sys-color-on-primary-container",
  onPrimaryFixed: "--md-sys-color-on-primary-fixed",
  onPrimaryFixedVariant: "--md-sys-color-on-primary-fixed-variant",
  onSecondary: "--md-sys-color-on-secondary",
  onSecondaryContainer: "--md-sys-color-on-secondary-container",
  onSecondaryFixed: "--md-sys-color-on-secondary-fixed",
  onSecondaryFixedVariant: "--md-sys-color-on-secondary-variant",
  onSurface: "--md-sys-color-on-surface",
  onSurfaceVariant: "--md-sys-color-on-surface-variant",
  onTertiary: "--md-sys-color-on-tertiary",
  onTertiaryContainer: "--md-sys-color-on-tertiary-container",
  onTertiaryFixed: "--md-sys-color-on-tertiary-fixed",
  onTertiaryFixedVariant: "--md-sys-color-on-tertiary-fixed-variant",
  outline: "--md-sys-color-outline",
  outlineVariant: "--md-sys-color-outline-variant",
  primary: "--md-sys-color-primary",
  primaryContainer: "--md-sys-color-primary-container",
  primaryFixed: "--md-sys-color-primary-fixed",
  primaryFixedDim: "--md-sys-color-primary-fixed-dim",
  scrim: "--md-sys-color-scrim",
  secondary: "--md-sys-color-secondary",
  secondaryContainer: "--md-sys-color-secondary-container",
  secondaryFixed: "--md-sys-color-secondary-fixed",
  secondaryFixedDim: "--md-sys-color-secondary-fixed-dim",
  shadow: "--md-sys-color-shadow",
  surface: "--md-sys-color-surface",
  surfaceBright: "--md-sys-color-surface-bright",
  surfaceContainer: "--md-sys-color-surface-container",
  surfaceContainerHigh: "--md-sys-color-surface-container-high",
  surfaceContainerHighest: "--md-sys-color-surface-container-highest",
  surfaceContainerLow: "--md-sys-color-surface-container-low",
  surfaceContainerLowest: "--md-sys-color-surface-container-lowest",
  surfaceDim: "--md-sys-color-surface-dim",
  surfaceTint: "--md-sys-color-surface-tint",
  surfaceVariant: "--md-sys-color-surface-variant",
  tertiary: "--md-sys-color-tertiary",
  tertiaryContainer: "--md-sys-color-tertiary-container",
  tertiaryFixed: "--md-sys-color-tertiary-fixed",
  tertiaryFixedDim: "--md-sys-color-tertiary-fixed-dim",
};

function generateImageElement(
  img: string,
  hass: ExtendedHass,
  defaultImage: Thumbnail = Thumbnail.CLEFT,
): HTMLImageElement {
  const elem = document.createElement("img");
  const def = getThumbnail(hass, defaultImage);
  elem.src = img;
  elem.crossOrigin = "Anonymous";
  elem.onerror = () => {
    elem.src = def;
  };
  return elem;
}

export async function applyExpressiveSchemeFromImage(
  img: string,
  hass: ExtendedHass,
  scheme: ExpressiveScheme,
  elem: HTMLElement,
  defaultImage: Thumbnail = Thumbnail.CLEFT,
): Promise<DynamicScheme> {
  const schemeResult = await generateExpressiveSchemeFromImage(
    img,
    hass,
    scheme,
    defaultImage,
  );
  applyExpressiveScheme(schemeResult, elem);
  return schemeResult;
}

export async function generateExpressiveSchemeFromImage(
  img: string,
  hass: ExtendedHass,
  scheme: ExpressiveScheme,
  defaultImage: Thumbnail = Thumbnail.CLEFT,
): Promise<DynamicScheme> {
  const elem = generateImageElement(img, hass, defaultImage);
  const darkMode = hass.themes.darkMode;
  return generateExpressiveSchemeFromImageElement(elem, scheme, darkMode);
}

async function generateExpressiveSourceColorForImageElement(
  elem: HTMLImageElement,
) {
  return await sourceColorFromImage(elem);
}

export async function generateExpressiveSchemeFromImageElement(
  elem: HTMLImageElement,
  scheme: ExpressiveScheme,
  darkMode: boolean,
): Promise<DynamicScheme> {
  const col = await generateExpressiveSourceColorForImageElement(elem);
  return generateExpressiveSchemeFromColor(col, scheme, darkMode);
}

function _generateExpressiveSchemeFromColor(
  source: number,
  scheme: ExpressiveScheme,
  darkMode: boolean,
): DynamicScheme {
  const cls = ExpressiveSchemes[scheme];
  const _hct = Hct.fromInt(source);
  return new cls(
    _hct, // Source Color HCT
    darkMode, // Dark Mode Boolean
    0, // Contrast Level
    "2025", // Version
    "phone", // Platform
  );
}

function generateExpressiveSchemeFromColor(
  source: number,
  scheme: ExpressiveScheme,
  darkMode: boolean,
) {
  return _generateExpressiveSchemeFromColor(source, scheme, darkMode);
}

export function applyExpressiveScheme(
  scheme: DynamicScheme,
  elem: HTMLElement,
) {
  const entries = Object.entries(EXPRESSIVE_KEYS);
  entries.forEach((entry) => {
    const schemeKey = entry[0];
    const colorKey = entry[1];
    const colorInt = scheme[schemeKey] as number;
    if (colorInt) {
      const color = `#${colorInt.toString(16).slice(2)}`;
      elem.style.setProperty(colorKey, color);
    }
  });
}
