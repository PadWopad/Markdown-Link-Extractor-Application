import React, { useState, useRef } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { LinkList } from './components/LinkList';
import { fetchWithCORS, extractTextContent } from './utils/fetchContent';
import { formatError } from './utils/helpers';
import { isImageUrl } from './utils/urlHelpers';
import { create7zArchive } from './utils/fileHelpers';
import type { ExtractedLink } from './types';

function App() {
  const [links, setLinks] = useState<ExtractedLink[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    setLinks([]);

    try {
      const content = await file.text();
      const urlRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      const matches = Array.from(content.matchAll(urlRegex));
      
      const extractedLinks = matches
        .filter(match => !isImageUrl(match[2]))
        .map(match => ({
          url: match[2],
          content: match[1],
          status: 'pending' as const
        }));

      if (extractedLinks.length === 0) {
        setError('No valid non-image Markdown links found in the file');
      } else {
        setLinks(extractedLinks);
      }
    } catch (err) {
      setError('Failed to read the file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchContent = async (link: ExtractedLink, index: number) => {
    try {
      setLinks(prev => prev.map((l, i) => 
        i === index ? { ...l, status: 'loading' } : l
      ));

      const html = await fetchWithCORS(link.url);
      const content = extractTextContent(html);

      if (!content.trim()) {
        throw new Error('No content could be extracted from the page');
      }

      setLinks(prev => prev.map((l, i) => 
        i === index ? { ...l, status: 'success', content } : l
      ));
    } catch (err) {
      setLinks(prev => prev.map((l, i) => 
        i === index ? { ...l, status: 'error', error: formatError(err) } : l
      ));
    }
  };

  const handleExtractAll = () => {
    links.forEach((link, index) => {
      if (link.status === 'pending' || link.status === 'error') {
        fetchContent(link, index);
      }
    });
  };

  const downloadResults = async () => {
    try {
      const archiveBlob = await create7zArchive(links);
      const url = URL.createObjectURL(archiveBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted-content.7z';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to create archive. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            Markdown Link Extractor
          </h1>

          <div className="space-y-6">
            <FileUpload 
              onFileUpload={handleFileUpload} 
              fileInputRef={fileInputRef}
              isProcessing={isProcessing}
            />

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <LinkList
              links={links}
              onExtractAll={handleExtractAll}
              onDownload={downloadResults}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;