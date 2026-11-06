export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  framework: string;
  version?: string;
}

const API_BASE_URL = 'http://localhost:5050';

export const apiService = {
  /**
   * Check backend API health status
   */
  async checkHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }

    return response.json();
  },
};
