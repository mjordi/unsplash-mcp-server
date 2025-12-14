// Collection and user tools

import { z } from "zod";
import { UnsplashClient } from "../services/unsplash-client.js";
import {
  SearchCollectionsSchema,
  GetCollectionPhotosSchema,
  SearchUsersSchema,
  GetUserPhotosSchema
} from "../schemas/index.js";
import {
  SearchCollectionsResponse,
  SearchUsersResponse,
  UnsplashPhoto,
  ResponseFormat
} from "../types.js";
import {
  formatCollectionsListMarkdown,
  formatPhotosListMarkdown,
  formatUsersListMarkdown,
  truncateIfNeeded
} from "../services/formatters.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerCollectionAndUserTools(
  server: McpServer,
  client: UnsplashClient
): void {
  // Search collections
  server.registerTool(
    "unsplash_search_collections",
    {
      title: "Search Photo Collections",
      description: `Search for curated photo collections on Unsplash.

Collections are curated sets of photos organized by theme, created by Unsplash users. Use this to find themed photo sets.

Args:
  - query (string): Search keywords for collections
  - page (number): Page number for pagination (default: 1)
  - per_page (number): Results per page, 1-30 (default: 10)
  - response_format (string): Output as 'markdown' (default) or 'json'

Returns:
  For JSON format: Search results with collection metadata
  {
    "total": number,
    "total_pages": number,
    "results": [
      {
        "id": string,
        "title": string,
        "description": string,
        "total_photos": number,
        "user": { ... },
        "links": { ... }
      }
    ]
  }

Examples:
  - Find travel collections: query="travel"
  - Architecture collections: query="architecture"`,
      inputSchema: SearchCollectionsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: z.infer<typeof SearchCollectionsSchema>) => {
      try {
        const data = await client.makeRequest<SearchCollectionsResponse>(
          "/search/collections",
          {
            query: params.query,
            page: params.page,
            per_page: params.per_page
          }
        );

        if (data.results.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No collections found for query: "${params.query}"`
            }]
          };
        }

        const output = {
          total: data.total,
          total_pages: data.total_pages,
          page: params.page,
          per_page: params.per_page,
          results: data.results
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify(output, null, 2)
            }],
            structuredContent: output
          };
        }

        let markdown = `# Collection Search Results for "${params.query}"\n\n`;
        markdown += `Found ${data.total.toLocaleString()} collections (Page ${params.page} of ${data.total_pages})\n\n`;
        markdown += formatCollectionsListMarkdown(data.results);

        if (params.page < data.total_pages) {
          markdown += `\n\n*Use page=${params.page + 1} to see more results*`;
        }

        return {
          content: [{
            type: "text",
            text: truncateIfNeeded(markdown)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{
            type: "text",
            text: `Error searching collections: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Get collection photos
  server.registerTool(
    "unsplash_get_collection_photos",
    {
      title: "Get Collection Photos",
      description: `Get all photos from a specific Unsplash collection.

Use this to retrieve photos from a curated collection. First use unsplash_search_collections to find collection IDs.

Args:
  - id (string): Collection ID
  - page (number): Page number for pagination (default: 1)
  - per_page (number): Results per page, 1-30 (default: 10)
  - orientation (string, optional): Filter by 'landscape', 'portrait', or 'squarish'
  - response_format (string): Output as 'markdown' (default) or 'json'

Returns:
  Array of photos from the collection

Examples:
  - Get collection photos: id="3330445"
  - Portrait photos only: id="3330445", orientation="portrait"`,
      inputSchema: GetCollectionPhotosSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: z.infer<typeof GetCollectionPhotosSchema>) => {
      try {
        const requestParams: Record<string, string | number | boolean> = {
          page: params.page,
          per_page: params.per_page
        };

        if (params.orientation) {
          requestParams.orientation = params.orientation;
        }

        const photos = await client.makeRequest<UnsplashPhoto[]>(
          `/collections/${params.id}/photos`,
          requestParams
        );

        if (photos.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No photos found in collection ${params.id}`
            }]
          };
        }

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify(photos, null, 2)
            }],
            structuredContent: { photos }
          };
        }

        let markdown = `# Photos from Collection ${params.id}\n\n`;
        markdown += `Page ${params.page}\n\n`;
        markdown += formatPhotosListMarkdown(photos);

        return {
          content: [{
            type: "text",
            text: truncateIfNeeded(markdown)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{
            type: "text",
            text: `Error fetching collection photos: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Search users
  server.registerTool(
    "unsplash_search_users",
    {
      title: "Search Photographers",
      description: `Search for photographers and users on Unsplash.

Find photographers by name or username to explore their portfolio.

Args:
  - query (string): Search keywords for users/photographers
  - page (number): Page number for pagination (default: 1)
  - per_page (number): Results per page, 1-30 (default: 10)
  - response_format (string): Output as 'markdown' (default) or 'json'

Returns:
  For JSON format: User search results
  {
    "total": number,
    "total_pages": number,
    "results": [
      {
        "id": string,
        "username": string,
        "name": string,
        "total_photos": number,
        "total_likes": number,
        "total_collections": number,
        "links": { ... }
      }
    ]
  }

Examples:
  - Find photographer: query="John Doe"
  - Search username: query="photographer123"`,
      inputSchema: SearchUsersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: z.infer<typeof SearchUsersSchema>) => {
      try {
        const data = await client.makeRequest<SearchUsersResponse>("/search/users", {
          query: params.query,
          page: params.page,
          per_page: params.per_page
        });

        if (data.results.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No users found for query: "${params.query}"`
            }]
          };
        }

        const output = {
          total: data.total,
          total_pages: data.total_pages,
          page: params.page,
          per_page: params.per_page,
          results: data.results
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{
              type: "text",
            text: JSON.stringify(output, null, 2)
            }],
            structuredContent: output
          };
        }

        let markdown = `# User Search Results for "${params.query}"\n\n`;
        markdown += `Found ${data.total.toLocaleString()} users (Page ${params.page} of ${data.total_pages})\n\n`;
        markdown += formatUsersListMarkdown(data.results);

        if (params.page < data.total_pages) {
          markdown += `\n\n*Use page=${params.page + 1} to see more results*`;
        }

        return {
          content: [{
            type: "text",
            text: truncateIfNeeded(markdown)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{
            type: "text",
            text: `Error searching users: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Get user photos
  server.registerTool(
    "unsplash_get_user_photos",
    {
      title: "Get User's Photos",
      description: `Get photos uploaded by a specific Unsplash user/photographer.

Retrieve the portfolio of a photographer. Use unsplash_search_users first to find usernames.

Args:
  - username (string): Unsplash username
  - page (number): Page number for pagination (default: 1)
  - per_page (number): Results per page, 1-30 (default: 10)
  - order_by (string): Sort by 'latest' (default), 'oldest', or 'popular'
  - orientation (string, optional): Filter by 'landscape', 'portrait', or 'squarish'
  - response_format (string): Output as 'markdown' (default) or 'json'

Returns:
  Array of photos by the user

Examples:
  - Get user photos: username="johndoe"
  - Popular photos: username="johndoe", order_by="popular"`,
      inputSchema: GetUserPhotosSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: z.infer<typeof GetUserPhotosSchema>) => {
      try {
        const requestParams: Record<string, string | number | boolean> = {
          page: params.page,
          per_page: params.per_page,
          order_by: params.order_by
        };

        if (params.orientation) {
          requestParams.orientation = params.orientation;
        }

        const photos = await client.makeRequest<UnsplashPhoto[]>(
          `/users/${params.username}/photos`,
          requestParams
        );

        if (photos.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No photos found for user: ${params.username}`
            }]
          };
        }

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify(photos, null, 2)
            }],
            structuredContent: { photos }
          };
        }

        let markdown = `# Photos by @${params.username}\n\n`;
        markdown += `Page ${params.page} (${params.order_by})\n\n`;
        markdown += formatPhotosListMarkdown(photos);

        return {
          content: [{
            type: "text",
            text: truncateIfNeeded(markdown)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{
            type: "text",
            text: `Error fetching user photos: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );
}
