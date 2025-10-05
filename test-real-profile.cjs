const axios = require('axios');
const cheerio = require('cheerio');

// Copy the parsing functions from our TypeScript code
function parseProfileStats(html) {
  const $ = cheerio.load(html);
  
  // Extract values by label matching from .statistic elements
  function extractValueByLabel(labelText) {
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
  
  // Extract statistics for each category
  const codeTest = extractValueByLabel('CODE TEST');
  const codeTrack = extractValueByLabel('CODE TRACK');
  const dailyChallenge = extractValueByLabel('DC');
  const dailyTest = extractValueByLabel('DT');
  const codeTutor = extractValueByLabel('CODE TUTOR');
  
  // Calculate points according to SkillRack scoring system
  const totalPoints = calculateTotalPoints({
    codeTutor,
    codeTrack,
    codeTest,
    dailyTest,
    dailyChallenge
  });
  
  return {
    codeTutor,
    codeTrack,
    codeTest,
    dailyTest,
    dailyChallenge,
    totalPoints
  };
}

function calculateTotalPoints(stats) {
  const codeTrackPoints = stats.codeTrack * 2;      // 2 points per Code Track
  const dailyTestPoints = stats.dailyTest * 20;     // 20 points per Daily Test
  const dailyChallengePoints = stats.dailyChallenge * 2; // 2 points per Daily Challenge
  const codeTestPoints = stats.codeTest * 30;       // 30 points per Code Test
  // Code Tutor = 0 points (display only)
  
  return codeTrackPoints + dailyTestPoints + dailyChallengePoints + codeTestPoints;
}

const testUrl = 'http://www.skillrack.com/profile/440943/bf966a469d73bfb792f4d2a72a4762937ba3fc48';

const testRealProfile = async () => {
  try {
    console.log('Testing real SkillRack profile:', testUrl);
    
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });
    
    console.log('✅ Successfully fetched profile data');
    
    const stats = parseProfileStats(response.data);
    
    console.log('\n📊 Parsed Profile Statistics:');
    console.log('================================');
    console.log(`Code Tutor: ${stats.codeTutor} (${stats.codeTutor * 0} points)`);
    console.log(`Code Track: ${stats.codeTrack} (${stats.codeTrack * 2} points)`);
    console.log(`Code Test: ${stats.codeTest} (${stats.codeTest * 30} points)`);
    console.log(`Daily Test: ${stats.dailyTest} (${stats.dailyTest * 20} points)`);
    console.log(`Daily Challenge: ${stats.dailyChallenge} (${stats.dailyChallenge * 2} points)`);
    console.log('================================');
    console.log(`🎯 Total Points: ${stats.totalPoints}`);
    
    // Verify calculation manually
    const manualTotal = (stats.codeTrack * 2) + (stats.dailyTest * 20) + (stats.dailyChallenge * 2) + (stats.codeTest * 30);
    console.log(`✅ Manual verification: ${manualTotal} (${manualTotal === stats.totalPoints ? 'MATCH' : 'MISMATCH'})`);
    
  } catch (error) {
    console.error('❌ Error testing profile:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
};

testRealProfile();