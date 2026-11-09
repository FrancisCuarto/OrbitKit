import { ResourceManifest, ResourceType } from './resource';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: ApiErrorDetail[];
  };
  timestamp: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginatedMeta;
}

export interface ResourceSummary {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  author: string;
  license: string;
  latest_version: string;
  tags: string[];
  downloads_count: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceDetail extends ResourceSummary {
  manifest: ResourceManifest;
  versions: string[];
  readme?: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  resource_count: number;
  icon?: string;
}
