import type { UrlState } from '../types';

/**
 * Navigation utilities for URL state management and browser history
 * Implements requirements 8.5, 8.6 for clean URLs and bookmarking support
 */

/**
 * Parse URL search parameters to extract navigation state
 */
export function parseUrlState(): UrlState {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page') as 'home' | 'results' | null;
  const profileUrl = params.get('profileUrl');

  return {
    page: page === 'results' ? 'results' : 'home',
    profileUrl: profileUrl || undefined,
  };
}

/**
 * Update URL with current navigation state
 */
export function updateUrl(state: UrlState): void {
  const params = new URLSearchParams();
  
  if (state.page === 'results') {
    params.set('page', 'results');
    if (state.profileUrl) {
      params.set('profileUrl', state.profileUrl);
    }
  }
  
  const newUrl = params.toString() 
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;
    
  // Use replaceState for initial navigation, pushState for user actions
  window.history.pushState(state, '', newUrl);
}

/**
 * Replace current URL state without adding to history
 */
export function replaceUrl(state: UrlState): void {
  const params = new URLSearchParams();
  
  if (state.page === 'results') {
    params.set('page', 'results');
    if (state.profileUrl) {
      params.set('profileUrl', state.profileUrl);
    }
  }
  
  const newUrl = params.toString() 
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;
    
  window.history.replaceState(state, '', newUrl);
}

/**
 * Navigate to home page and update URL
 */
export function navigateToHome(): void {
  const state: UrlState = { page: 'home' };
  updateUrl(state);
}

/**
 * Navigate to results page with profile URL and update URL
 */
export function navigateToResults(profileUrl: string): void {
  const state: UrlState = { 
    page: 'results', 
    profileUrl: encodeURIComponent(profileUrl) 
  };
  updateUrl(state);
}

/**
 * Get the current page from URL state
 */
export function getCurrentPage(): 'home' | 'results' {
  return parseUrlState().page;
}

/**
 * Get the profile URL from URL state (decoded)
 */
export function getProfileUrlFromState(): string | undefined {
  const state = parseUrlState();
  return state.profileUrl ? decodeURIComponent(state.profileUrl) : undefined;
}

/**
 * Check if the current URL represents a valid results page state
 */
export function isValidResultsState(): boolean {
  const state = parseUrlState();
  return state.page === 'results' && !!state.profileUrl;
}

/**
 * Initialize URL state on app load
 */
export function initializeUrlState(): UrlState {
  const state = parseUrlState();
  
  // If no valid state in URL, default to home
  if (!state.page || (state.page === 'results' && !state.profileUrl)) {
    const defaultState: UrlState = { page: 'home' };
    replaceUrl(defaultState);
    return defaultState;
  }
  
  return state;
}