// Response formatting utilities

import {
  UnsplashPhoto,
  UnsplashCollection,
  UnsplashUser,
  PhotoStatistics
} from "../types.js";
import { CHARACTER_LIMIT } from "../constants.js";

export function formatPhotoMarkdown(photo: UnsplashPhoto): string {
  const parts: string[] = [];

  parts.push(`### ${photo.alt_description || photo.description || "Photo"}`);
  parts.push(`**ID**: ${photo.id}`);
  parts.push(`**Photographer**: ${photo.user.name} (@${photo.user.username})`);
  parts.push(`**Dimensions**: ${photo.width} × ${photo.height}px`);
  parts.push(`**Color**: ${photo.color}`);
  parts.push(`**Likes**: ${photo.likes}`);

  if (photo.description) {
    parts.push(`**Description**: ${photo.description}`);
  }

  if (photo.location?.name) {
    parts.push(`**Location**: ${photo.location.name}`);
  }

  parts.push(`**Created**: ${new Date(photo.created_at).toLocaleDateString()}`);
  parts.push(`**Unsplash URL**: ${photo.links.html}`);
  parts.push(`**Download URL**: ${photo.urls.regular}`);

  if (photo.tags && photo.tags.length > 0) {
    parts.push(`**Tags**: ${photo.tags.map(t => t.title).join(", ")}`);
  }

  return parts.join("\n");
}

export function formatCollectionMarkdown(collection: UnsplashCollection): string {
  const parts: string[] = [];

  parts.push(`### ${collection.title}`);
  parts.push(`**ID**: ${collection.id}`);
  parts.push(`**Curator**: ${collection.user.name} (@${collection.user.username})`);
  parts.push(`**Total Photos**: ${collection.total_photos}`);

  if (collection.description) {
    parts.push(`**Description**: ${collection.description}`);
  }

  parts.push(`**Published**: ${new Date(collection.published_at).toLocaleDateString()}`);
  parts.push(`**Unsplash URL**: ${collection.links.html}`);

  return parts.join("\n");
}

export function formatUserMarkdown(user: UnsplashUser): string {
  const parts: string[] = [];

  parts.push(`### ${user.name} (@${user.username})`);
  parts.push(`**ID**: ${user.id}`);
  parts.push(`**Total Photos**: ${user.total_photos}`);
  parts.push(`**Total Likes**: ${user.total_likes}`);
  parts.push(`**Total Collections**: ${user.total_collections}`);

  if (user.bio) {
    parts.push(`**Bio**: ${user.bio}`);
  }

  if (user.location) {
    parts.push(`**Location**: ${user.location}`);
  }

  if (user.instagram_username) {
    parts.push(`**Instagram**: @${user.instagram_username}`);
  }

  if (user.portfolio_url) {
    parts.push(`**Portfolio**: ${user.portfolio_url}`);
  }

  parts.push(`**Unsplash Profile**: ${user.links.html}`);

  return parts.join("\n");
}

export function formatStatisticsMarkdown(stats: PhotoStatistics): string {
  const parts: string[] = [];

  parts.push(`### Photo Statistics (ID: ${stats.id})`);
  parts.push(`**Total Downloads**: ${stats.downloads.total.toLocaleString()}`);
  parts.push(`**Total Views**: ${stats.views.total.toLocaleString()}`);
  parts.push(`**Total Likes**: ${stats.likes.total.toLocaleString()}`);

  parts.push("\n**Recent Trends**:");
  parts.push(`- Downloads change: ${stats.downloads.historical.change > 0 ? "+" : ""}${stats.downloads.historical.change}`);
  parts.push(`- Views change: ${stats.views.historical.change > 0 ? "+" : ""}${stats.views.historical.change}`);
  parts.push(`- Likes change: ${stats.likes.historical.change > 0 ? "+" : ""}${stats.likes.historical.change}`);

  return parts.join("\n");
}

export function truncateIfNeeded(content: string, limit: number = CHARACTER_LIMIT): string {
  if (content.length <= limit) {
    return content;
  }

  const truncated = content.substring(0, limit - 100);
  return `${truncated}\n\n...[Content truncated due to length. Total: ${content.length} characters]`;
}

export function formatPhotosListMarkdown(photos: UnsplashPhoto[]): string {
  const formatted = photos.map((photo, index) => {
    return `${index + 1}. **${photo.alt_description || "Photo"}** (ID: ${photo.id})
   - By ${photo.user.name} (@${photo.user.username})
   - ${photo.width} × ${photo.height}px | ${photo.likes} likes
   - ${photo.links.html}`;
  });

  return formatted.join("\n\n");
}

export function formatCollectionsListMarkdown(collections: UnsplashCollection[]): string {
  const formatted = collections.map((collection, index) => {
    return `${index + 1}. **${collection.title}** (ID: ${collection.id})
   - By ${collection.user.name} (@${collection.user.username})
   - ${collection.total_photos} photos
   - ${collection.links.html}`;
  });

  return formatted.join("\n\n");
}

export function formatUsersListMarkdown(users: UnsplashUser[]): string {
  const formatted = users.map((user, index) => {
    return `${index + 1}. **${user.name}** (@${user.username})
   - ${user.total_photos} photos | ${user.total_likes} likes
   - ${user.links.html}`;
  });

  return formatted.join("\n\n");
}
