// const axios = require('axios');
// const cheerio = require('cheerio');

// function validateSkillRackUrl(url) {
//   try {
//     const urlObj = new URL(url);
//     if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
//       return false;
//     }
//     if (urlObj.hostname !== 'www.skillrack.com') {
//       return false;
//     }
//     const pathPattern = /^\/profile\/\d+\/[a-zA-Z0-9]+$/;
//     return pathPattern.test(urlObj.pathname);
//   } catch {
//     return false;
//   }
// }

// function calculateTotalPoints(stats) {
//   const codeTrackPoints = stats.codeTrack * 2;
//   const dailyTestPoints = stats.dailyTest * 20;
//   const dailyChallengePoints = stats.dailyChallenge * 2;
//   const codeTestPoints = stats.codeTest * 30;
//   return codeTrackPoints + dailyTestPoints + dailyChallengePoints + codeTestPoints;
// }

// function parseSkillRackProfile(html) {
//   const $ = cheerio.load(html);
//   const profileImage = $('#j_id_s').attr('src');
//   const name = $('.ui.big.label.black').first().text().trim();
//   const idElement = $('.ui.four.wide.center.aligned.column').text();
//   const idMatch = idElement.match(/([A-Z]{3}\d{2}[A-Z]{2}\d{3})/);
//   const id = idMatch ? idMatch[1] : '';
//   const department = $('.ui.large.label').text().trim();
//   const collegeYearText = $('.ui.four.wide.center.aligned.column').text();
//   const collegeRegex = new RegExp(department + '\s*\n\s*(.+?)\s*\n\s*\(');
//   const collegeMatch = collegeYearText.match(collegeRegex);
//   const college = collegeMatch ? collegeMatch[1].trim() : '';
//   const yearMatch = collegeYearText.match(/\(([^)]+)\s+(\d{4})\)/);
//   const year = yearMatch ? yearMatch[2].trim() : '';
//   const gender = $('.ui.fourteen.wide.left.aligned.column').text().trim();
//   function extractStatValue(labelText) {
//     let value = 0;
//     $('.statistic').each((_, element) => {
//       const label = $(element).find('.label').text().trim();
//       if (label === labelText) {
//         const valueText = $(element).find('.value').text().replace(/[^\d]/g, '');
//         value = parseInt(valueText) || 0;
//         return false;
//       }
//     });
//     return value;
//   }
//   const stats = {
//     rank: extractStatValue('RANK'),
//     level: extractStatValue('LEVEL'),
//     gold: extractStatValue('GOLD'),
//     silver: extractStatValue('SILVER'),
//     bronze: extractStatValue('BRONZE'),
//     programsSolved: extractStatValue('PROGRAMS SOLVED'),
//     codeTest: extractStatValue('CODE TEST'),
//     codeTrack: extractStatValue('CODE TRACK'),
//     dailyChallenge: extractStatValue('DC'),
//     dailyTest: extractStatValue('DT'),
//     codeTutor: extractStatValue('CODE TUTOR')
//   };
//   const totalPoints = calculateTotalPoints(stats);
//   const languages = {};
//   const languageStats = $('div.ui.six.small.statistics').eq(1);
//   languageStats.find('.statistic').each((_i, el) => {
//     const label = $(el).find('.label').text().trim();
//     const valueText = $(el).find('.value').text();
//     const value = parseInt(valueText.replace(/[^0-9]/g, '')) || 0;
//     if (label && value) {
//       languages[label] = value;
//     }
//   });
//   const certificates = [];
//   $('.ui.brown.card').each((_i, el) => {
//     const title = $(el).find('b').text().trim();
//     let date = '';
//     const contentText = $(el).find('.content').text();
//     const dateMatch = contentText.match(/(\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2})/);
//     if (dateMatch) {
//       date = dateMatch[1];
//     }
//     const link = $(el).find('a').attr('href') || '';
//     certificates.push({ title, date, link });
//   });
//   return {
//     profileImage,
//     name,
//     id,
//     department,
//     college,
//     year,
//     gender,
//     stats: { ...stats, totalPoints },
//     languages,
//     certificates
//   };
// }

// function preprocessApiUrl(rawUrl) {
//   let cleanedUrl = rawUrl.trim();
//   cleanedUrl = cleanedUrl.replace(/\s+/g, '');
//   if (cleanedUrl && !cleanedUrl.match(/^https?:\/\//)) {
//     if (cleanedUrl.match(/^(www\.)?skillrack\.com/)) {
//       cleanedUrl = `https://$${cleanedUrl}`;
//     }
//   }
//   if (cleanedUrl.includes('://skillrack.com') && !cleanedUrl.includes('://www.skillrack.com')) {
//     cleanedUrl = cleanedUrl.replace('://skillrack.com', '://www.skillrack.com');
//   }
//   return cleanedUrl;
// }

// const requestCounts = new Map();
// const RATE_LIMIT_WINDOW = 60 * 1000;
// const MAX_REQUESTS_PER_WINDOW = 10;

// function checkRateLimit(clientIp) {
//   const now = Date.now();
//   const clientData = requestCounts.get(clientIp);
//   if (!clientData || now > clientData.resetTime) {
//     requestCounts.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
//     return true;
//   }
//   if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
//     return false;
//   }
//   clientData.count++;
//   return true;
// }

// module.exports = async function (req, res) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//   if (req.method === 'OPTIONS') {
//     res.status(200).end();
//     return;
//   }
//   if (req.method !== 'POST') {
//     res.status(405).json({ success: false, error: 'Method not allowed', code: 'INVALID_URL' });
//     return;
//   }
//   const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
//   if (!checkRateLimit(clientIp)) {
//     res.status(429).json({ success: false, error: 'Too many requests. Please wait a moment before trying again.', code: 'NETWORK_ERROR' });
//     return;
//   }
//   try {
//     const { url } = req.body;
//     if (!url || typeof url !== 'string') {
//       res.status(400).json({ success: false, error: 'URL is required and must be a string', code: 'INVALID_URL' });
//       return;
//     }
//     const cleanedUrl = preprocessApiUrl(url);
//     if (!validateSkillRackUrl(cleanedUrl)) {
//       res.status(400).json({ success: false, error: 'Invalid SkillRack profile URL format. Expected: https://www.skillrack.com/profile/[id]/[hash]', code: 'INVALID_URL' });
//       return;
//     }
//     const axiosResponse = await axios.get(cleanedUrl, {
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//         'Accept-Language': 'en-US,en;q=0.5',
//         'Accept-Encoding': 'gzip, deflate',
//         'Connection': 'keep-alive',
//         'Upgrade-Insecure-Requests': '1'
//       },
//       timeout: 10000
//     });
//     const profileData = parseSkillRackProfile(axiosResponse.data);
//     res.status(200).json({ success: true, data: profileData });
//   } catch (error) {
//     console.error('Error parsing profile:', error);
//     let errorResponse;
//     if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
//       errorResponse = { success: false, error: 'Unable to connect to SkillRack. Please check your internet connection.', code: 'NETWORK_ERROR' };
//     } else if (error.response?.status === 404) {
//       errorResponse = { success: false, error: 'Profile not found. Please check if the URL is correct and the profile is public.', code: 'NOT_FOUND' };
//     } else if (error.response?.status === 403) {
//       errorResponse = { success: false, error: 'Access denied. The profile might be private or require login.', code: 'NOT_FOUND' };
//     } else if (error.code === 'ECONNABORTED') {
//       errorResponse = { success: false, error: 'Request timeout. Please try again.', code: 'NETWORK_ERROR' };
//     } else {
//       errorResponse = { success: false, error: 'Failed to parse profile data. Please verify the profile URL is correct.', code: 'PARSE_ERROR' };
//     }
//     res.status(500).json(errorResponse);
//   }
// };




