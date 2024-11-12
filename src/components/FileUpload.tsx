import React from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isProcessing: boolean;
}

export function FileUpload({ onFileUpload, fileInputRef, isProcessing }: FileUploadProps) {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:border-indigo-300 transition-colors">
      {isProcessing ? (
        <Loader2 className="w-12 h-12 text-gray-400 mb-4 animate-spin" />
      ) : (
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        accept=".md"
        className="hidden"
        disabled={isProcessing}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className={`px-4 py-2 bg-indigo-600 text-white rounded-lg transition-colors ${
          isProcessing 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-indigo-700'
        }`}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Choose Markdown File'}
      </button>
      <p className="text-sm text-gray-500 mt-2">Only .md files are supported</p>
    </div>
  );
}