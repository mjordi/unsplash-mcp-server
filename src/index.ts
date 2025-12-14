#!/usr/bin/env node

// Main entry point for Unsplash MCP Server

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { UnsplashClient } from "./services/unsplash-client.js";
import { registerPhotoTools } from "./tools/photos.js";
import { registerCollectionAndUserTools } from "./tools/collections-users.js";

// Initialize MCP Server
const server = new McpServer({
  name: "unsplash-mcp-server",
  version: "1.0.0"
});

// Initialize Unsplash client
const accessKey = process.env.UNSPLASH_ACCESS_KEY;
if (!accessKey) {
  console.error("Error: UNSPLASH_ACCESS_KEY environment variable is required");
  console.error("\nTo get an API key:");
  console.error("1. Visit https://unsplash.com/developers");
  console.error("2. Create an account or log in");
  console.error("3. Create a new application");
  console.error("4. Copy your Access Key");
  console.error("\nThen set it as an environment variable:");
  console.error("export UNSPLASH_ACCESS_KEY=your_access_key_here");
  process.exit(1);
}

const client = new UnsplashClient(accessKey);

// Register all tools
registerPhotoTools(server, client);
registerCollectionAndUserTools(server, client);

// stdio transport for local use
async function runStdio(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Unsplash MCP server running on stdio");
}

// HTTP transport for remote use
async function runHTTP(): Promise<void> {
  const app = express();
  app.use(express.json());

  app.post('/mcp', async (req, res) => {
    // Create new transport for each request (stateless)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });

    res.on('close', () => transport.close());

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || '3000');
  app.listen(port, () => {
    console.error(`Unsplash MCP server running on http://localhost:${port}/mcp`);
  });
}

// Choose transport based on environment
const transport = process.env.TRANSPORT || 'stdio';
if (transport === 'http') {
  runHTTP().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
