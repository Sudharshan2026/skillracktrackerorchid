/**
 * Tests for URL preprocessing in the API endpoint
 * Requirement 4.7: URL preprocessing and validation enhancements
 */

// Mock axios to avoid actual HTTP requests
jest.mock('axios');

// Mock the parsing utils
jest.mock('../../api/parsing-utils', () => ({
  validateSkillRackUrl: jest.fn(),
  parseProfileStats: jest.fn()
}));

import { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../api/parse-profile';
import { validateSkillRackUrl, parseProfileStats } from '../../api/parsing-utils';

const mockValidateSkillRackUrl = validateSkillRackUrl as jest.MockedFunction<typeof validateSkillRackUrl>;
const mockParseProfileStats = parseProfileStats as jest.MockedFunction<typeof parseProfileStats>;

describe('API URL Preprocessing', () => {
  let mockReq: Partial<VercelRequest>;
  let mockRes: Partial<VercelResponse>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSetHeader: jest.Mock;
  let mockEnd: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockSetHeader = jest.fn();
    mockEnd = jest.fn();

    mockRes = {
      json: mockJson,
      status: mockStatus,
      setHeader: mockSetHeader,
      end: mockEnd
    };

    mockReq = {
      method: 'POST',
      body: {},
      headers: {},
      connection: { remoteAddress: '127.0.0.1' } as any
    };

    // Reset mocks
    mockValidateSkillRackUrl.mockClear();
    mockParseProfileStats.mockClear();
  });

  test('should preprocess URL with whitespace', async () => {
    const urlWithWhitespace = '  https://skillrack.com/profile/123456/abcdef  ';
    const cleanedUrl = 'https://skillrack.com/profile/123456/abcdef';

    mockReq.body = { url: urlWithWhitespace };
    mockValidateSkillRackUrl.mockReturnValue(true);
    mockParseProfileStats.mockReturnValue({
      codeTutor: 0,
      codeTrack: 10,
      codeTest: 5,
      dailyTest: 3,
      dailyChallenge: 2,
      totalPoints: 184
    });

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    // Should validate the cleaned URL
    expect(mockValidateSkillRackUrl).toHaveBeenCalledWith(cleanedUrl);
  });

  test('should preprocess URL without protocol', async () => {
    const urlWithoutProtocol = 'skillrack.com/profile/123456/abcdef';
    const cleanedUrl = 'https://skillrack.com/profile/123456/abcdef';

    mockReq.body = { url: urlWithoutProtocol };
    mockValidateSkillRackUrl.mockReturnValue(true);
    mockParseProfileStats.mockReturnValue({
      codeTutor: 0,
      codeTrack: 10,
      codeTest: 5,
      dailyTest: 3,
      dailyChallenge: 2,
      totalPoints: 184
    });

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    // Should validate the cleaned URL with protocol added
    expect(mockValidateSkillRackUrl).toHaveBeenCalledWith(cleanedUrl);
  });

  test('should preprocess URL with www subdomain', async () => {
    const urlWithWww = 'https://www.skillrack.com/profile/123456/abcdef';
    const cleanedUrl = 'https://skillrack.com/profile/123456/abcdef';

    mockReq.body = { url: urlWithWww };
    mockValidateSkillRackUrl.mockReturnValue(true);
    mockParseProfileStats.mockReturnValue({
      codeTutor: 0,
      codeTrack: 10,
      codeTest: 5,
      dailyTest: 3,
      dailyChallenge: 2,
      totalPoints: 184
    });

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    // Should validate the cleaned URL without www
    expect(mockValidateSkillRackUrl).toHaveBeenCalledWith(cleanedUrl);
  });

  test('should handle multiple preprocessing steps', async () => {
    const messyUrl = '  www.skillrack.com/profile/123 456/abcdef  ';
    const cleanedUrl = 'https://skillrack.com/profile/123456/abcdef';

    mockReq.body = { url: messyUrl };
    mockValidateSkillRackUrl.mockReturnValue(true);
    mockParseProfileStats.mockReturnValue({
      codeTutor: 0,
      codeTrack: 10,
      codeTest: 5,
      dailyTest: 3,
      dailyChallenge: 2,
      totalPoints: 184
    });

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    // Should validate the fully cleaned URL
    expect(mockValidateSkillRackUrl).toHaveBeenCalledWith(cleanedUrl);
  });

  test('should reject invalid URLs even after preprocessing', async () => {
    const invalidUrl = '  example.com/profile/123456/abcdef  ';
    const cleanedUrl = 'example.com/profile/123456/abcdef';

    mockReq.body = { url: invalidUrl };
    mockValidateSkillRackUrl.mockReturnValue(false);

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    // Should validate the cleaned URL and reject it
    expect(mockValidateSkillRackUrl).toHaveBeenCalledWith(cleanedUrl);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid SkillRack profile URL format. Expected: https://skillrack.com/profile/[id]/[hash]',
      code: 'INVALID_URL'
    });
  });
});