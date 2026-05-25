/**
 * Helper to get the correct API URL depending on deployment origin (Vercel vs. Cloud Run container)
 */
export function getApiUrl(path: string): string {
  if (typeof window === 'undefined') return path;
  
  const hostname = window.location.hostname;
  
  // If we are running on Vercel or any other external custom domain, point to the secure Cloud Run backend
  if (
    hostname.includes('vercel.app') || 
    hostname.includes('github.io') || 
    (hostname && !hostname.includes('run.app') && hostname !== 'localhost' && hostname !== '127.0.0.1')
  ) {
    const backendBase = 'https://ais-pre-5sry5pmjh42x5ke5luyqrw-693099206806.europe-west2.run.app';
    return `${backendBase}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  
  // Default to relative paths for local development and direct container preview/access
  return path;
}
