export interface ExtractedLink {
  url: string;
  content: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
}