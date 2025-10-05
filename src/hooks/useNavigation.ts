import { useState, useEffect, useCallback } from 'react';
import type { NavigationState, NavigationActions, SkillRackProfile } from '../types';
import { 
  parseUrlState, 
  navigateToHome as navToHome, 
  navigateToResults as navToResults,
  initializeUrlState 
} from '../utils/navigation';

/**
 * Custom hook for managing navigation state and browser history
 * Implements requirements 8.1, 8.2, 8.5, 8.6 for routing and URL management
 */
export function useNavigation(): NavigationHook {
  // Initialize navigation state from URL
  const [navigationState, setNavigationState] = useState<NavigationState>(() => {
    const urlState = initializeUrlState();
    return {
      currentPage: urlState.page,
      analyzedUrl: urlState.profileUrl,
      loading: false,
      error: null,
    };
  });

  /**
   * Handle browser back/forward navigation
   * Requirement 8.5: Handle browser back/forward navigation
   */
  const handlePopState = useCallback((_event: PopStateEvent) => {
    const urlState = parseUrlState();
    
    setNavigationState(prev => ({
      ...prev,
      currentPage: urlState.page,
      analyzedUrl: urlState.profileUrl,
    }));
  }, []);

  /**
   * Navigate to results page with profile data
   * Requirements 8.2: Navigate to dedicated results page
   */
  const navigateToResults = useCallback((url: string, _data: SkillRackProfile) => {
    // Update URL first
    navToResults(url);
    
    // Update navigation state
    setNavigationState(prev => ({
      ...prev,
      currentPage: 'results',
      analyzedUrl: url,
      loading: false,
      error: null,
    }));
  }, []);

  /**
   * Navigate back to home page
   * Requirements 8.1: Display home page with URL input
   */
  const navigateToHome = useCallback(() => {
    // Update URL first
    navToHome();
    
    // Update navigation state
    setNavigationState(prev => ({
      ...prev,
      currentPage: 'home',
      analyzedUrl: undefined,
      loading: false,
      error: null,
    }));
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    setNavigationState(prev => ({
      ...prev,
      loading,
    }));
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((error: NavigationState['error']) => {
    setNavigationState(prev => ({
      ...prev,
      error,
      loading: false,
    }));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Set up browser history event listener
  useEffect(() => {
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handlePopState]);

  return {
    // Navigation state
    currentPage: navigationState.currentPage,
    analyzedUrl: navigationState.analyzedUrl,
    loading: navigationState.loading,
    error: navigationState.error,
    
    // Navigation actions
    navigateToResults,
    navigateToHome,
    handlePopState,
    
    // Additional utility methods
    setLoading,
    setError,
    clearError,
  };
}

// Export additional utility type for the hook return
export interface NavigationHook extends NavigationState, NavigationActions {
  setLoading: (loading: boolean) => void;
  setError: (error: NavigationState['error']) => void;
  clearError: () => void;
}