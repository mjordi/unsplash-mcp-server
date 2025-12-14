# Claude Code Integration Guide

This document provides guidance for AI assistants (like Claude) working with the Unsplash MCP Server codebase.

## Project Overview

This is a Model Context Protocol (MCP) server that provides integration with the Unsplash API. It allows LLMs to search for photos, collections, and users on Unsplash through a standardized interface.

## Architecture

### Core Components

- **Entry Point**: `src/index.ts` - Initializes the MCP server with stdio or HTTP transport
- **API Client**: `src/services/unsplash-client.ts` - Handles all Unsplash API communication
- **Formatters**: `src/services/formatters.ts` - Converts API responses to markdown
- **Tools**:
  - `src/tools/photos.ts` - Photo search and retrieval operations
  - `src/tools/collections-users.ts` - Collection and user operations
- **Types**: `src/types.ts` - TypeScript interfaces for Unsplash API responses
- **Schemas**: `src/schemas/index.ts` - Zod validation schemas for tool parameters

### Key Patterns

1. **Error Handling**: Use `UnsplashAPIError` for API-related errors with status codes
2. **Response Formatting**: All responses can be returned as JSON or Markdown (controlled by `format` parameter)
3. **Character Limits**: Use `truncateIfNeeded()` to prevent overly long responses
4. **Download Tracking**: Always call `trackDownload()` when users download photos (Unsplash API requirement)

## Development Workflow

### Running Tests

```bash
npm test              # Build and run all tests
npm run build         # Compile TypeScript
npm run dev           # Watch mode for development
```

### Adding New Features

1. **New API Endpoints**:
   - Add method to `UnsplashClient` in `src/services/unsplash-client.ts`
   - Create formatter in `src/services/formatters.ts`
   - Register tool in appropriate file under `src/tools/`
   - Add Zod schema in `src/schemas/index.ts`
   - Add types in `src/types.ts`
   - Write tests

2. **Test Requirements**:
   - All new code should have corresponding tests
   - Tests use Node's built-in test runner
   - Mock data must match type definitions exactly
   - All required fields from `src/types.ts` must be included in test fixtures

### Common Tasks

#### Adding a New Tool

```typescript
// 1. Define schema in src/schemas/index.ts
export const MyToolSchema = z.object({
  query: z.string().describe("Search query"),
  format: ResponseFormatSchema.default("markdown")
});

// 2. Add formatter in src/services/formatters.ts
export function formatMyDataMarkdown(data: MyData): string {
  // Implementation
}

// 3. Register tool in appropriate file
server.addTool({
  name: "my_tool",
  description: "Tool description",
  inputSchema: zodToJsonSchema(MyToolSchema),
  handler: async (input) => {
    // Implementation
  }
});
```

#### Working with Types

All Unsplash API response types are defined in `src/types.ts`. Key interfaces:
- `UnsplashPhoto` - Photo metadata
- `UnsplashCollection` - Collection metadata
- `UnsplashUser` - User profile data
- `PhotoStatistics` - Photo statistics with historical data

Note: Many fields include `[key: string]: unknown` to handle additional API fields.

## Testing Guidelines

### Test File Structure

Tests are colocated with source files using `.test.ts` extension:
- `src/services/formatters.test.ts`
- `src/services/unsplash-client.test.ts`

### Writing Tests

```typescript
import { describe, it, mock } from "node:test";
import assert from "node:assert";

describe("feature name", () => {
  it("should do something", () => {
    // Arrange
    const input = "test";

    // Act
    const result = myFunction(input);

    // Assert
    assert.strictEqual(result, expectedValue);
  });
});
```

### Mocking fetch

```typescript
global.fetch = mock.fn(async () => ({
  ok: true,
  json: async () => ({ data: "test" }),
  status: 200
})) as any;
```

## CI/CD

### GitHub Actions Workflows

1. **CI Pipeline** (`.github/workflows/ci.yml`):
   - Runs on: Push to main, pull requests
   - Tests on: Node.js 18.x, 20.x, 22.x
   - Steps: Install, test, build, TypeScript check

2. **Dependabot Auto-Merge** (`.github/workflows/dependabot-auto-merge.yml`):
   - Automatically merges Dependabot PRs when tests pass
   - Waits for all CI checks to complete
   - Uses squash merge strategy

### Dependabot Configuration

Located in `.github/dependabot.yml`:
- Weekly updates on Mondays
- npm ecosystem
- Max 10 open PRs
- Labeled: "dependencies", "automated"

## Environment Variables

- `UNSPLASH_ACCESS_KEY` (required) - Unsplash API access key
- `TRANSPORT` (optional) - "stdio" (default) or "http"
- `PORT` (optional) - HTTP server port (default: 3000)

## API Rate Limits

Unsplash API limits:
- Demo: 50 requests/hour
- Production: Contact Unsplash for higher limits

Always implement proper error handling for rate limit errors (status 429).

## Code Style

- Use ES modules (`import/export`)
- Prefer `const` over `let`
- Use TypeScript strict mode
- Follow existing formatting patterns
- No emojis in code (only in commits/docs when specified)

## Troubleshooting

### Common Issues

1. **Tests failing with type errors**: Ensure all required fields from `src/types.ts` are included in test fixtures
2. **API errors**: Check `UNSPLASH_ACCESS_KEY` is set and valid
3. **Build errors**: Run `npm install` to ensure all dependencies are installed
4. **Module not found**: Check import paths end with `.js` (ESM requirement)

### Debugging

Enable verbose logging by checking API responses:
```typescript
console.error("API Response:", JSON.stringify(response, null, 2));
```

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Unsplash API Docs](https://unsplash.com/documentation)
- [Zod Documentation](https://zod.dev/)
- [Node.js Test Runner](https://nodejs.org/api/test.html)

## Contributing

When making changes:
1. Update tests to cover new functionality
2. Ensure all tests pass (`npm test`)
3. Update this CLAUDE.md if adding new patterns or conventions
4. Follow commit message format (see git history)
5. Let CI workflows complete before merging
