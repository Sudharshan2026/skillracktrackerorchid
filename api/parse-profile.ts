import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Inline types and utilities to avoid module resolution issues
interface ProfileStats {
  codeTutor: number;
  codeTrack: number;
  codeTest: number;
  dailyTest: number;
  dailyChallenge: number;
  rank: number;
  level: number;
  gold: number;
  silver: number;
  bronze: number;
  programsSolved: number;
  totalPoints: number;
}

interface Certificate {
  title: string;
  date: string;
  link: string;
}

interface SkillRackProfile {
  profileImage?: string;
  name: string;
  id: string;
  department: string;
  college: string;
  year: string;
  gender: string;
  stats: ProfileStats;
  languages: Record<string, number>;
  certificates: Certificate[];
}

// URL validation for SkillRack profile format (accepts both profile and resume.xhtml formats)
function validateSkillRackUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Check if it's HTTP or HTTPS protocol
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false;
    }
    
    // Check if it's a SkillRack domain with www subdomain
    if (urlObj.hostname !== 'www.skillrack.com') {
      return false;
    }
    
    // Check if it matches either format:
    // 1. Profile URL pattern: /profile/[id]/[hash]
    // 2. Resume URL pattern: /faces/resume.xhtml?id=[id]&key=[hash]
    const profilePathPattern = /^\/profile\/\d+\/[a-zA-Z0-9]+$/;
    const resumePathPattern = /^\/faces\/resume\.xhtml$/;
    const hasValidParams = urlObj.searchParams.has('id') && urlObj.searchParams.has('key');
    
    return profilePathPattern.test(urlObj.pathname) || 
           (resumePathPattern.test(urlObj.pathname) && hasValidParams);
  } catch {
    return false;
  }
}

// Function to calculate total points based on SkillRack scoring
function calculateTotalPoints(stats: Omit<ProfileStats, 'totalPoints'>): number {
  const codeTrackPoints = stats.codeTrack * 2;      // 2 points per Code Track
  const dailyTestPoints = stats.dailyTest * 20;     // 20 points per Daily Test
  const dailyChallengePoints = stats.dailyChallenge * 2; // 2 points per Daily Challenge
  const codeTestPoints = stats.codeTest * 30;       // 30 points per Code Test
  // Code Tutor = 0 points (display only)
  
  return codeTrackPoints + dailyTestPoints + dailyChallengePoints + codeTestPoints;
}

// Function to parse complete SkillRack profile from HTML (works for both profile and resume.xhtml formats)
function parseSkillRackProfile(html: string): SkillRackProfile {
  const $ = cheerio.load(html);
  
  // Debug: Log some basic info about the HTML structure
  console.log('HTML title:', $('title').text());
  console.log('HTML contains profile elements:', $('.ui.big.label.black').length > 0);
  
  // Extract profile image
  const profileImage = $('#j_id_s').attr('src');

  // Extract name - only get the text from the label element
  const name = $('.ui.big.label.black').first().text().trim();
  
  // Extract ID - look for specific pattern SEC23AD073
  const idElement = $('.ui.four.wide.center.aligned.column').text();
  const idMatch = idElement.match(/([A-Z]{3}\d{2}[A-Z]{2}\d{3})/); // Format like SEC23AD073
  const id = idMatch ? idMatch[1] : '';

  // Extract department/course
  const department = $('.ui.large.label').text().trim();

  // Extract college and year
  const collegeYearText = $('.ui.four.wide.center.aligned.column').text();
  
  // Extract college name - look for text after department and before year
  const collegeRegex = new RegExp(department + '\\s*\\n\\s*(.+?)\\s*\\n\\s*\\(');
  const collegeMatch = collegeYearText.match(collegeRegex);
  const college = collegeMatch ? collegeMatch[1].trim() : '';
  
  // Extract year from parentheses
  const yearMatch = collegeYearText.match(/\(([^)]+)\s+(\d{4})\)/);
  const year = yearMatch ? yearMatch[2].trim() : '';

  // Extract gender
  const gender = $('.ui.fourteen.wide.left.aligned.column').text().trim();

  // Extract values by label matching from .statistic elements
  function extractStatValue(labelText: string): number {
    let value = 0;
    
    $('.statistic').each((_, element) => {
      const label = $(element).find('.label').text().trim();
      if (label === labelText) {
        const valueText = $(element).find('.value').text().replace(/[^\d]/g, '');
        value = parseInt(valueText) || 0;
        return false; // Break the loop
      }
    });
    
    return value;
  }
  
  // Extract programming statistics
  const stats: Omit<ProfileStats, 'totalPoints'> = {
    rank: extractStatValue('RANK'),
    level: extractStatValue('LEVEL'),
    gold: extractStatValue('GOLD'),
    silver: extractStatValue('SILVER'),
    bronze: extractStatValue('BRONZE'),
    programsSolved: extractStatValue('PROGRAMS SOLVED'),
    codeTest: extractStatValue('CODE TEST'),
    codeTrack: extractStatValue('CODE TRACK'),
    dailyChallenge: extractStatValue('DC'),
    dailyTest: extractStatValue('DT'),
    codeTutor: extractStatValue('CODE TUTOR')
  };

  // Calculate total points
  const totalPoints = calculateTotalPoints(stats);

  // Extract programming languages - direct approach
  const languages: Record<string, number> = {};
  const languageStats = $('div.ui.six.small.statistics').eq(1); // Second statistics section
  languageStats.find('.statistic').each((i, el) => {
    const label = $(el).find('.label').text().trim();
    const valueText = $(el).find('.value').text();
    const value = parseInt(valueText.replace(/[^0-9]/g, '')) || 0;
    if (label && value) {
      languages[label] = value;
    }
  });

  // Extract certificates
  const certificates: Certificate[] = [];
  $('.ui.brown.card').each((i, el) => {
    const title = $(el).find('b').text().trim();
    
    // Extract date with a more precise approach
    let date = '';
    const contentText = $(el).find('.content').text();
    // Look for the date pattern directly
    const dateMatch = contentText.match(/(\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2})/);
    if (dateMatch) {
      date = dateMatch[1];
    }
    
    const link = $(el).find('a').attr('href') || '';
    
    certificates.push({
      title,
      date,
      link
    });
  });

  return {
    profileImage,
    name,
    id,
    department,
    college,
    year,
    gender,
    stats: { ...stats, totalPoints },
    languages,
    certificates
  };
}

// URL preprocessing function for the API
function preprocessApiUrl(rawUrl: string): string {
  // Remove leading and trailing whitespace
  let cleanedUrl = rawUrl.trim();
  
  // Remove internal whitespace (spaces within the URL)
  cleanedUrl = cleanedUrl.replace(/\s+/g, '');
  
  // Add protocol if missing (prefer HTTPS)
  if (cleanedUrl && !cleanedUrl.match(/^https?:\/\//)) {
    // Check if it starts with skillrack.com or www.skillrack.com
    if (cleanedUrl.match(/^(www\.)?skillrack\.com/)) {
      cleanedUrl = `https://${cleanedUrl}`;
    }
  }
  
  // Convert HTTP to HTTPS for better compatibility
  if (cleanedUrl.startsWith('http://')) {
    cleanedUrl = cleanedUrl.replace('http://', 'https://');
  }
  
  // Normalize www subdomain (add if missing, SkillRack requires www)
  if (cleanedUrl.includes('://skillrack.com') && !cleanedUrl.includes('://www.skillrack.com')) {
    cleanedUrl = cleanedUrl.replace('://skillrack.com', '://www.skillrack.com');
  }
  
  // Convert profile URL to resume.xhtml format to bypass Cloudflare protection
  // Transform: https://www.skillrack.com/profile/440943/bf966a469d73bfb792f4d2a72a4762937ba3fc48
  // To: https://www.skillrack.com/faces/resume.xhtml?id=440943&key=bf966a469d73bfb792f4d2a72a4762937ba3fc48
  const profileMatch = cleanedUrl.match(/https?:\/\/www\.skillrack\.com\/profile\/(\d+)\/([a-zA-Z0-9]+)/);
  if (profileMatch) {
    const [, profileId, profileKey] = profileMatch;
    cleanedUrl = `https://www.skillrack.com/faces/resume.xhtml?id=${profileId}&key=${profileKey}`;
    console.log(`Converted profile URL to resume format: ${cleanedUrl}`);
  }
  
  return cleanedUrl;
}

// Simple in-memory rate limiting (resets on function restart)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

interface ApiResponse {
  success: boolean;
  data?: SkillRackProfile;
  error?: string;
  code?: 'INVALID_URL' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'NOT_FOUND';
}

// Function to get random user agent to avoid detection
function getRandomUserAgent(): string {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Rate limiting function
function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const clientData = requestCounts.get(clientIp);
  
  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize counter
    requestCounts.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  clientData.count++;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    const response: ApiResponse = {
      success: false,
      error: 'Method not allowed',
      code: 'INVALID_URL'
    };
    res.status(405).json(response);
    return;
  }
  
  // Basic rate limiting
  const clientIp = req.headers['x-forwarded-for'] as string || req.connection?.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    const response: ApiResponse = {
      success: false,
      error: 'Too many requests. Please wait a moment before trying again.',
      code: 'NETWORK_ERROR'
    };
    res.status(429).json(response);
    return;
  }
  
  try {
    const { url } = req.body;
    
    // Validate URL format
    if (!url || typeof url !== 'string') {
      const response: ApiResponse = {
        success: false,
        error: 'URL is required and must be a string',
        code: 'INVALID_URL'
      };
      res.status(400).json(response);
      return;
    }
    
    // Validate original URL format before conversion
    if (!validateSkillRackUrl(url)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid SkillRack profile URL format. Expected: https://www.skillrack.com/profile/[id]/[hash]',
        code: 'INVALID_URL'
      };
      res.status(400).json(response);
      return;
    }
    
    // Preprocess the URL to clean whitespace, normalize format, and convert to resume.xhtml
    console.log('Original URL:', url);
    const cleanedUrl = preprocessApiUrl(url);
    console.log('Processed URL:', cleanedUrl);
    
    // Fetch the profile page with retry logic and enhanced headers
    let axiosResponse: any = null;
    let attempt = 0;
    const maxAttempts = 3;
    
    while (attempt < maxAttempts) {
      attempt++;
      
      try {
        // Add delay between attempts (except first)
        if (attempt > 1) {
          const delay = Math.random() * 2000 + 1000 * attempt; // 1-3s, 2-4s, 3-5s
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Create axios instance with session-like behavior
        const axiosInstance = axios.create({
          timeout: 20000,
          maxRedirects: 5,
          validateStatus: function (status) {
            return status < 500;
          },
          // Add some session-like headers
          withCredentials: false,
        });

        axiosResponse = await axiosInstance.get(cleanedUrl, {
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': attempt === 1 ? 'cross-site' : 'same-origin',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Cache-Control': attempt > 1 ? 'no-cache' : 'max-age=0',
            'Referer': attempt === 1 ? 'https://www.google.com/' : 'https://www.skillrack.com/',
            'DNT': '1',
            // Vary headers slightly between attempts
            ...(attempt > 1 && { 'Pragma': 'no-cache' }),
            ...(attempt === 2 && { 'X-Requested-With': 'XMLHttpRequest' }),
          }
        });

        // Check if we got blocked immediately after request
        if (axiosResponse.status === 403 || 
            axiosResponse.data.includes('cf-wrapper') || 
            axiosResponse.data.includes('Cloudflare') ||
            axiosResponse.data.includes('Sorry, you have been blocked') ||
            axiosResponse.data.includes('Access denied') ||
            axiosResponse.data.includes('Ray ID')) {
          
          console.log(`Attempt ${attempt}: Cloudflare block detected`);
          
          if (attempt === maxAttempts) {
            throw new Error('Cloudflare protection detected - all retry attempts failed');
          }
          continue; // Try again
        }

        // If we get here, the request was successful
        break;
        
      } catch (error: any) {
        console.log(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxAttempts) {
          throw error;
        }
      }
    }
    
    // Ensure we have a valid response
    if (!axiosResponse) {
      throw new Error('Failed to get valid response after all retry attempts');
    }
    
    // Parse the HTML and extract complete profile data
    const profileData = parseSkillRackProfile(axiosResponse.data);
    
    const response: ApiResponse = {
      success: true,
      data: profileData
    };
    
    res.status(200).json(response);
    
  } catch (error: any) {
    console.error('Error parsing profile:', error);
    
    let errorResponse: ApiResponse;
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorResponse = {
        success: false,
        error: 'Unable to connect to SkillRack. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      };
    } else if (error.response?.status === 404) {
      errorResponse = {
        success: false,
        error: 'Profile not found. Please check if the URL is correct and the profile is public.',
        code: 'NOT_FOUND'
      };
    } else if (error.response?.status === 403 || error.message?.includes('Cloudflare')) {
      errorResponse = {
        success: false,
        error: 'Access temporarily blocked by security protection. This is likely due to Cloudflare protection on SkillRack. Please try again later or contact support if this persists.',
        code: 'NETWORK_ERROR'
      };
    } else if (error.code === 'ECONNABORTED') {
      errorResponse = {
        success: false,
        error: 'Request timeout. Please try again.',
        code: 'NETWORK_ERROR'
      };
    } else {
      errorResponse = {
        success: false,
        error: 'Failed to parse profile data. Please verify the profile URL is correct.',
        code: 'PARSE_ERROR'
      };
    }
    
    res.status(500).json(errorResponse);
  }
}

