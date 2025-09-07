import { Icons } from "../const/common"

export function backgroundImageFallback(image_url: string, fallback: Icons) {
  return `background-image: url(${image_url}), url(${fallback})`
}

export function getFallbackImage(fallback: Icons) {
  return `background-image: url(${fallback})`
}