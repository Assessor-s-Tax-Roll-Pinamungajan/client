// API Configuration
// Change this to your server's IP address when deploying

export const API_CONFIG = {
  // For server deployment
  baseUrl: 'http://192.168.8.8:5556/api'
  
  // For local development
  // baseUrl: 'http://localhost:5556/api'
};

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseUrl}/${endpoint}`;
}

