export type StreamAuthorizationStatus =
  | "verified_playable"
  | "unverified"
  | "official_link_only"
  | "restricted"
  | "unavailable";

export type StreamVerificationStatus = "healthy" | "degraded" | "unavailable" | "unknown";

export type StreamType = "hls" | "mp3" | "aac" | "unknown";

export interface StreamEndpointItem {
  id: string;
  streamUrl: string;
  streamType: StreamType;
  codec?: string | null;
  bitrate?: number | null;
  authorizationStatus: StreamAuthorizationStatus;
  verificationStatus: StreamVerificationStatus;
  priority: number;
}

export interface StationItem {
  id: string;
  externalSource: "curated" | "radio-browser" | "admin";
  externalId?: string | null;
  name: string;
  slug: string;
  language: string;
  countryCode: string;
  state?: string | null;
  logoUrl?: string | null;
  homepageUrl?: string | null;
  description?: string | null;
  status: "active" | "disabled" | "restricted";
  isFeatured: boolean;
  categories: string[]; // slugs
  endpoints: StreamEndpointItem[];
}

export interface CategoryItem {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  icon?: string | null;
  descriptionEn?: string | null;
  descriptionHi?: string | null;
}

export type PlayerState =
  | "idle"
  | "connecting"
  | "buffering"
  | "playing"
  | "paused"
  | "reconnecting"
  | "ended"
  | "error";

export interface StationFilterParams {
  query?: string;
  language?: string;
  state?: string;
  category?: string;
  sortBy?: "popular" | "name" | "recent";
  page?: number;
  limit?: number;
}
