import { 
  validateSkillRackUrl, 
  parseProfileStats, 
  calculateTotalPoints,
  ProfileStats 
} from '../api/parsing-utils';
import {
  validProfileHtml,
  profileWithZeroValues,
  profileWithMissingData,
  profileWithNonNumericValues,
  malformedHtml,
  emptyHtml,
  profileWithExtraWhitespace,
  correctedExpectedValidProfileStats
} from './sample-data';

describe('URL Validation', () => {
  describe('validateSkillRackUrl', () => {
    test('should accept valid SkillRack profile URLs', () => {
      const validUrls = [
        'https://skillrack.com/profile/123456/abcdef123',
        'http://skillrack.com/profile/789/xyz789',
        'https://www.skillrack.com/profile/999/test123',
        'https://skillrack.com/profile/1/a',
        'https://skillrack.com/profile/123456789/abcdefghijklmnop123456789'
      ];

      validUrls.forEach(url => {
        expect(validateSkillRackUrl(url)).toBe(true);
      });
    });

    test('should reject invalid SkillRack profile URLs', () => {
      const invalidUrls = [
        'https://google.com/profile/123/abc',
        'https://skillrack.com/dashboard',
        'https://skillrack.com/profile/123',
        'https://skillrack.com/profile/abc/123',
        'https://skillrack.com/profile//123',
        'https://skillrack.com/profile/123/',
        'not-a-url',
        '',
        'https://skillrack.com/profile/123/abc/extra',
        'ftp://skillrack.com/profile/123/abc'
      ];

      invalidUrls.forEach(url => {
        expect(validateSkillRackUrl(url)).toBe(false);
      });
    });

    test('should handle malformed URLs gracefully', () => {
      const malformedUrls = [
        'http://',
        'https://',
        'skillrack.com/profile/123/abc',
        'https://skillrack',
        null as any,
        undefined as any,
        123 as any,
        {} as any
      ];

      malformedUrls.forEach(url => {
        expect(validateSkillRackUrl(url)).toBe(false);
      });
    });
  });
});

describe('HTML Parsing', () => {
  describe('parseProfileStats', () => {
    test('should parse valid profile HTML correctly', () => {
      const result = parseProfileStats(validProfileHtml);
      
      expect(result).toEqual(correctedExpectedValidProfileStats);
    });

    test('should handle profile with zero values', () => {
      const result = parseProfileStats(profileWithZeroValues);
      
      expect(result).toEqual({
        codeTutor: 0,
        codeTrack: 0,
        codeTest: 0,
        dailyTest: 0,
        dailyChallenge: 0,
        totalPoints: 0
      });
    });

    test('should handle missing data gracefully', () => {
      const result = parseProfileStats(profileWithMissingData);
      
      expect(result).toEqual({
        codeTutor: 0,
        codeTrack: 100,
        codeTest: 5,
        dailyTest: 0,
        dailyChallenge: 0,
        totalPoints: 350 // (100*2) + (5*30) = 200 + 150 = 350
      });
    });

    test('should handle non-numeric values by extracting digits', () => {
      const result = parseProfileStats(profileWithNonNumericValues);
      
      expect(result).toEqual({
        codeTutor: 50, // "50+" -> 50
        codeTrack: 0,  // "--" -> 0
        codeTest: 0,   // "N/A" -> 0
        dailyTest: 10, // "10 problems" -> 10
        dailyChallenge: 0, // "invalid" -> 0
        totalPoints: 200 // (0*2) + (10*20) + (0*2) + (0*30) = 0 + 200 + 0 + 0 = 200
      });
    });

    test('should handle malformed HTML gracefully', () => {
      const result = parseProfileStats(malformedHtml);
      
      // Should still extract what it can
      expect(result.codeTest).toBe(15);
      expect(result.codeTrack).toBe(0); // Missing value
      expect(result.totalPoints).toBe(450); // 15 * 30 = 450
    });

    test('should handle empty HTML', () => {
      const result = parseProfileStats(emptyHtml);
      
      expect(result).toEqual({
        codeTutor: 0,
        codeTrack: 0,
        codeTest: 0,
        dailyTest: 0,
        dailyChallenge: 0,
        totalPoints: 0
      });
    });

    test('should handle HTML with extra whitespace', () => {
      const result = parseProfileStats(profileWithExtraWhitespace);
      
      expect(result).toEqual(correctedExpectedValidProfileStats);
    });

    test('should handle completely invalid HTML', () => {
      const invalidHtml = 'This is not HTML at all!';
      const result = parseProfileStats(invalidHtml);
      
      expect(result).toEqual({
        codeTutor: 0,
        codeTrack: 0,
        codeTest: 0,
        dailyTest: 0,
        dailyChallenge: 0,
        totalPoints: 0
      });
    });

    test('should handle empty string input', () => {
      const result = parseProfileStats('');
      
      expect(result).toEqual({
        codeTutor: 0,
        codeTrack: 0,
        codeTest: 0,
        dailyTest: 0,
        dailyChallenge: 0,
        totalPoints: 0
      });
    });
  });
});

describe('Point Calculation', () => {
  describe('calculateTotalPoints', () => {
    test('should calculate points correctly according to SkillRack scoring system', () => {
      const stats = {
        codeTutor: 100,    // 0 points each = 0
        codeTrack: 470,    // 2 points each = 940
        codeTest: 15,      // 30 points each = 450
        dailyTest: 30,     // 20 points each = 600
        dailyChallenge: 25 // 2 points each = 50
      };
      
      const totalPoints = calculateTotalPoints(stats);
      expect(totalPoints).toBe(2040); // 0 + 940 + 450 + 600 + 50 = 2040
    });

    test('should handle zero values correctly', () => {
      const stats = {
        codeTutor: 0,
        codeTrack: 0,
        codeTest: 0,
        dailyTest: 0,
        dailyChallenge: 0
      };
      
      const totalPoints = calculateTotalPoints(stats);
      expect(totalPoints).toBe(0);
    });

    test('should calculate points for individual categories', () => {
      // Test Code Track only
      expect(calculateTotalPoints({
        codeTutor: 0, codeTrack: 100, codeTest: 0, dailyTest: 0, dailyChallenge: 0
      })).toBe(200); // 100 * 2 = 200

      // Test Daily Test only
      expect(calculateTotalPoints({
        codeTutor: 0, codeTrack: 0, codeTest: 0, dailyTest: 10, dailyChallenge: 0
      })).toBe(200); // 10 * 20 = 200

      // Test Daily Challenge only
      expect(calculateTotalPoints({
        codeTutor: 0, codeTrack: 0, codeTest: 0, dailyTest: 0, dailyChallenge: 50
      })).toBe(100); // 50 * 2 = 100

      // Test Code Test only
      expect(calculateTotalPoints({
        codeTutor: 0, codeTrack: 0, codeTest: 5, dailyTest: 0, dailyChallenge: 0
      })).toBe(150); // 5 * 30 = 150

      // Test Code Tutor only (should be 0 points)
      expect(calculateTotalPoints({
        codeTutor: 1000, codeTrack: 0, codeTest: 0, dailyTest: 0, dailyChallenge: 0
      })).toBe(0); // 1000 * 0 = 0
    });

    test('should handle large numbers correctly', () => {
      const stats = {
        codeTutor: 9999,
        codeTrack: 9999,
        codeTest: 999,
        dailyTest: 999,
        dailyChallenge: 9999
      };
      
      const totalPoints = calculateTotalPoints(stats);
      // (9999*0) + (9999*2) + (999*30) + (999*20) + (9999*2)
      // = 0 + 19998 + 29970 + 19980 + 19998 = 89946
      expect(totalPoints).toBe(89946);
    });

    test('should verify scoring system requirements', () => {
      // Requirement 6.1: Code Track = 2 points per problem
      expect(calculateTotalPoints({
        codeTutor: 0, codeTrack: 1, codeTest: 0, dailyTest: 0, dailyChallenge: 0
      })).toBe(2);

      // Requirement 6.2: Code Tutor = 0 points per problem
      expect(calculateTotalPoints({
        codeTutor: 1, codeTrack: 0, codeTest: 0, dailyTest: 0, dailyChallenge: 0
      })).toBe(0);

      // Requirement 6.3: Daily Test = 20 points per test
      expect(calculateTotalPoints({
        codeTutor: 0, codeTrack: 0, codeTest: 0, dailyTest: 1, dailyChallenge: 0
      })).toBe(20);

      // Requirement 6.4: Daily Challenge = 2 points per challenge
      expect(calculateTotalPoints({
        codeTutor: 0, codeTrack: 0, codeTest: 0, dailyTest: 0, dailyChallenge: 1
      })).toBe(2);

      // Requirement 6.5: Code Test = 30 points per test
      expect(calculateTotalPoints({
        codeTutor: 0, codeTrack: 0, codeTest: 1, dailyTest: 0, dailyChallenge: 0
      })).toBe(30);
    });
  });
});

describe('Integration Tests', () => {
  test('should parse and calculate points for realistic profile data', () => {
    const realisticProfile = `
      <!DOCTYPE html>
      <html>
      <body>
        <div class="statistics-section">
          <div class="statistic">
            <div class="label">CODE TEST</div>
            <div class="value">8</div>
          </div>
          <div class="statistic">
            <div class="label">CODE TRACK</div>
            <div class="value">245</div>
          </div>
          <div class="statistic">
            <div class="label">DC</div>
            <div class="value">15</div>
          </div>
          <div class="statistic">
            <div class="label">DT</div>
            <div class="value">22</div>
          </div>
          <div class="statistic">
            <div class="label">CODE TUTOR</div>
            <div class="value">67</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = parseProfileStats(realisticProfile);
    
    expect(result).toEqual({
      codeTutor: 67,
      codeTrack: 245,
      codeTest: 8,
      dailyTest: 22,
      dailyChallenge: 15,
      totalPoints: 1200 // (245*2) + (22*20) + (15*2) + (8*30) = 490 + 440 + 30 + 240 = 1200
    });
  });

  test('should handle edge case with mixed valid and invalid data', () => {
    const mixedProfile = `
      <!DOCTYPE html>
      <html>
      <body>
        <div class="statistics-section">
          <div class="statistic">
            <div class="label">CODE TEST</div>
            <div class="value">5 tests completed</div>
          </div>
          <div class="statistic">
            <div class="label">CODE TRACK</div>
            <div class="value">--</div>
          </div>
          <div class="statistic">
            <div class="label">DC</div>
            <div class="value">3</div>
          </div>
          <div class="statistic">
            <div class="label">DT</div>
            <!-- Missing value -->
          </div>
          <div class="statistic">
            <div class="label">CODE TUTOR</div>
            <div class="value">N/A</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = parseProfileStats(mixedProfile);
    
    expect(result).toEqual({
      codeTutor: 0,     // "N/A" -> 0
      codeTrack: 0,     // "--" -> 0
      codeTest: 5,      // "5 tests completed" -> 5
      dailyTest: 0,     // missing -> 0
      dailyChallenge: 3, // "3" -> 3
      totalPoints: 156  // (0*2) + (0*20) + (3*2) + (5*30) = 0 + 0 + 6 + 150 = 156
    });
  });
});