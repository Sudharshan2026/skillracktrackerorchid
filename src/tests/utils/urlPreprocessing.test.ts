/**
 * URL preprocessing utilities tests
 */

import { preprocessUrl, validateSkillRackUrl, getPreprocessingFeedback } from '../../src/utils/urlPreprocessing';

describe('URL Preprocessing', () => {
  describe('preprocessUrl', () => {
    it('should add www subdomain when missing', () => {
      const result = preprocessUrl('https://skillrack.com/profile/123456/abcdef');
      expect(result.cleanedUrl).toBe('https://www.skillrack.com/profile/123456/abcdef');
      expect(result.wasModified).toBe(true);
      expect(result.modifications).toContain('Added www subdomain');
    });

    it('should preserve www subdomain when present', () => {
      const url = 'https://www.skillrack.com/profile/440943/bf966a469d73bfb792f4d2a72a4762937ba3fc48';
      const result = preprocessUrl(url);
      expect(result.cleanedUrl).toBe(url);
      expect(result.wasModified).toBe(false);
    });

    it('should add protocol and www subdomain when both missing', () => {
      const result = preprocessUrl('skillrack.com/profile/123456/abcdef');
      expect(result.cleanedUrl).toBe('https://www.skillrack.com/profile/123456/abcdef');
      expect(result.wasModified).toBe(true);
      expect(result.modifications).toContain('Added https:// protocol');
      expect(result.modifications).toContain('Added www subdomain');
    });

    it('should handle http protocol correctly', () => {
      const url = 'http://www.skillrack.com/profile/440943/bf966a469d73bfb792f4d2a72a4762937ba3fc48';
      const result = preprocessUrl(url);
      expect(result.cleanedUrl).toBe(url);
      expect(result.wasModified).toBe(false);
    });

    it('should remove whitespace', () => {
      const result = preprocessUrl('  https://www.skillrack.com/profile/123456/abcdef  ');
      expect(result.cleanedUrl).toBe('https://www.skillrack.com/profile/123456/abcdef');
      expect(result.wasModified).toBe(true);
      expect(result.modifications).toContain('Removed extra whitespace');
    });

    it('should remove internal spaces', () => {
      const result = preprocessUrl('https://www.skillrack.com/profile/123 456/abcdef');
      expect(result.cleanedUrl).toBe('https://www.skillrack.com/profile/123456/abcdef');
      expect(result.wasModified).toBe(true);
      expect(result.modifications).toContain('Removed spaces within URL');
    });
  });

  describe('validateSkillRackUrl', () => {
    it('should validate correct SkillRack URLs with www', () => {
      const validUrls = [
        'https://www.skillrack.com/profile/440943/bf966a469d73bfb792f4d2a72a4762937ba3fc48',
        'http://www.skillrack.com/profile/123456/abcdef',
        'https://www.skillrack.com/profile/999999/xyz123'
      ];

      validUrls.forEach(url => {
        expect(validateSkillRackUrl(url)).toBe(true);
      });
    });

    it('should reject URLs without www subdomain', () => {
      const invalidUrls = [
        'https://skillrack.com/profile/123456/abcdef',
        'http://skillrack.com/profile/123456/abcdef'
      ];

      invalidUrls.forEach(url => {
        expect(validateSkillRackUrl(url)).toBe(false);
      });
    });

    it('should reject invalid SkillRack URLs', () => {
      const invalidUrls = [
        'https://www.google.com',
        'https://www.skillrack.com',
        'https://www.skillrack.com/profile',
        'https://www.skillrack.com/profile/abc/def',
        'not-a-url'
      ];

      invalidUrls.forEach(url => {
        expect(validateSkillRackUrl(url)).toBe(false);
      });
    });
  });

  describe('getPreprocessingFeedback', () => {
    it('should return null when no modifications were made', () => {
      const result = {
        cleanedUrl: 'https://www.skillrack.com/profile/123456/abcdef',
        wasModified: false,
        modifications: []
      };
      expect(getPreprocessingFeedback(result)).toBeNull();
    });

    it('should return feedback when modifications were made', () => {
      const result = {
        cleanedUrl: 'https://www.skillrack.com/profile/123456/abcdef',
        wasModified: true,
        modifications: ['Added www subdomain', 'Added https:// protocol']
      };
      const feedback = getPreprocessingFeedback(result);
      expect(feedback).toContain('Added www subdomain');
      expect(feedback).toContain('Added https:// protocol');
    });
  });
});