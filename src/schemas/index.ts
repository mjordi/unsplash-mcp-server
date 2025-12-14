// Zod schemas for input validation

import { z } from "zod";
import {
  ResponseFormat,
  PhotoOrientation,
  PhotoOrderBy,
  ContentFilter
} from "../types.js";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants.js";

export const SearchPhotosSchema = z.object({
  query: z.string()
    .min(1, "Query must not be empty")
    .max(200, "Query must not exceed 200 characters")
    .describe("Search terms to find photos"),
  page: z.number()
    .int()
    .min(1)
    .default(1)
    .describe("Page number for pagination (starts at 1)"),
  per_page: z.number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE)
    .describe(`Number of results per page (max ${MAX_PAGE_SIZE})`),
  orientation: z.nativeEnum(PhotoOrientation)
    .optional()
    .describe("Filter by photo orientation: landscape, portrait, or squarish"),
  content_filter: z.nativeEnum(ContentFilter)
    .default(ContentFilter.LOW)
    .describe("Content safety filter level: low (default) or high"),
  color: z.string()
    .optional()
    .describe("Filter by color (e.g., 'black', 'white', 'yellow', 'red', 'purple', etc.)"),
  order_by: z.nativeEnum(PhotoOrderBy)
    .default(PhotoOrderBy.RELEVANT)
    .describe("Sort order: relevant (default) or latest"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: markdown (default) or json")
}).strict();

export const GetPhotoSchema = z.object({
  id: z.string()
    .min(1, "Photo ID is required")
    .describe("Unsplash photo ID"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: markdown (default) or json")
}).strict();

export const GetRandomPhotoSchema = z.object({
  query: z.string()
    .optional()
    .describe("Optional search query to narrow random selection"),
  orientation: z.nativeEnum(PhotoOrientation)
    .optional()
    .describe("Filter by photo orientation"),
  content_filter: z.nativeEnum(ContentFilter)
    .default(ContentFilter.LOW)
    .describe("Content safety filter level"),
  count: z.number()
    .int()
    .min(1)
    .max(30)
    .default(1)
    .describe("Number of random photos to return (max 30)"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: markdown (default) or json")
}).strict();

export const ListPhotosSchema = z.object({
  page: z.number()
    .int()
    .min(1)
    .default(1)
    .describe("Page number for pagination"),
  per_page: z.number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE)
    .describe(`Number of results per page (max ${MAX_PAGE_SIZE})`),
  order_by: z.enum(["latest", "oldest", "popular"])
    .default("latest")
    .describe("Sort order for photos"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: markdown (default) or json")
}).strict();

export const SearchCollectionsSchema = z.object({
  query: z.string()
    .min(1, "Query must not be empty")
    .max(200, "Query must not exceed 200 characters")
    .describe("Search terms to find collections"),
  page: z.number()
    .int()
    .min(1)
    .default(1)
    .describe("Page number for pagination"),
  per_page: z.number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE)
    .describe(`Number of results per page (max ${MAX_PAGE_SIZE})`),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: markdown (default) or json")
}).strict();

export const GetCollectionPhotosSchema = z.object({
  id: z.string()
    .min(1, "Collection ID is required")
    .describe("Unsplash collection ID"),
  page: z.number()
    .int()
    .min(1)
    .default(1)
    .describe("Page number for pagination"),
  per_page: z.number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE)
    .describe(`Number of results per page (max ${MAX_PAGE_SIZE})`),
  orientation: z.nativeEnum(PhotoOrientation)
    .optional()
    .describe("Filter by photo orientation"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: markdown (default) or json")
}).strict();

export const SearchUsersSchema = z.object({
  query: z.string()
    .min(1, "Query must not be empty")
    .max(200, "Query must not exceed 200 characters")
    .describe("Search terms to find users"),
  page: z.number()
    .int()
    .min(1)
    .default(1)
    .describe("Page number for pagination"),
  per_page: z.number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE)
    .describe(`Number of results per page (max ${MAX_PAGE_SIZE})`),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: markdown (default) or json")
}).strict();

export const GetUserPhotosSchema = z.object({
  username: z.string()
    .min(1, "Username is required")
    .describe("Unsplash username"),
  page: z.number()
    .int()
    .min(1)
    .default(1)
    .describe("Page number for pagination"),
  per_page: z.number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE)
    .describe(`Number of results per page (max ${MAX_PAGE_SIZE})`),
  order_by: z.enum(["latest", "oldest", "popular"])
    .default("latest")
    .describe("Sort order for photos"),
  orientation: z.nativeEnum(PhotoOrientation)
    .optional()
    .describe("Filter by photo orientation"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: markdown (default) or json")
}).strict();

export const GetPhotoStatisticsSchema = z.object({
  id: z.string()
    .min(1, "Photo ID is required")
    .describe("Unsplash photo ID"),
  response_format: z.nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: markdown (default) or json")
}).strict();

export const DownloadPhotoSchema = z.object({
  id: z.string()
    .min(1, "Photo ID is required")
    .describe("Unsplash photo ID to download")
}).strict();
