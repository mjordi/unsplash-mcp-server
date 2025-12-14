import { describe, it, mock } from "node:test";
import assert from "node:assert";
import { UnsplashClient, UnsplashAPIError } from "./unsplash-client.js";

describe("UnsplashClient", () => {
  describe("constructor", () => {
    it("should throw error if access key is not provided", () => {
      assert.throws(
        () => new UnsplashClient(""),
        /Unsplash Access Key is required/
      );
    });

    it("should create client with valid access key", () => {
      const client = new UnsplashClient("test-key");
      assert.ok(client);
    });
  });

  describe("makeRequest", () => {
    it("should make successful API request", async () => {
      const mockResponse = { id: "test", results: [] };

      global.fetch = mock.fn(async () => ({
        ok: true,
        json: async () => mockResponse,
        status: 200,
        text: async () => JSON.stringify(mockResponse)
      })) as any;

      const client = new UnsplashClient("test-key");
      const result = await client.makeRequest("/search/photos", { query: "nature" });

      assert.deepStrictEqual(result, mockResponse);
    });

    it("should handle API error responses", async () => {
      global.fetch = mock.fn(async () => ({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ errors: ["Unauthorized"] })
      })) as any;

      const client = new UnsplashClient("test-key");

      await assert.rejects(
        async () => client.makeRequest("/search/photos"),
        (error: any) => {
          assert.ok(error instanceof UnsplashAPIError);
          assert.strictEqual(error.statusCode, 401);
          return true;
        }
      );
    });

    it("should handle network errors", async () => {
      global.fetch = mock.fn(async () => {
        throw new Error("Network failure");
      }) as any;

      const client = new UnsplashClient("test-key");

      await assert.rejects(
        async () => client.makeRequest("/search/photos"),
        (error: any) => {
          assert.ok(error instanceof UnsplashAPIError);
          assert.ok(error.message.includes("Network error"));
          return true;
        }
      );
    });

    it("should build query parameters correctly", async () => {
      let capturedUrl = "";

      global.fetch = mock.fn(async (url: string) => {
        capturedUrl = url;
        return {
          ok: true,
          json: async () => ({}),
          status: 200
        };
      }) as any;

      const client = new UnsplashClient("test-key");
      await client.makeRequest("/search/photos", {
        query: "nature",
        page: 1,
        per_page: 10
      });

      assert.ok(capturedUrl.includes("query=nature"));
      assert.ok(capturedUrl.includes("page=1"));
      assert.ok(capturedUrl.includes("per_page=10"));
    });

    it("should skip undefined parameters", async () => {
      let capturedUrl = "";

      global.fetch = mock.fn(async (url: string) => {
        capturedUrl = url;
        return {
          ok: true,
          json: async () => ({}),
          status: 200
        };
      }) as any;

      const client = new UnsplashClient("test-key");
      await client.makeRequest("/search/photos", {
        query: "nature",
        page: undefined
      });

      assert.ok(capturedUrl.includes("query=nature"));
      assert.ok(!capturedUrl.includes("page="));
    });
  });

  describe("trackDownload", () => {
    it("should track download without throwing on success", async () => {
      global.fetch = mock.fn(async () => ({
        ok: true,
        status: 200
      })) as any;

      const client = new UnsplashClient("test-key");

      await assert.doesNotReject(
        async () => client.trackDownload("https://api.unsplash.com/photos/test/download")
      );
    });

    it("should not throw on download tracking failure", async () => {
      global.fetch = mock.fn(async () => {
        throw new Error("Network error");
      }) as any;

      const client = new UnsplashClient("test-key");

      // Should not throw, tracking is best-effort
      await assert.doesNotReject(
        async () => client.trackDownload("https://api.unsplash.com/photos/test/download")
      );
    });
  });
});
