// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8767';

// API Endpoints
export const API_ENDPOINTS = {
  analysis: {
    analyze: `${API_URL}/api/v1/analysis/analyze/v2`,
  },
  history: {
    list: `${API_URL}/api/v1/history/`,
    get: (id: number) => `${API_URL}/api/v1/history/${id}`,
    image: (imageId: number) => `${API_URL}/api/v1/history/image/${imageId}`,
  },
  review: {
    get: (forecastId: number) => `${API_URL}/api/v1/review/${forecastId}`,
    create: (forecastId: number) => `${API_URL}/api/v1/review/${forecastId}/review`,
    image: (imageId: number) => `${API_URL}/api/v1/review/image/${imageId}`,
  },
} as const;