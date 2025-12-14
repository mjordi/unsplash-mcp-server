# Agent Instructions for Unsplash MCP Server

## Project Context

You are working on an **Unsplash MCP Server** - a Model Context Protocol server that integrates with the Unsplash API. This server allows LLMs to search for photos, collections, and users on Unsplash through a standardized MCP interface.

**Tech Stack:**
- TypeScript with ES modules
- Node.js LTS (currently 20.x)
- MCP SDK (@modelcontextprotocol/sdk)
- Zod for validation
- Node's built-in test runner

## Architecture Overview

### File Structure
```
src/
├── index.ts                          # MCP server entry point (stdio/HTTP)
├── services/
│   ├── unsplash-client.ts           # Unsplash API client
│   ├── unsplash-client.test.ts      # API client tests
│   ├── formatters.ts                # Response formatters
│   └── formatters.test.ts           # Formatter tests
├── tools/
│   ├── photos.ts                    # Photo-related MCP tools
│   └── collections-users.ts         # Collection/user MCP tools
├── schemas/
│   └── index.ts                     # Zod validation schemas
├── types.ts                         # TypeScript type definitions
└── constants.ts                     # Constants (API URL, limits)
```

### Key Components

**UnsplashClient** (`src/services/unsplash-client.ts`)
- Handles all HTTP communication with Unsplash API
- Implements error handling with `UnsplashAPIError` class
- Provides `makeRequest<T>()` and `trackDownload()` methods

**Formatters** (`src/services/formatters.ts`)
- Convert API responses to markdown or JSON
- Include: `formatPhotoMarkdown()`, `formatCollectionMarkdown()`, `formatUserMarkdown()`, etc.
- Use `truncateIfNeeded()` for content length management

**MCP Tools** (`src/tools/`)
- Register tools with the MCP server
- Use Zod schemas for input validation
- Return formatted responses (markdown or JSON based on `format` parameter)

## Development Guidelines

### When Adding New Features

**Step-by-step process:**
1. Add types to `src/types.ts`
2. Create Zod schema in `src/schemas/index.ts`
3. Add API method to `UnsplashClient` if needed
4. Create formatter function in `src/services/formatters.ts`
5. Register MCP tool in appropriate file under `src/tools/`
6. Write comprehensive tests
7. Update AGENTS.md if new patterns are introduced

### Testing Requirements

**Critical:** All test fixtures MUST include every required field from `src/types.ts`. The types use strict TypeScript interfaces.

**Example: Creating a test UnsplashUser**
```typescript
const user: UnsplashUser = {
  id: "user-1",
  username: "photographer",
  name: "John Doe",
  first_name: "John",        // Required!
  last_name: "Doe",          // Required!
  total_likes: 100,
  total_photos: 50,
  total_collections: 5,
  profile_image: {           // Required!
    small: "https://...",
    medium: "https://...",
    large: "https://..."
  },
  links: {                   // All links required
    self: "https://...",
    html: "https://...",
    photos: "https://...",
    likes: "https://...",
    portfolio: "https://..."
  }
  // Optional fields can be omitted or set to undefined
};
```

**Test commands:**
```bash
npm test       # Build and run all tests
npm run build  # Compile TypeScript only
```

### Code Patterns

**Error Handling:**
```typescript
try {
  const data = await client.makeRequest<ResponseType>('/endpoint', params);
  return formatResponse(data);
} catch (error) {
  if (error instanceof UnsplashAPIError) {
    throw new Error(`Unsplash API error: ${error.message}`);
  }
  throw error;
}
```

**Adding an MCP Tool:**
```typescript
server.addTool({
  name: "tool_name",
  description: "Clear description of what this tool does",
  inputSchema: zodToJsonSchema(ToolInputSchema),
  handler: async (input) => {
    const validated = ToolInputSchema.parse(input);
    const response = await client.makeRequest<DataType>('/endpoint', {
      query: validated.query,
      per_page: validated.per_page
    });

    if (validated.format === 'json') {
      return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
    }

    const markdown = formatDataMarkdown(response);
    return { content: [{ type: "text", text: truncateIfNeeded(markdown) }] };
  }
});
```

**Unsplash API Requirements:**
- Always track downloads: `await client.trackDownload(photo.links.download_location)`
- Handle rate limits (50 requests/hour for demo keys)
- Use proper attribution in responses

### Important Conventions

1. **ES Modules:** All imports must end with `.js` extension
2. **Character Limits:** Use `truncateIfNeeded()` for large responses (default: 100,000 chars)
3. **Response Format:** Support both `json` and `markdown` output formats
4. **Type Safety:** Use TypeScript strict mode, no `any` unless absolutely necessary
5. **No Emojis:** Avoid emojis in code (only in commits when specified)

## CI/CD Pipeline

### Workflows

**CI Pipeline** (`.github/workflows/ci.yml`)
- Triggers: Push to main, all PRs
- Node Version: Latest LTS (automatic)
- Steps: Install → Test → Build → TypeScript check

**Dependabot Auto-Merge** (`.github/workflows/dependabot-auto-merge.yml`)
- Auto-merges Dependabot PRs when all tests pass
- Uses squash merge strategy
- Waits for CI completion before merging

**Dependabot Config** (`.github/dependabot.yml`)
- Weekly updates every Monday
- Max 10 open PRs
- Labels: "dependencies", "automated"

### Pre-commit Checklist

Before committing:
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] New code has tests
- [ ] Test fixtures include all required type fields
- [ ] Updated AGENTS.md if patterns changed

## Environment Configuration

```bash
# Required
UNSPLASH_ACCESS_KEY=your_key_here

# Optional
TRANSPORT=stdio           # or "http"
PORT=3000                 # for HTTP transport
```

## Common Issues & Solutions

### Issue: Tests fail with "missing properties"
**Solution:** Check `src/types.ts` for all required fields. Test fixtures must include every non-optional field.

### Issue: "Module not found" errors
**Solution:** Ensure import paths end with `.js` (ESM requirement)

### Issue: API returns 401 Unauthorized
**Solution:** Verify `UNSPLASH_ACCESS_KEY` is set correctly

### Issue: Build fails after adding new imports
**Solution:** Run `npm install` to ensure dependencies are installed

## Debugging Tips

**Enable API response logging:**
```typescript
console.error("API Response:", JSON.stringify(response, null, 2));
```

**Check test output:**
```bash
node --test dist/**/*.test.js --test-reporter=spec
```

## Resources

- [MCP SDK Documentation](https://modelcontextprotocol.io/)
- [Unsplash API Reference](https://unsplash.com/documentation)
- [Zod Schema Validation](https://zod.dev/)
- [Node.js Test Runner](https://nodejs.org/api/test.html)

## Decision Framework

**When to add a new file:**
- New tool category → New file in `src/tools/`
- New service layer → New file in `src/services/`
- Always colocate tests with source (`.test.ts`)

**When to modify existing files:**
- Adding similar functionality → Extend existing tool file
- New response format → Add to `formatters.ts`
- New types → Add to `types.ts`

**When to write tests:**
- Always! Every new function needs tests
- Test both success and error cases
- Mock `fetch` for API client tests

## Best Practices Summary

1. **Read before writing:** Always read `src/types.ts` before creating test fixtures
2. **Test thoroughly:** Cover success cases, error cases, and edge cases
3. **Follow patterns:** Match existing code style and structure
4. **Document decisions:** Update this file when introducing new patterns
5. **CI-first:** Let workflows complete before merging
6. **Type safety:** Leverage TypeScript, avoid type assertions when possible
7. **User-focused:** Return helpful error messages and well-formatted responses
