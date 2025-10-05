/**
 * Navigation system tests
 * Tests the navigation utilities and URL state management
 */

import { 
  parseUrlState, 
  updateUrl, 
  replaceUrl, 
  navigateToHome, 
  navigateToResults,
  getCurrentPage,
  getProfileUrlFromState,
  isValidResultsState,
  initializeUrlState
} from '../../src/utils/navigation';

// Mock window.location and window.history
const mockLocation = {
  pathname: '/',
  search: '',
  href: 'http://localhost:3000/',
};

const mockHistory = {
  pushState: jest.fn(),
  replaceState: jest.fn(),
};

// Mock window object
delete (window as any).location;
delete (window as any).history;

(window as any).location = mockLocation;
(window as any).history = mockHistory;

describe('Navigation Utils', () => {
  beforeEach(() => {
    // Reset mocks
    mockLocation.search = '';
    mockHistory.pushState.mockClear();
    mockHistory.replaceState.mockClear();
  });

  describe('parseUrlState', () => {
    it('should parse home page state from empty URL', () => {
      mockLocation.search = '';
      const state = parseUrlState();
      expect(state).toEqual({
        page: 'home',
        profileUrl: undefined,
      });
    });

    it('should parse results page state from URL with parameters', () => {
      mockLocation.search = '?page=results&profileUrl=https%3A//skillrack.com/profile/123/abc';
      const state = parseUrlState();
      expect(state).toEqual({
        page: 'results',
        profileUrl: 'https://skillrack.com/profile/123/abc',
      });
    });

    it('should default to home page for invalid page parameter', () => {
      mockLocation.search = '?page=invalid';
      const state = parseUrlState();
      expect(state).toEqual({
        page: 'home',
        profileUrl: undefined,
      });
    });
  });

  describe('updateUrl', () => {
    it('should update URL for home page', () => {
      updateUrl({ page: 'home' });
      expect(mockHistory.pushState).toHaveBeenCalledWith(
        { page: 'home' },
        '',
        '/'
      );
    });

    it('should update URL for results page with profile URL', () => {
      const profileUrl = 'https://skillrack.com/profile/123/abc';
      updateUrl({ page: 'results', profileUrl });
      expect(mockHistory.pushState).toHaveBeenCalledWith(
        { page: 'results', profileUrl },
        '',
        '/?page=results&profileUrl=https%3A%2F%2Fskillrack.com%2Fprofile%2F123%2Fabc'
      );
    });
  });

  describe('replaceUrl', () => {
    it('should replace URL state without adding to history', () => {
      replaceUrl({ page: 'home' });
      expect(mockHistory.replaceState).toHaveBeenCalledWith(
        { page: 'home' },
        '',
        '/'
      );
    });
  });

  describe('navigateToHome', () => {
    it('should navigate to home page', () => {
      navigateToHome();
      expect(mockHistory.pushState).toHaveBeenCalledWith(
        { page: 'home' },
        '',
        '/'
      );
    });
  });

  describe('navigateToResults', () => {
    it('should navigate to results page with encoded profile URL', () => {
      const profileUrl = 'https://skillrack.com/profile/123/abc';
      navigateToResults(profileUrl);
      expect(mockHistory.pushState).toHaveBeenCalledWith(
        { page: 'results', profileUrl: encodeURIComponent(profileUrl) },
        '',
        '/?page=results&profileUrl=https%253A%252F%252Fskillrack.com%252Fprofile%252F123%252Fabc'
      );
    });
  });

  describe('getCurrentPage', () => {
    it('should return current page from URL state', () => {
      mockLocation.search = '?page=results';
      expect(getCurrentPage()).toBe('results');
      
      mockLocation.search = '';
      expect(getCurrentPage()).toBe('home');
    });
  });

  describe('getProfileUrlFromState', () => {
    it('should return decoded profile URL from state', () => {
      mockLocation.search = '?profileUrl=https%3A//skillrack.com/profile/123/abc';
      expect(getProfileUrlFromState()).toBe('https://skillrack.com/profile/123/abc');
    });

    it('should return undefined when no profile URL in state', () => {
      mockLocation.search = '';
      expect(getProfileUrlFromState()).toBeUndefined();
    });
  });

  describe('isValidResultsState', () => {
    it('should return true for valid results state', () => {
      mockLocation.search = '?page=results&profileUrl=https%3A//skillrack.com/profile/123/abc';
      expect(isValidResultsState()).toBe(true);
    });

    it('should return false for results page without profile URL', () => {
      mockLocation.search = '?page=results';
      expect(isValidResultsState()).toBe(false);
    });

    it('should return false for home page', () => {
      mockLocation.search = '';
      expect(isValidResultsState()).toBe(false);
    });
  });

  describe('initializeUrlState', () => {
    it('should return parsed state for valid URL', () => {
      mockLocation.search = '?page=results&profileUrl=test';
      const state = initializeUrlState();
      expect(state).toEqual({
        page: 'results',
        profileUrl: 'test',
      });
    });

    it('should default to home and replace URL for invalid state', () => {
      mockLocation.search = '?page=results'; // Missing profileUrl
      const state = initializeUrlState();
      expect(state).toEqual({
        page: 'home',
      });
      expect(mockHistory.replaceState).toHaveBeenCalledWith(
        { page: 'home' },
        '',
        '/'
      );
    });
  });
});