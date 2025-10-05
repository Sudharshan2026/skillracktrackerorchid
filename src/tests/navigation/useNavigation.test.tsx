/**
 * Navigation hook integration test
 * Tests the useNavigation hook functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useNavigation } from '../../src/hooks/useNavigation';

// Mock the navigation utilities
jest.mock('../../src/utils/navigation', () => ({
  parseUrlState: jest.fn(() => ({ page: 'home', profileUrl: undefined })),
  navigateToHome: jest.fn(),
  navigateToResults: jest.fn(),
  initializeUrlState: jest.fn(() => ({ page: 'home', profileUrl: undefined })),
}));

describe('useNavigation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with home page state', () => {
    const { result } = renderHook(() => useNavigation());
    
    expect(result.current.currentPage).toBe('home');
    expect(result.current.analyzedUrl).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should provide navigation functions', () => {
    const { result } = renderHook(() => useNavigation());
    
    expect(typeof result.current.navigateToResults).toBe('function');
    expect(typeof result.current.navigateToHome).toBe('function');
    expect(typeof result.current.handlePopState).toBe('function');
  });

  it('should provide utility functions', () => {
    const { result } = renderHook(() => useNavigation());
    
    expect(typeof result.current.setLoading).toBe('function');
    expect(typeof result.current.setError).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should update loading state', () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.loading).toBe(true);
    
    act(() => {
      result.current.setLoading(false);
    });
    
    expect(result.current.loading).toBe(false);
  });

  it('should update error state', () => {
    const { result } = renderHook(() => useNavigation());
    const errorMessage = 'Test error';
    
    act(() => {
      result.current.setError(errorMessage);
    });
    
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
  });

  it('should clear error state', () => {
    const { result } = renderHook(() => useNavigation());
    
    // Set an error first
    act(() => {
      result.current.setError('Test error');
    });
    
    expect(result.current.error).toBe('Test error');
    
    // Clear the error
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  it('should navigate to results page', () => {
    const { result } = renderHook(() => useNavigation());
    const mockProfileData = {
      codeTutor: 10,
      codeTrack: 20,
      codeTest: 5,
      dailyTest: 15,
      dailyChallenge: 8,
      totalPoints: 1000,
    };
    const testUrl = 'https://skillrack.com/profile/123/abc';
    
    act(() => {
      result.current.navigateToResults(testUrl, mockProfileData);
    });
    
    expect(result.current.currentPage).toBe('results');
    expect(result.current.analyzedUrl).toBe(testUrl);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should navigate to home page', () => {
    const { result } = renderHook(() => useNavigation());
    
    // First navigate to results
    act(() => {
      result.current.navigateToResults('test-url', {} as any);
    });
    
    expect(result.current.currentPage).toBe('results');
    
    // Then navigate back to home
    act(() => {
      result.current.navigateToHome();
    });
    
    expect(result.current.currentPage).toBe('home');
    expect(result.current.analyzedUrl).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});