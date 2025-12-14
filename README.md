# Unsplash MCP Server

A Model Context Protocol (MCP) server that provides access to the Unsplash API, enabling AI assistants to search and retrieve high-quality, free-to-use photos.

## Features

- 🔍 **Search Photos**: Search millions of high-quality photos by keywords with advanced filters
- 📸 **Photo Details**: Get detailed information about specific photos including EXIF data
- 🎲 **Random Photos**: Get random photos, optionally filtered by query or orientation
- 📚 **Collections**: Search and browse curated photo collections
- 👤 **User Profiles**: Search photographers and view their portfolios
- 📊 **Statistics**: Get view, download, and like statistics for photos
- 🎨 **Advanced Filters**: Filter by orientation, color, content safety level
- 📝 **Multiple Formats**: Response in JSON or Markdown format

## Installation

### Prerequisites

- Node.js 18 or higher
- An Unsplash API access key

### Getting an Unsplash API Key

1. Visit [Unsplash Developers](https://unsplash.com/developers)
2. Create an account or log in
3. Click "New Application"
4. Fill in the required details and accept the terms
5. Copy your **Access Key**

**Note**: Demo accounts are limited to 50 requests per hour. Apply for production access for higher limits.

### Setup

```bash
# Clone or download this repository
cd unsplash-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Set your API key
export UNSPLASH_ACCESS_KEY=your_access_key_here
```

## Usage

### Running with stdio (for Claude Desktop, etc.)

```bash
npm start
# or
node dist/index.js
```

### Running with HTTP transport

```bash
TRANSPORT=http PORT=3000 npm start
```

### Configuration for Claude Desktop

Add to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "unsplash": {
      "command": "node",
      "args": ["/path/to/unsplash-mcp-server/dist/index.js"],
      "env": {
        "UNSPLASH_ACCESS_KEY": "your_access_key_here"
      }
    }
  }
}
```

## Available Tools

### Photo Search & Retrieval

#### `unsplash_search_photos`
Search for photos by keywords with advanced filtering.

**Parameters**:
- `query` (string, required): Search keywords
- `page` (number): Page number (default: 1)
- `per_page` (number): Results per page, 1-30 (default: 10)
- `orientation` (string): Filter by "landscape", "portrait", or "squarish"
- `content_filter` (string): "low" (default) or "high" safety filter
- `color` (string): Filter by color name (e.g., "black", "white", "red")
- `order_by` (string): Sort by "relevant" (default) or "latest"
- `response_format` (string): "markdown" (default) or "json"

**Example**:
```
Search for: "mountain sunset"
Filter by: orientation="landscape", color="orange"
```

#### `unsplash_get_photo`
Get detailed information about a specific photo.

**Parameters**:
- `id` (string, required): Unsplash photo ID
- `response_format` (string): "markdown" or "json"

#### `unsplash_get_random`
Get one or more random photos.

**Parameters**:
- `query` (string): Optional search filter
- `orientation` (string): Filter by orientation
- `content_filter` (string): Safety filter level
- `count` (number): Number of photos, 1-30 (default: 1)
- `response_format` (string): Output format

#### `unsplash_list_photos`
List photos from Unsplash's editorial feed.

**Parameters**:
- `page` (number): Page number
- `per_page` (number): Results per page
- `order_by` (string): "latest", "oldest", or "popular"
- `response_format` (string): Output format

#### `unsplash_get_statistics`
Get view, download, and like statistics for a photo.

**Parameters**:
- `id` (string, required): Photo ID
- `response_format` (string): Output format

#### `unsplash_track_download`
Track a photo download (required by Unsplash API guidelines).

**Parameters**:
- `id` (string, required): Photo ID being downloaded

**Important**: Always call this before downloading/using a photo programmatically.

### Collections

#### `unsplash_search_collections`
Search for curated photo collections.

**Parameters**:
- `query` (string, required): Search keywords
- `page` (number): Page number
- `per_page` (number): Results per page
- `response_format` (string): Output format

#### `unsplash_get_collection_photos`
Get photos from a specific collection.

**Parameters**:
- `id` (string, required): Collection ID
- `page` (number): Page number
- `per_page` (number): Results per page
- `orientation` (string): Filter by orientation
- `response_format` (string): Output format

### Users

#### `unsplash_search_users`
Search for photographers and users.

**Parameters**:
- `query` (string, required): Search keywords
- `page` (number): Page number
- `per_page` (number): Results per page
- `response_format` (string): Output format

#### `unsplash_get_user_photos`
Get photos by a specific user.

**Parameters**:
- `username` (string, required): Unsplash username
- `page` (number): Page number
- `per_page` (number): Results per page
- `order_by` (string): "latest", "oldest", or "popular"
- `orientation` (string): Filter by orientation
- `response_format` (string): Output format

## API Guidelines & Attribution

### Unsplash API Usage

When using photos from Unsplash:

1. **Track Downloads**: Always call `unsplash_track_download` when downloading photos programmatically
2. **Attribution**: While not required, attribution to photographers is appreciated
3. **Hotlinking**: Use the Unsplash CDN URLs directly (don't re-host images)
4. **Rate Limits**: Demo accounts have 50 requests/hour; production accounts have higher limits

### Example Attribution

```
Photo by [Photographer Name] on Unsplash
```

## Development

### Project Structure

```
unsplash-mcp-server/
├── src/
│   ├── index.ts              # Main entry point
│   ├── types.ts              # TypeScript type definitions
│   ├── constants.ts          # Configuration constants
│   ├── services/
│   │   ├── unsplash-client.ts   # API client
│   │   └── formatters.ts        # Response formatting
│   ├── schemas/
│   │   └── index.ts             # Zod validation schemas
│   └── tools/
│       ├── photos.ts            # Photo-related tools
│       └── collections-users.ts # Collection/user tools
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build
```

### Development with Watch Mode

```bash
npm run dev
```

## Error Handling

The server provides clear error messages for common issues:

- **401 Unauthorized**: Invalid or missing API key
- **403 Forbidden**: Rate limit exceeded or insufficient permissions
- **404 Not Found**: Photo, collection, or user doesn't exist
- **Network errors**: Connection issues with Unsplash API

## License

MIT License - See LICENSE file for details

## Credits

- Built with the [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- Uses the [Unsplash API](https://unsplash.com/developers)
- All photos provided by [Unsplash](https://unsplash.com) photographers

## Support

For issues with:
- **This MCP server**: Open an issue in this repository
- **Unsplash API**: Contact api@unsplash.com or visit [Unsplash Help](https://help.unsplash.com/)
- **MCP Protocol**: See [MCP Documentation](https://modelcontextprotocol.io/)
