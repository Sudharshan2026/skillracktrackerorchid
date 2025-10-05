import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import handler from '../api/parse-profile';
import { validProfileHtml } from './sample-data';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console.error to avoid noise in test output
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  jest.clearAllMocks();
});

// Helper function to create mock request and response objects
let ipCounter = 0;
function createMockReqRes(method: string = 'POST', body: any = {}) {
  ipCounter++;
  const req = {
    method,
    body,
    headers: {},
    connection: { remoteAddress: `127.0.0.${ipCounter}` }
  } as VercelRequest;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis()
  } as unknown as VercelResponse;

  return { req, res };
}

describe('API Endpoint Tests', () => {
  describe('HTTP Method Validation', () => {
    test('should handle OPTIONS requests (CORS preflight)', async () => {
      const { req, res } = createMockReqRes('OPTIONS');
      
      await handler(req, res);
      
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'POST, OPTIONS');
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalled();
    });

    test('should reject non-POST requests', async () => {
      const { req, res } = createMockReqRes('GET');
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Method not allowed',
        code: 'INVALID_URL'
      });
    });
  });

  describe('Input Validation', () => {
    test('should reject requests without URL', async () => {
      const { req, res } = createMockReqRes('POST', {});
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'URL is required and must be a string',
        code: 'INVALID_URL'
      });
    });

    test('should reject requests with non-string URL', async () => {
      const { req, res } = createMockReqRes('POST', { url: 123 });
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'URL is required and must be a string',
        code: 'INVALID_URL'
      });
    });

    test('should reject invalid SkillRack URLs', async () => {
      const { req, res } = createMockReqRes('POST', { 
        url: 'https://google.com/profile/123/abc' 
      });
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid SkillRack profile URL format. Expected: https://skillrack.com/profile/[id]/[hash]',
        code: 'INVALID_URL'
      });
    });
  });

  describe('Network Error Handling', () => {
    test('should handle network connection errors', async () => {
      const { req, res } = createMockReqRes('POST', { 
        url: 'https://skillrack.com/profile/123/abc' 
      });
      
      mockedAxios.get.mockRejectedValue({ code: 'ENOTFOUND' });
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unable to connect to SkillRack. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      });
    });

    test('should handle connection refused errors', async () => {
      const { req, res } = createMockReqRes('POST', { 
        url: 'https://skillrack.com/profile/123/abc' 
      });
      
      mockedAxios.get.mockRejectedValue({ code: 'ECONNREFUSED' });
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unable to connect to SkillRack. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      });
    });

    test('should handle timeout errors', async () => {
      const { req, res } = createMockReqRes('POST', { 
        url: 'https://skillrack.com/profile/123/abc' 
      });
      
      mockedAxios.get.mockRejectedValue({ code: 'ECONNABORTED' });
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Request timeout. Please try again.',
        code: 'NETWORK_ERROR'
      });
    });

    test('should handle 404 errors', async () => {
      const { req, res } = createMockReqRes('POST', { 
        url: 'https://skillrack.com/profile/123/abc' 
      });
      
      mockedAxios.get.mockRejectedValue({ 
        response: { status: 404 }
      });
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Profile not found. Please check if the URL is correct and the profile is public.',
        code: 'NOT_FOUND'
      });
    });

    test('should handle 403 errors', async () => {
      const { req, res } = createMockReqRes('POST', { 
        url: 'https://skillrack.com/profile/123/abc' 
      });
      
      mockedAxios.get.mockRejectedValue({ 
        response: { status: 403 }
      });
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. The profile might be private or require login.',
        code: 'NOT_FOUND'
      });
    });

    test('should handle generic parsing errors', async () => {
      const { req, res } = createMockReqRes('POST', { 
        url: 'https://skillrack.com/profile/123/abc' 
      });
      
      mockedAxios.get.mockRejectedValue(new Error('Generic error'));
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to parse profile data. Please verify the profile URL is correct.',
        code: 'PARSE_ERROR'
      });
    });
  });

  describe('Successful Parsing', () => {
    test('should successfully parse valid profile data', async () => {
      const { req, res } = createMockReqRes('POST', { 
        url: 'https://skillrack.com/profile/123/abc' 
      });
      
      mockedAxios.get.mockResolvedValue({ 
        data: validProfileHtml 
      });
      
      await handler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          codeTutor: 100,
          codeTrack: 470,
          codeTest: 15,
          dailyTest: 30,
          dailyChallenge: 25,
          totalPoints: 2040
        }
      });
    });

    test('should set proper CORS headers', async () => {
      const { req, res } = createMockReqRes('POST', { 
        url: 'https://skillrack.com/profile/123/abc' 
      });
      
      mockedAxios.get.mockResolvedValue({ 
        data: validProfileHtml 
      });
      
      await handler(req, res);
      
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'POST, OPTIONS');
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type');
    });

    test('should make HTTP request with proper headers', async () => {
      const { req, res } = createMockReqRes('POST', { 
        url: 'https://skillrack.com/profile/123/abc' 
      });
      
      mockedAxios.get.mockResolvedValue({ 
        data: validProfileHtml 
      });
      
      await handler(req, res);
      
      // First check if the response was successful
      expect(res.status).toHaveBeenCalledWith(200);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://skillrack.com/profile/123/abc',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('Mozilla'),
            'Accept': expect.stringContaining('text/html'),
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
          }),
          timeout: 10000
        })
      );
    });
  });

  describe('Rate Limiting', () => {
    test('should implement basic rate limiting', async () => {
      const { req, res } = createMockReqRes('POST', { 
        url: 'https://skillrack.com/profile/123/abc' 
      });
      
      // Mock successful response
      mockedAxios.get.mockResolvedValue({ 
        data: validProfileHtml 
      });
      
      // Make multiple requests rapidly
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(handler(req, res));
      }
      
      await Promise.all(promises);
      
      // At least one should be rate limited (status 429)
      const rateLimitedCalls = (res.status as jest.Mock).mock.calls
        .filter(call => call[0] === 429);
      
      expect(rateLimitedCalls.length).toBeGreaterThan(0);
    });
  });
});