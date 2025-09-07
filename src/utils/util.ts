export function testMixedContent(url: string) {
  if (window.location.protocol == 'http') {
    return true;
  }
  return isHttpsOrRelative(url);
}

export function isHttpsOrRelative(url: string) {
  return !url.startsWith('http:');
}