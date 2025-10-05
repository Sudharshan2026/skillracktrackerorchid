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

// URL validation for SkillRack profile format
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
    
    // Check if it matches the profile URL pattern: /profile/[id]/[hash]
    const pathPattern = /^\/profile\/\d+\/[a-zA-Z0-9]+$/;
    return pathPattern.test(urlObj.pathname);
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

// Function to parse complete SkillRack profile from HTML
function parseSkillRackProfile(html: string): SkillRackProfile {
  const $ = cheerio.load(html);
  
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
  
  // Add protocol if missing
  if (cleanedUrl && !cleanedUrl.match(/^https?:\/\//)) {
    // Check if it starts with skillrack.com or www.skillrack.com
    if (cleanedUrl.match(/^(www\.)?skillrack\.com/)) {
      cleanedUrl = `https://${cleanedUrl}`;
    }
  }
  
  // Normalize www subdomain (add if missing, SkillRack requires www)
  if (cleanedUrl.includes('://skillrack.com') && !cleanedUrl.includes('://www.skillrack.com')) {
    cleanedUrl = cleanedUrl.replace('://skillrack.com', '://www.skillrack.com');
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
    
    // Preprocess the URL to clean whitespace and normalize format
    const cleanedUrl = preprocessApiUrl(url);
    
    // Validate SkillRack URL format using the cleaned URL
    if (!validateSkillRackUrl(cleanedUrl)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid SkillRack profile URL format. Expected: https://www.skillrack.com/profile/[id]/[hash]',
        code: 'INVALID_URL'
      };
      res.status(400).json(response);
      return;
    }
    
    // Fetch the profile page with proper User-Agent headers using the cleaned URL
    const axiosResponse = await axios.get(cleanedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000 // 10 second timeout
    });
    
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
    } else if (error.response?.status === 403) {
      errorResponse = {
        success: false,
        error: 'Access denied. The profile might be private or require login.',
        code: 'NOT_FOUND'
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

