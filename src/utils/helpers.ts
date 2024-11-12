export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const formatError = (error: Error): string => {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'Network error: Please check your internet connection';
  }
  
  if (message.includes('cors')) {
    return 'Access to content blocked by CORS policy';
  }
  
  if (message.includes('404')) {
    return 'Page not found';
  }
  
  if (message.includes('timeout')) {
    return 'Request timed out';
  }
  
  return error.message;
};