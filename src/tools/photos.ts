// Photo search and retrieval tools

import { z } from "zod";
import { UnsplashClient } from "../services/unsplash-client.js";
import {
  SearchPhotosSchema,
  GetPhotoSchema,
  GetRandomPhotoSchema,
  ListPhotosSchema,
  DownloadPhotoSchema,
  GetPhotoStatisticsSchema
} from "../schemas/index.js";
import {
  SearchPhotosResponse,
  UnsplashPhoto,
  PhotoStatistics,
  ResponseFormat
} from "../types.js";
import {
  formatPhotoMarkdown,
  formatPhotosListMarkdown,
  formatStatisticsMarkdown,
  truncateIfNeeded
} from "../services/formatters.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPhotoTools(server: McpServer, client: UnsplashClient): void {
  // Search photos
  server.registerTool(
    "unsplash_search_photos",
    {
      title: "Search Unsplash Photos",
      description: `Search for photos on Unsplash by keywords with advanced filtering options.

This tool searches through millions of high-quality, free-to-use photos from the Unsplash platform. You can filter by orientation, color, content safety level, and sort by relevance or recency.

Args:
  - query (string): Search keywords (e.g., "mountain sunset", "coffee cup", "architecture")
  - page (number): Page number for pagination (default: 1)
  - per_page (number): Results per page, 1-30 (default: 10)
  - orientation (string, optional): Filter by 'landscape', 'portrait', or 'squarish'
  - content_filter (string): Safety level 'low' (default) or 'high'
  - color (string, optional): Filter by color name (e.g., 'black', 'white', 'yellow', 'red')
  - order_by (string): Sort by 'relevant' (default) or 'latest'
  - response_format (string): Output as 'markdown' (default) or 'json'

Returns:
  For JSON format: Complete search results with metadata
  {
    "total": number,           // Total matching photos
    "total_pages": number,     // Total pages available
    "page": number,            // Current page
    "per_page": number,        // Results per page
    "results": [               // Array of photo objects
      {
        "id": string,
        "width": number,
        "height": number,
        "color": string,
        "likes": number,
        "description": string,
        "alt_description": string,
        "urls": {
          "raw": string,
          "full": string,
          "regular": string,
          "small": string,
          "thumb": string
        },
        "links": {
          "html": string,      // Unsplash page URL
          "download": string
        },
        "user": {
          "name": string,
          "username": string
        }
      }
    ]
  }

Examples:
  - Search for nature photos: query="forest waterfall"
  - Find portrait photos: query="portrait", orientation="portrait"
  - Latest tech photos: query="technology", order_by="latest"

Note: All photos from Unsplash are free to use. Attribution to the photographer is appreciated but not required.`,
      inputSchema: SearchPhotosSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: z.infer<typeof SearchPhotosSchema>) => {
      try {
        const data = await client.makeRequest<SearchPhotosResponse>("/search/photos", {
          query: params.query,
          page: params.page,
          per_page: params.per_page,
          ...(params.orientation && { orientation: params.orientation }),
          ...(params.color && { color: params.color }),
          content_filter: params.content_filter,
          order_by: params.order_by
        });

        if (data.results.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No photos found for query: "${params.query}"`
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

        // Markdown format
        let markdown = `# Search Results for "${params.query}"\n\n`;
        markdown += `Found ${data.total.toLocaleString()} photos (Page ${params.page} of ${data.total_pages})\n\n`;
        markdown += formatPhotosListMarkdown(data.results);

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
            text: `Error searching photos: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Get photo by ID
  server.registerTool(
    "unsplash_get_photo",
    {
      title: "Get Photo Details",
      description: `Retrieve detailed information about a specific Unsplash photo by its ID.

This tool fetches complete metadata for a photo including dimensions, photographer info, EXIF data, location, tags, and download URLs.

Args:
  - id (string): Unsplash photo ID (e.g., "LBI7cgq3pbM")
  - response_format (string): Output as 'markdown' (default) or 'json'

Returns:
  For JSON format: Complete photo object with all metadata
  {
    "id": string,
    "width": number,
    "height": number,
    "color": string,
    "blur_hash": string,
    "likes": number,
    "description": string,
    "alt_description": string,
    "created_at": string,
    "urls": { ... },
    "links": { ... },
    "user": { ... },
    "exif": { ... },        // Camera settings if available
    "location": { ... },    // Photo location if available
    "tags": [ ... ]
  }

Examples:
  - Get photo details: id="LBI7cgq3pbM"
  
Use unsplash_search_photos first to find photo IDs.`,
      inputSchema: GetPhotoSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: z.infer<typeof GetPhotoSchema>) => {
      try {
        const photo = await client.makeRequest<UnsplashPhoto>(`/photos/${params.id}`);

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify(photo, null, 2)
            }],
            structuredContent: photo
          };
        }

        const markdown = formatPhotoMarkdown(photo);
        return {
          content: [{
            type: "text",
            text: markdown
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{
            type: "text",
            text: `Error fetching photo: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Get random photo(s)
  server.registerTool(
    "unsplash_get_random",
    {
      title: "Get Random Photos",
      description: `Get one or more random photos from Unsplash, optionally filtered by search query or orientation.

This tool is perfect for getting inspiration, placeholder images, or diverse photo content. You can narrow the selection with search terms.

Args:
  - query (string, optional): Search terms to filter random selection
  - orientation (string, optional): Filter by 'landscape', 'portrait', or 'squarish'
  - content_filter (string): Safety level 'low' (default) or 'high'
  - count (number): Number of random photos (1-30, default: 1)
  - response_format (string): Output as 'markdown' (default) or 'json'

Returns:
  For JSON format: Array of photo objects
  For Markdown: Formatted list of photos with details

Examples:
  - Single random photo: (no parameters)
  - Random nature photos: query="nature", count=5
  - Random portraits: orientation="portrait", count=3

Note: Each request returns different random photos.`,
      inputSchema: GetRandomPhotoSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false, // Not idempotent - returns different results
        openWorldHint: true
      }
    },
    async (params: z.infer<typeof GetRandomPhotoSchema>) => {
      try {
        const requestParams: Record<string, string | number | boolean> = {
          content_filter: params.content_filter,
          count: params.count
        };

        if (params.query) {
          requestParams.query = params.query;
        }
        if (params.orientation) {
          requestParams.orientation = params.orientation;
        }

        const data = await client.makeRequest<UnsplashPhoto | UnsplashPhoto[]>(
          "/photos/random",
          requestParams
        );

        const photos = Array.isArray(data) ? data : [data];

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify(photos, null, 2)
            }],
            structuredContent: { photos }
          };
        }

        let markdown = `# Random Photos${params.query ? ` (${params.query})` : ""}\n\n`;
        markdown += formatPhotosListMarkdown(photos);

        return {
          content: [{
            type: "text",
            text: markdown
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{
            type: "text",
            text: `Error fetching random photos: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // List photos (editorial feed)
  server.registerTool(
    "unsplash_list_photos",
    {
      title: "List Editorial Photos",
      description: `List photos from Unsplash's editorial feed - curated high-quality photos.

This tool provides access to Unsplash's main photo feed, sorted by latest, oldest, or most popular.

Args:
  - page (number): Page number for pagination (default: 1)
  - per_page (number): Results per page, 1-30 (default: 10)
  - order_by (string): Sort by 'latest' (default), 'oldest', or 'popular'
  - response_format (string): Output as 'markdown' (default) or 'json'

Returns:
  For JSON format: Array of photo objects
  For Markdown: Formatted list with pagination info

Examples:
  - Latest photos: order_by="latest"
  - Most popular: order_by="popular", per_page=20`,
      inputSchema: ListPhotosSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: z.infer<typeof ListPhotosSchema>) => {
      try {
        const photos = await client.makeRequest<UnsplashPhoto[]>("/photos", {
          page: params.page,
          per_page: params.per_page,
          order_by: params.order_by
        });

        if (photos.length === 0) {
          return {
            content: [{
              type: "text",
              text: "No photos found"
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

        let markdown = `# Editorial Photos (${params.order_by})\n\n`;
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
            text: `Error listing photos: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Get photo statistics
  server.registerTool(
    "unsplash_get_statistics",
    {
      title: "Get Photo Statistics",
      description: `Get view, download, and like statistics for a specific photo.

This tool provides detailed analytics including total counts and recent trends for a photo's popularity.

Args:
  - id (string): Unsplash photo ID
  - response_format (string): Output as 'markdown' (default) or 'json'

Returns:
  Statistics including downloads, views, likes with historical trends

Examples:
  - Get stats: id="LBI7cgq3pbM"`,
      inputSchema: GetPhotoStatisticsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false, // Stats change over time
        openWorldHint: true
      }
    },
    async (params: z.infer<typeof GetPhotoStatisticsSchema>) => {
      try {
        const stats = await client.makeRequest<PhotoStatistics>(
          `/photos/${params.id}/statistics`
        );

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify(stats, null, 2)
            }],
            structuredContent: stats
          };
        }

        const markdown = formatStatisticsMarkdown(stats);
        return {
          content: [{
            type: "text",
            text: markdown
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{
            type: "text",
            text: `Error fetching statistics: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Track download
  server.registerTool(
    "unsplash_track_download",
    {
      title: "Track Photo Download",
      description: `Track a photo download (required by Unsplash API guidelines when downloading photos).

When you download a photo programmatically, you must call this tool to properly attribute the download to the photographer. This helps photographers understand how their work is being used.

Args:
  - id (string): Unsplash photo ID being downloaded

Returns:
  Confirmation that download was tracked

Examples:
  - Track download: id="LBI7cgq3pbM"
  
IMPORTANT: Always call this before downloading/using a photo programmatically.`,
      inputSchema: DownloadPhotoSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: z.infer<typeof DownloadPhotoSchema>) => {
      try {
        // First get the photo to get the download_location
        const photo = await client.makeRequest<UnsplashPhoto>(`/photos/${params.id}`);
        
        // Track the download
        await client.trackDownload(photo.links.download_location);

        return {
          content: [{
            type: "text",
            text: `Download tracked for photo ${params.id}. You can download the photo from: ${photo.urls.regular}`
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [{
            type: "text",
            text: `Error tracking download: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );
}
