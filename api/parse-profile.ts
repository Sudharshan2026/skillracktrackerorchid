import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
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
    
  // Fetch the profile page with ScraperAPI to bypass Cloudflare protection
    let htmlContent: string = '';
  let jsonContent: any = null;
    let attempt = 0;
    const maxAttempts = 2; // Reduced from 3 to 2 for faster processing
    
    // ScraperAPI configuration
    // Default API key works but has limited credits. For production, get your own key from https://www.scraperapi.com/signup
    // Set SCRAPERAPI_KEY environment variable in Vercel dashboard for your own key
    const scraperApiKey = process.env.SCRAPERAPI_KEY || '9df7b00be01b37367cf4de2f69e546c8';
    
    // Dynamic timeouts: ScraperAPI responds in 4-12s without extra parameters
    // Vercel Pro allows 60s max, Hobby allows 10s max
    // Using 20s/25s to give enough buffer for network variations
    const getTimeout = (attempt: number) => attempt === 1 ? 20000 : 25000;
    
    while (attempt < maxAttempts && !htmlContent) {
      attempt++;
      
      try {
        // Track timing for this attempt
        const attemptStartTime = Date.now();
        
        // Add minimal delay between attempts
        if (attempt > 1) {
          const delay = 1000; // 1s delay (ScraperAPI doesn't need reset time)
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        console.log(`Attempt ${attempt}: Fetching via ScraperAPI...`);
        
        // Try ScraperAPI first with optimized parameters
        try {
          // Optimized ScraperAPI parameters for better reliability and speed
          // Using minimal parameters - render=false and country_code cause 500 errors on protected domains
          const scraperApiUrl = `https://api.scraperapi.com/?api_key=${scraperApiKey}&url=${encodeURIComponent(cleanedUrl)}`;

          console.log(`Attempt ${attempt}: ScraperAPI URL (key masked): https://api.scraperapi.com/?api_key=***&url=${encodeURIComponent(cleanedUrl)}`);
          console.log(`Attempt ${attempt}: API Key present: ${!!scraperApiKey}, Length: ${scraperApiKey?.length || 0}`);

          // Dynamic timeout: 12s first attempt, 18s second attempt  
          const timeout = getTimeout(attempt);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          console.log(`Using ${timeout}ms timeout for attempt ${attempt}`);
          
          const attemptStartTime = Date.now();

          const scraperResponse = await fetch(scraperApiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json,text/html;q=0.9,*/*;q=0.8',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          const attemptDuration = Date.now() - attemptStartTime;

          if (scraperResponse.ok) {
            console.log(`Attempt ${attempt}: ScraperAPI response received in ${attemptDuration}ms`);
            const contentType = scraperResponse.headers.get('content-type') || '';

            // If ScraperAPI returned JSON (autoparse), parse and try to use structured data
            if (contentType.includes('application/json')) {
              try {
                jsonContent = await scraperResponse.json();
                console.log(`Attempt ${attempt}: ScraperAPI returned JSON autoparse`);

                // autoparse sometimes puts the extracted HTML in `body` or `html` fields
                if (!jsonContent || (typeof jsonContent === 'object' && Object.keys(jsonContent).length === 0)) {
                  console.log(`Attempt ${attempt}: ScraperAPI JSON empty, falling back to HTML`);
                } else {
                  // If autoparse produced a `body` or `html` snippet, prefer it for parsing
                  if (typeof jsonContent.body === 'string' && jsonContent.body.length > 0) {
                    htmlContent = jsonContent.body;
                  } else if (typeof jsonContent.html === 'string' && jsonContent.html.length > 0) {
                    htmlContent = jsonContent.html;
                  }

                  // If we have usable content, break
                  if (htmlContent && (htmlContent.includes('ui.big.label.black') || htmlContent.includes('statistic') || htmlContent.length > 500)) {
                    break; // success
                  }
                }
              } catch (jsonErr) {
                console.log(`Attempt ${attempt}: Error parsing ScraperAPI JSON:`, (jsonErr as Error).message);
              }
            } else {
              // Not JSON - fall back to reading HTML text
              htmlContent = await scraperResponse.text();
              console.log(`Attempt ${attempt}: ScraperAPI succeeded (HTML), length: ${htmlContent.length}`);
              
              // Quick validation - check for SkillRack profile indicators
              const hasProfileContent = htmlContent.includes('ui.big.label.black') || 
                                      htmlContent.includes('statistic') || 
                                      htmlContent.includes('PROGRAMS SOLVED') ||
                                      htmlContent.includes('RANK');
              
              if (hasProfileContent && htmlContent.length > 1000) {
                break; // Success - we have valid profile content
              } else {
                console.log(`Attempt ${attempt}: ScraperAPI returned invalid HTML content, trying direct fetch`);
                throw new Error('Invalid content from ScraperAPI');
              }
            }
          } else {
            const errorText = await scraperResponse.text().catch(() => 'Unable to read error response');
            console.log(`Attempt ${attempt}: ScraperAPI failed with status ${scraperResponse.status}`);
            console.log(`Attempt ${attempt}: ScraperAPI error response: ${errorText.substring(0, 200)}`);
            throw new Error(`ScraperAPI failed: ${scraperResponse.status} - ${errorText.substring(0, 100)}`);
          }
        } catch (scraperError) {
          const attemptDuration = Date.now() - attemptStartTime;
          console.log(`Attempt ${attempt}: ScraperAPI error after ${attemptDuration}ms:`, (scraperError as Error).message);
          console.log(`Attempt ${attempt}: Error type:`, (scraperError as any).type || 'unknown');

          // Skip direct fetch on final attempt since it consistently gets 403 Forbidden in production
          if (attempt === maxAttempts) {
            console.log(`Attempt ${attempt}: Skipping direct fetch on final attempt (403 Forbidden expected)`);
            throw scraperError;
          }

          // Fallback to direct fetch if ScraperAPI fails
          console.log(`Attempt ${attempt}: Trying direct fetch as fallback...`);
          
          // Create AbortController for timeout
          const directController = new AbortController();
          const directTimeoutId = setTimeout(() => directController.abort(), 8000);
          
          const directResponse = await fetch(cleanedUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'cross-site',
              'Cache-Control': 'max-age=0',
              'DNT': '1',
            },
            signal: directController.signal
          });
          
          clearTimeout(directTimeoutId);

          if (!directResponse.ok) {
            throw new Error(`Direct fetch failed: ${directResponse.status} ${directResponse.statusText}`);
          }

          htmlContent = await directResponse.text();
          console.log(`Attempt ${attempt}: Direct fetch succeeded, HTML length: ${htmlContent.length}`);
        }

        // Check if we got blocked content
        if (htmlContent.includes('cf-wrapper') || 
            htmlContent.includes('Cloudflare') ||
            htmlContent.includes('Sorry, you have been blocked') ||
            htmlContent.includes('Access denied') ||
            htmlContent.includes('Ray ID')) {
          
          console.log(`Attempt ${attempt}: Cloudflare block detected in response`);
          
          if (attempt === maxAttempts) {
            throw new Error('Cloudflare protection detected - all retry attempts failed');
          }
          htmlContent = ''; // Reset for next attempt
          continue; // Try again
        }

  // If we get here, the request was successful (or will continue retrying)
  console.log(`Attempt ${attempt}: Fetch attempt completed`);
  if (htmlContent) break;
        
      } catch (error: any) {
        console.log(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxAttempts) {
          throw error;
        }
      }
    }
    
    // Ensure we have valid HTML content
    if (!htmlContent) {
      throw new Error('Failed to get valid HTML content after all retry attempts');
    }
    
    // Parse the HTML and extract complete profile data
    const profileData = parseSkillRackProfile(htmlContent);
    
    const response: ApiResponse = {
      success: true,
      data: profileData
    };
    
    res.status(200).json(response);
    
  } catch (error: any) {
    console.error('Error parsing profile:', error);
    
    let errorResponse: ApiResponse;
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message?.includes('fetch')) {
      errorResponse = {
        success: false,
        error: 'Unable to connect to SkillRack. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      };
    } else if (error.message?.includes('404') || error.message?.includes('not found')) {
      errorResponse = {
        success: false,
        error: 'Profile not found. Please check if the URL is correct and the profile is public.',
        code: 'NOT_FOUND'
      };
    } else if (error.message?.includes('403') || error.message?.includes('blocked') || error.message?.includes('Cloudflare')) {
      errorResponse = {
        success: false,
        error: 'Access temporarily blocked by security protection. Please try again later or contact support if this persists.',
        code: 'NETWORK_ERROR'
      };
    } else if (error.message?.includes('timeout') || error.message?.includes('aborted') || error.type === 'aborted') {
      errorResponse = {
        success: false,
        error: 'Request timeout - SkillRack is taking too long to respond. Please try again in a few moments.',
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

