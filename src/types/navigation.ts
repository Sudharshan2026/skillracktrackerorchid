import type { SkillRackProfile, GoalCalculation, ApiResponse } from './index';

/**
 * Navigation state interface for routing between pages
 * Implements requirements 8.1, 8.2, 8.5, 8.6 for multi-page navigation
 */
export interface NavigationState {
  /** Current page being displayed */
  currentPage: 'home' | 'results';
  
  /** The profile URL that was analyzed (for display on results page) */
  analyzedUrl?: string;
  
  /** Loading state during API requests */
  loading: boolean;
  
  /** Error state for display */
  error?: string | ApiResponse | null;
}

/**
 * Complete application state interface extending navigation state
 * Manages all application data and navigation state
 */
export interface AppState extends NavigationState {
  /** Parsed profile data */
  profileData: SkillRackProfile | null;
  
  /** Goal calculation results */
  goalResults: GoalCalculation | null;
}

/**
 * Navigation functions interface for page transitions
 */
export interface NavigationActions {
  /** Navigate to results page with profile data */
  navigateToResults: (url: string, data: SkillRackProfile) => void;
  
  /** Navigate back to home page */
  navigateToHome: () => void;
  
  /** Handle browser back/forward navigation */
  handlePopState: (event: PopStateEvent) => void;
}

/**
 * URL state parameters for bookmarking and deep linking
 */
export interface UrlState {
  /** Current page identifier */
  page: 'home' | 'results';
  
  /** Profile URL for results page */
  profileUrl?: string;
}