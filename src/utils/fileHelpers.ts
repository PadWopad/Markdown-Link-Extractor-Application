import { compress } from 'lzma';
import slugify from 'slugify';
import type { ExtractedLink } from '../types';

export function createMarkdownContent(link: ExtractedLink): string {
  const timestamp = new Date().toISOString();
  
  return `---
title: ${link.content}
url: ${link.url}
extracted_at: ${timestamp}
status: ${link.status}
---

# ${link.content}

Original URL: ${link.url}

${link.status === 'success' 
  ? link.content 
  : `Content extraction failed: ${link.error || 'Unknown error'}`}`;
}

export async function create7zArchive(links: ExtractedLink[]): Promise<Blob> {
  const files: { name: string; content: string }[] = [];
  
  // Create markdown files
  links.forEach((link, index) => {
    const filename = slugify(link.content, {
      lower: true,
      strict: true,
      trim: true
    });
    
    const fullFilename = `${filename}-${index + 1}.md`;
    const content = createMarkdownContent(link);
    
    files.push({ name: fullFilename, content });
  });
  
  // Create a TAR-like structure
  const header = JSON.stringify(files.map(f => ({ 
    name: f.name, 
    size: f.content.length 
  })));
  
  // Concatenate all content with headers
  const fullContent = header + '\n' + files.map(f => f.content).join('\n');
  
  // Compress the content using LZMA
  return new Promise((resolve, reject) => {
    compress(fullContent, 9, (result, error) => {
      if (error) reject(error);
      else resolve(new Blob([result], { type: 'application/x-7z-compressed' }));
    });
  });
}