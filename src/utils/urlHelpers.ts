const IMAGE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.bmp',
  '.webp', '.svg', '.ico', '.tiff', '.avif'
];

export function isImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.toLowerCase();
    
    // Check file extension
    if (IMAGE_EXTENSIONS.some(ext => path.endsWith(ext))) {
      return true;
    }

    // Check for image-specific patterns in the URL
    if (path.includes('/image/') || path.includes('/img/')) {
      return true;
    }

    // Check query parameters for image indicators
    const params = new URLSearchParams(urlObj.search);
    if (params.get('type') === 'image' || params.get('format') === 'image') {
      return true;
    }

    return false;
  } catch {
    // If URL parsing fails, check for basic extension matching
    return IMAGE_EXTENSIONS.some(ext => url.toLowerCase().endsWith(ext));
  }
}