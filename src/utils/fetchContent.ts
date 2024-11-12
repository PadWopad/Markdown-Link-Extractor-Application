import { sleep } from './helpers';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

export async function fetchWithCORS(url: string): Promise<string> {
  // List of CORS proxies with their respective URL patterns
  const proxyConfigs = [
    {
      name: 'cors.sh',
      url: `https://cors.sh/${url}`,
      headers: { 'x-cors-api-key': 'temp_f44999d8c0c1e6a8d55271f5b0a0f901' }
    },
    {
      name: 'allorigins',
      url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      headers: {}
    },
    {
      name: 'corsproxy.io',
      url: `https://corsproxy.io/?${encodeURIComponent(url)}`,
      headers: {}
    }
  ];

  let lastError = '';

  // Try each proxy in sequence
  for (const config of proxyConfigs) {
    try {
      const response = await fetchWithRetry(config.url, MAX_RETRIES);
      const text = await response.text();
      
      if (text.length > 0) {
        return text;
      }
      
      lastError = 'Empty response received';
    } catch (error) {
      lastError = `${config.name}: ${error.message}`;
      continue;
    }
  }

  // If all proxies fail, try a direct fetch as a last resort
  try {
    const response = await fetchWithRetry(url, 1);
    return await response.text();
  } catch (error) {
    throw new Error(`All proxies failed. Last error: ${lastError}. Direct fetch error: ${error.message}`);
  }
}

export function extractTextContent(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove unwanted elements
    const elementsToRemove = [
      'script', 'style', 'iframe', 'noscript', 'head',
      'nav', 'footer', 'header', 'aside'
    ];
    
    elementsToRemove.forEach(tag => {
      const elements = doc.getElementsByTagName(tag);
      Array.from(elements).forEach(el => el.remove());
    });
    
    // Get main content (prefer article or main elements if they exist)
    const mainContent = 
      doc.querySelector('article')?.textContent ||
      doc.querySelector('main')?.textContent ||
      doc.body.textContent ||
      '';
    
    // Clean up the text
    const cleaned = mainContent
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .replace(/[^\S\n]+/g, ' ')
      .trim();
    
    // Limit content length with smart truncation
    const maxLength = 1000;
    if (cleaned.length <= maxLength) return cleaned;
    
    // Try to break at a sentence
    const truncated = cleaned.slice(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const breakPoint = lastPeriod > maxLength * 0.8 ? lastPeriod + 1 : maxLength;
    
    return cleaned.slice(0, breakPoint) + '...';
  } catch (error) {
    throw new Error(`Failed to extract content: ${error.message}`);
  }
}