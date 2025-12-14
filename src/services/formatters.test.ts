import { describe, it } from "node:test";
import assert from "node:assert";
import {
  formatPhotoMarkdown,
  formatCollectionMarkdown,
  formatUserMarkdown,
  formatStatisticsMarkdown,
  truncateIfNeeded,
  formatPhotosListMarkdown,
  formatCollectionsListMarkdown,
  formatUsersListMarkdown
} from "./formatters.js";
import type { UnsplashPhoto, UnsplashCollection, UnsplashUser, PhotoStatistics } from "../types.js";

describe("formatters", () => {
  describe("formatPhotoMarkdown", () => {
    it("should format photo with all fields", () => {
      const photo: UnsplashPhoto = {
        id: "test-123",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        width: 1920,
        height: 1080,
        color: "#000000",
        blur_hash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
        likes: 42,
        liked_by_user: false,
        description: "Test photo",
        alt_description: "A test photo",
        urls: {
          raw: "https://example.com/raw",
          full: "https://example.com/full",
          regular: "https://example.com/regular",
          small: "https://example.com/small",
          thumb: "https://example.com/thumb"
        },
        links: {
          self: "https://api.unsplash.com/photos/test-123",
          html: "https://unsplash.com/photos/test-123",
          download: "https://unsplash.com/photos/test-123/download",
          download_location: "https://api.unsplash.com/photos/test-123/download"
        },
        user: {
          id: "user-1",
          username: "testuser",
          name: "Test User",
          first_name: "Test",
          last_name: "User",
          portfolio_url: "https://example.com",
          bio: "Test bio",
          location: "Test City",
          total_likes: 100,
          total_photos: 50,
          total_collections: 5,
          instagram_username: "testuser",
          twitter_username: "testuser",
          profile_image: {
            small: "https://example.com/small.jpg",
            medium: "https://example.com/medium.jpg",
            large: "https://example.com/large.jpg"
          },
          links: {
            self: "https://api.unsplash.com/users/testuser",
            html: "https://unsplash.com/@testuser",
            photos: "https://api.unsplash.com/users/testuser/photos",
            likes: "https://api.unsplash.com/users/testuser/likes",
            portfolio: "https://api.unsplash.com/users/testuser/portfolio"
          }
        },
        location: {
          name: "Test Location"
        },
        tags: [
          { title: "test" },
          { title: "photo" }
        ]
      };

      const result = formatPhotoMarkdown(photo);

      assert.ok(result.includes("A test photo"));
      assert.ok(result.includes("test-123"));
      assert.ok(result.includes("Test User"));
      assert.ok(result.includes("1920 × 1080px"));
      assert.ok(result.includes("42"));
      assert.ok(result.includes("Test Location"));
      assert.ok(result.includes("test, photo"));
    });
  });

  describe("formatCollectionMarkdown", () => {
    it("should format collection correctly", () => {
      const collection: UnsplashCollection = {
        id: "coll-123",
        title: "Test Collection",
        description: "A test collection",
        published_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        total_photos: 25,
        private: false,
        share_key: "test-key",
        cover_photo: {} as any,
        links: {
          self: "https://api.unsplash.com/collections/coll-123",
          html: "https://unsplash.com/collections/coll-123",
          photos: "https://api.unsplash.com/collections/coll-123/photos"
        },
        user: {
          id: "user-1",
          username: "curator",
          name: "Test Curator",
          first_name: "Test",
          last_name: "Curator",
          total_likes: 0,
          total_photos: 0,
          total_collections: 0,
          profile_image: {
            small: "https://example.com/small.jpg",
            medium: "https://example.com/medium.jpg",
            large: "https://example.com/large.jpg"
          },
          links: {
            self: "https://api.unsplash.com/users/curator",
            html: "https://unsplash.com/@curator",
            photos: "https://api.unsplash.com/users/curator/photos",
            likes: "https://api.unsplash.com/users/curator/likes",
            portfolio: "https://api.unsplash.com/users/curator/portfolio"
          }
        }
      };

      const result = formatCollectionMarkdown(collection);

      assert.ok(result.includes("Test Collection"));
      assert.ok(result.includes("coll-123"));
      assert.ok(result.includes("Test Curator"));
      assert.ok(result.includes("25"));
    });
  });

  describe("formatUserMarkdown", () => {
    it("should format user profile correctly", () => {
      const user: UnsplashUser = {
        id: "user-1",
        username: "testuser",
        name: "Test User",
        first_name: "Test",
        last_name: "User",
        portfolio_url: "https://example.com",
        bio: "Professional photographer",
        location: "New York",
        total_likes: 1000,
        total_photos: 150,
        total_collections: 10,
        instagram_username: "testuser",
        profile_image: {
          small: "https://example.com/small.jpg",
          medium: "https://example.com/medium.jpg",
          large: "https://example.com/large.jpg"
        },
        links: {
          self: "https://api.unsplash.com/users/testuser",
          html: "https://unsplash.com/@testuser",
          photos: "https://api.unsplash.com/users/testuser/photos",
          likes: "https://api.unsplash.com/users/testuser/likes",
          portfolio: "https://api.unsplash.com/users/testuser/portfolio"
        }
      };

      const result = formatUserMarkdown(user);

      assert.ok(result.includes("Test User"));
      assert.ok(result.includes("@testuser"));
      assert.ok(result.includes("150"));
      assert.ok(result.includes("1000"));
      assert.ok(result.includes("Professional photographer"));
      assert.ok(result.includes("New York"));
    });
  });

  describe("formatStatisticsMarkdown", () => {
    it("should format statistics correctly", () => {
      const stats: PhotoStatistics = {
        id: "photo-123",
        downloads: {
          total: 5000,
          historical: {
            change: 250,
            values: []
          }
        },
        views: {
          total: 50000,
          historical: {
            change: -100,
            values: []
          }
        },
        likes: {
          total: 500,
          historical: {
            change: 10,
            values: []
          }
        }
      };

      const result = formatStatisticsMarkdown(stats);

      assert.ok(result.includes("photo-123"));
      assert.ok(result.includes("5,000"));
      assert.ok(result.includes("50,000"));
      assert.ok(result.includes("+250"));
      assert.ok(result.includes("-100"));
    });
  });

  describe("truncateIfNeeded", () => {
    it("should not truncate short content", () => {
      const content = "Short content";
      const result = truncateIfNeeded(content, 100);

      assert.strictEqual(result, content);
    });

    it("should truncate long content", () => {
      const content = "a".repeat(1000);
      const result = truncateIfNeeded(content, 500);

      assert.ok(result.length < content.length);
      assert.ok(result.includes("Content truncated"));
      assert.ok(result.includes("1000 characters"));
    });
  });

  describe("formatPhotosListMarkdown", () => {
    it("should format list of photos", () => {
      const photos: UnsplashPhoto[] = [
        {
          id: "photo-1",
          alt_description: "First photo",
          width: 1920,
          height: 1080,
          likes: 10,
          links: {
            html: "https://unsplash.com/photos/photo-1",
            self: "",
            download: "",
            download_location: ""
          },
          user: {
            name: "User One",
            username: "user1",
            id: "",
            first_name: "User",
            last_name: "One",
            total_likes: 0,
            total_photos: 0,
            total_collections: 0,
            profile_image: {
              small: "",
              medium: "",
              large: ""
            },
            links: {
              self: "",
              html: "",
              photos: "",
              likes: "",
              portfolio: ""
            }
          },
          created_at: "",
          updated_at: "",
          color: "",
          blur_hash: "",
          liked_by_user: false,
          urls: {
            raw: "",
            full: "",
            regular: "",
            small: "",
            thumb: ""
          }
        }
      ];

      const result = formatPhotosListMarkdown(photos);

      assert.ok(result.includes("1. **First photo**"));
      assert.ok(result.includes("User One"));
      assert.ok(result.includes("1920 × 1080px"));
    });
  });

  describe("formatCollectionsListMarkdown", () => {
    it("should format list of collections", () => {
      const collections: UnsplashCollection[] = [
        {
          id: "coll-1",
          title: "Nature",
          total_photos: 50,
          private: false,
          share_key: "",
          cover_photo: {} as any,
          links: {
            html: "https://unsplash.com/collections/coll-1",
            self: "",
            photos: ""
          },
          user: {
            name: "Curator",
            username: "curator1",
            id: "",
            first_name: "Curator",
            last_name: "One",
            total_likes: 0,
            total_photos: 0,
            total_collections: 0,
            profile_image: {
              small: "",
              medium: "",
              large: ""
            },
            links: {
              self: "",
              html: "",
              photos: "",
              likes: "",
              portfolio: ""
            }
          },
          published_at: "",
          updated_at: ""
        }
      ];

      const result = formatCollectionsListMarkdown(collections);

      assert.ok(result.includes("1. **Nature**"));
      assert.ok(result.includes("Curator"));
      assert.ok(result.includes("50 photos"));
    });
  });

  describe("formatUsersListMarkdown", () => {
    it("should format list of users", () => {
      const users: UnsplashUser[] = [
        {
          id: "user-1",
          username: "photographer1",
          name: "Great Photographer",
          first_name: "Great",
          last_name: "Photographer",
          total_photos: 100,
          total_likes: 500,
          total_collections: 0,
          profile_image: {
            small: "",
            medium: "",
            large: ""
          },
          links: {
            html: "https://unsplash.com/@photographer1",
            self: "",
            photos: "",
            likes: "",
            portfolio: ""
          }
        }
      ];

      const result = formatUsersListMarkdown(users);

      assert.ok(result.includes("1. **Great Photographer**"));
      assert.ok(result.includes("@photographer1"));
      assert.ok(result.includes("100 photos"));
      assert.ok(result.includes("500 likes"));
    });
  });
});
