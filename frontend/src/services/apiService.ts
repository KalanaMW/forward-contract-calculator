export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  framework: string;
  version?: string;
}

export interface ForwardCalculationRequest {
  agreedPrice: number;
  marketPrice: number;
  quantity: number;
}

export interface ForwardCalculationResponse {
  buyerPayoff: number;
  sellerPayoff: number;
}

export class ApiError extends Error {
  statusCode: number;
  details?: string[];

  constructor(message: string, statusCode: number, details?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Resolves the backend Web API base URL.
 * Configurable via Vite environment variable VITE_API_BASE_URL.
 * Intelligently aligns loopback hostname between localhost and 127.0.0.1.
 */
export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL as string;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5050';
  }
  return 'http://localhost:5050';
};

export const apiService = {
  /**
   * Check backend API health status
   */
  async checkHealth(): Promise<HealthResponse> {
    const baseUrl = getApiBaseUrl();
    let response: Response;

    try {
      response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
    } catch (err) {
      // Fallback check to /health endpoint
      try {
        response = await fetch(`${baseUrl}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
      } catch {
        throw err;
      }
    }

    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Calculate forward contract payoffs using the authoritative C# backend engine.
   * POST /api/forward/calculate
   */
  async calculatePayoff(params: ForwardCalculationRequest): Promise<ForwardCalculationResponse> {
    const url = `${getApiBaseUrl()}/api/forward/calculate`;
    let response: Response;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          agreedPrice: params.agreedPrice,
          marketPrice: params.marketPrice,
          quantity: params.quantity,
        }),
      });
    } catch {
      throw new Error(
        'Unable to connect to the backend API at ' +
          getApiBaseUrl() +
          '. Please verify that the ASP.NET Core server is running (e.g. dotnet run on port 5050).'
      );
    }

    if (!response.ok) {
      let errorMessage = `Calculation failed with status ${response.status}.`;
      let details: string[] | undefined;

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        }

        if (Array.isArray(errorData.details)) {
          details = errorData.details;
          errorMessage = errorData.details.join(' ');
        } else if (errorData.errors && typeof errorData.errors === 'object') {
          const collected: string[] = [];
          for (const key of Object.keys(errorData.errors)) {
            const msgs = errorData.errors[key];
            if (Array.isArray(msgs)) collected.push(...msgs);
          }
          if (collected.length > 0) {
            details = collected;
            errorMessage = collected.join(' ');
          }
        }
      } catch {
        // Response was not JSON
      }

      throw new ApiError(errorMessage, response.status, details);
    }

    return response.json();
  },
};

