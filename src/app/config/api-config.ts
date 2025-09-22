// API Configuration
// Change this to your server's IP address when deploying

export const API_CONFIG = {
  // For local development
  baseUrl: 'http://localhost:5556/api'
  
  // For server deployment - REPLACE WITH YOUR SERVER IP
  // baseUrl: 'http://192.168.8.8:5556/api'
  
  // Example: baseUrl: 'http://192.168.1.100:5556/api'
  // Example: baseUrl: 'http://10.0.0.50:5556/api'
};

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseUrl}/${endpoint}`;
}

