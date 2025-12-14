// Unsplash API client service

import { UNSPLASH_API_URL } from "../constants.js";

export class UnsplashAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "UnsplashAPIError";
  }
}

export class UnsplashClient {
  private accessKey: string;

  constructor(accessKey: string) {
    if (!accessKey) {
      throw new Error(
        "Unsplash Access Key is required. Set UNSPLASH_ACCESS_KEY environment variable."
      );
    }
    this.accessKey = accessKey;
  }

  async makeRequest<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${UNSPLASH_API_URL}${endpoint}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`,
          "Accept-Version": "v1"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Unsplash API error (${response.status})`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.errors?.[0] || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new UnsplashAPIError(errorMessage, response.status, errorText);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof UnsplashAPIError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new UnsplashAPIError(
          `Network error: ${error.message}`,
          undefined,
          error
        );
      }

      throw new UnsplashAPIError("Unknown error occurred");
    }
  }

  // Track download (required by Unsplash API guidelines)
  async trackDownload(downloadLocation: string): Promise<void> {
    try {
      await fetch(downloadLocation, {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`
        }
      });
    } catch (error) {
      console.error("Failed to track download:", error);
      // Don't throw - tracking is best-effort
    }
  }
}
