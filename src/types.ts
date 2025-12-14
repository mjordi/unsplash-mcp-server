// Type definitions for Unsplash API responses

export interface UnsplashUser {
  [key: string]: unknown;
  id: string;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  bio?: string;
  location?: string;
  total_likes: number;
  total_photos: number;
  total_collections: number;
  instagram_username?: string;
  twitter_username?: string;
  portfolio_url?: string;
  profile_image: {
    small: string;
    medium: string;
    large: string;
  };
  links: {
    self: string;
    html: string;
    photos: string;
    likes: string;
    portfolio: string;
  };
}

export interface UnsplashPhotoUrls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
}

export interface UnsplashPhotoLinks {
  self: string;
  html: string;
  download: string;
  download_location: string;
}

export interface UnsplashPhoto {
  [key: string]: unknown;
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description?: string;
  alt_description?: string;
  likes: number;
  liked_by_user: boolean;
  urls: UnsplashPhotoUrls;
  links: UnsplashPhotoLinks;
  user: UnsplashUser;
  exif?: {
    make?: string;
    model?: string;
    exposure_time?: string;
    aperture?: string;
    focal_length?: string;
    iso?: number;
  };
  location?: {
    name?: string;
    city?: string;
    country?: string;
    position?: {
      latitude: number;
      longitude: number;
    };
  };
  tags?: Array<{
    title: string;
  }>;
}

export interface SearchPhotosResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

export interface UnsplashCollection {
  [key: string]: unknown;
  id: string;
  title: string;
  description?: string;
  published_at: string;
  updated_at: string;
  total_photos: number;
  private: boolean;
  share_key: string;
  cover_photo: UnsplashPhoto;
  user: UnsplashUser;
  links: {
    self: string;
    html: string;
    photos: string;
  };
}

export interface SearchCollectionsResponse {
  total: number;
  total_pages: number;
  results: UnsplashCollection[];
}

export interface SearchUsersResponse {
  total: number;
  total_pages: number;
  results: UnsplashUser[];
}

export interface PhotoStatistics {
  [key: string]: unknown;
  id: string;
  downloads: {
    total: number;
    historical: {
      change: number;
      values: Array<{ date: string; value: number }>;
    };
  };
  views: {
    total: number;
    historical: {
      change: number;
      values: Array<{ date: string; value: number }>;
    };
  };
  likes: {
    total: number;
    historical: {
      change: number;
      values: Array<{ date: string; value: number }>;
    };
  };
}

export enum ResponseFormat {
  JSON = "json",
  MARKDOWN = "markdown"
}

export enum PhotoOrientation {
  LANDSCAPE = "landscape",
  PORTRAIT = "portrait",
  SQUARISH = "squarish"
}

export enum PhotoOrderBy {
  RELEVANT = "relevant",
  LATEST = "latest"
}

export enum ContentFilter {
  LOW = "low",
  HIGH = "high"
}
