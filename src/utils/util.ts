export function testMixedContent(url: string) {
  try {
    if (window.location.protocol == 'http') {
      return true;
    }
    return isHttpsOrRelative(url);
  } catch {
    return false;
  }
}

export function isHttpsOrRelative(url: string) {
  try {
    return !url.startsWith('http:');
  } catch {
    return false;
  }
}