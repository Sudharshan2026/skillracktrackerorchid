import type { SkillRackProfile } from './profile';

/**
 * Success response from the profile parsing API
 */
export interface ApiSuccessResponse {
  success: true;
  data: SkillRackProfile;
}

/**
 * Error response from the profile parsing API
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: 'INVALID_URL' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'NOT_FOUND';
}

/**
 * Union type for all possible API responses
 */
export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

/**
 * Request payload for profile parsing API
 */
export interface ParseProfileRequest {
  /** SkillRack profile URL to parse */
  url: string;
}