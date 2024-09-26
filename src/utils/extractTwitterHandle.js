export function extractTwitterHandle(url) {
  if (!url) return null;
  
  // Handle both twitter.com and x.com URLs
  const twitterRegex = /(?:twitter\.com|x\.com)\/(?:#!\/)?@?([^/?#]+)/;
  const match = url.match(twitterRegex);
  
  return match ? match[1] : null;
}
