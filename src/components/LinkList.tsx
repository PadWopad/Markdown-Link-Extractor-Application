import React from 'react';
import { Link, Download } from 'lucide-react';
import { LinkItem } from './LinkItem';
import type { ExtractedLink } from '../types';

interface LinkListProps {
  links: ExtractedLink[];
  onExtractAll: () => void;
  onDownload: () => void;
}

export function LinkList({ links, onExtractAll, onDownload }: LinkListProps) {
  if (links.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Link className="w-5 h-5" />
          Found Links ({links.length})
        </h2>
        <div className="space-x-3">
          <button
            onClick={onExtractAll}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Extract All Content
          </button>
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download as 7z
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {links.map((link, index) => (
          <LinkItem key={index} link={link} />
        ))}
      </div>
    </div>
  );
}