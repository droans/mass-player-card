export enum CheckURLResult {
  ACCESSIBLE = "accessible",
  NOT_ACCESSIBLE = "not_accessible",
  NOT_URL = "not_url",
}

export enum DocumentLocation {
  HTTP_IP = "http_ip",
  HTTPS_IP = "https_ip",
  HTTP_URL = "http_url",
  HTTPS_URL = "https_url",
}

const MIN_URL_LENGTH = 10;
const IP_ADDRESS_HOSTNAME_VALIDATION = /\d{2,3}\.\d{1,3}.\d{1,3}.\d{1,3}/;

export function testMixedContent(url: string) {
  try {
    if (window.location.protocol == "http") {
      return true;
    }
    return isHttpsOrRelative(url);
  } catch {
    return false;
  }
}

export function isHttpsOrRelative(url: string) {
  try {
    return !url.startsWith("http:");
  } catch {
    return false;
  }
}

export function getUrlLocation(url: string): DocumentLocation {
  const isHttp = url.startsWith("http://");
  const isIpAddress = IP_ADDRESS_HOSTNAME_VALIDATION.test(url);
  if (isHttp) {
    return isIpAddress ? DocumentLocation.HTTP_IP : DocumentLocation.HTTP_URL;
  }
  return isIpAddress ? DocumentLocation.HTTPS_IP : DocumentLocation.HTTPS_URL;
}

export function getDocumentLocation(): DocumentLocation {
  const loc = document.location;
  const isHttp = loc.protocol == "http:";
  const isIpAddress = IP_ADDRESS_HOSTNAME_VALIDATION.test(loc.hostname);
  if (isHttp) {
    return isIpAddress ? DocumentLocation.HTTP_IP : DocumentLocation.HTTP_URL;
  }
  return isIpAddress ? DocumentLocation.HTTPS_IP : DocumentLocation.HTTPS_URL;
}

export function testLocation(url: string) {
  if (!url.startsWith("http")) {
    return false;
  }
  const documentLocation = getDocumentLocation();
  const urlLocation = getUrlLocation(url);
  return (
    documentLocation == DocumentLocation.HTTP_IP ||
    documentLocation == urlLocation ||
    urlLocation == DocumentLocation.HTTPS_URL
  );
}

export function urlIsEncoded(url: string) {
  return url.startsWith("data:");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isURL(url: any): boolean {
  if (typeof url != "string") {
    return false;
  }
  return url.length >= MIN_URL_LENGTH;
}

export function urlIsHassApi(url: string): boolean {
  return url.startsWith("/api/");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getUrlAccessibility(url: any): CheckURLResult {
  /*
    Return CheckURLResult.ACCESSIBLE if:
      // * HA is loaded via HTTP IP
      // * URL is for HTTPS URL (Non-IP)
      * HA is loaded via HTTP URL (Non-IP) and URL is for HTTP non-IP

    Return CheckURLResult.NOT_ACCESSIBLE if:
      * HA is loaded via HTTPS but URL is HTTP
      * HA is loaded via HTTP URL (Non-IP) but URL is for IP Address
      
    Return CheckURLResult.NOT_URL if:
      // * URL is not string
      // * URL is less than min characters
  */
  if (!isURL(url)) {
    return CheckURLResult.NOT_URL;
  }
  const _url = url as string;

  if (urlIsHassApi(_url) || testLocation(_url) || urlIsEncoded(_url)) {
    return CheckURLResult.ACCESSIBLE;
  }
  return CheckURLResult.NOT_ACCESSIBLE;
}
