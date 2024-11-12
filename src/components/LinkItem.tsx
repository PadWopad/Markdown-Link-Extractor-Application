import React from 'react';
import type { ExtractedLink } from '../types';

interface LinkItemProps {
  link: ExtractedLink;
}

export function LinkItem({ link }: LinkItemProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-800">{link.content}</h3>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            {link.url}
          </a>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            link.status === 'success'
              ? 'bg-green-100 text-green-800'
              : link.status === 'error'
              ? 'bg-red-100 text-red-800'
              : link.status === 'loading'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {link.status.charAt(0).toUpperCase() + link.status.slice(1)}
        </span>
      </div>
      {link.error && <p className="text-sm text-red-600 mt-2">{link.error}</p>}
    </div>
  );
}