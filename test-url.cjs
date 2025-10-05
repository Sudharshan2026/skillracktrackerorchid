const axios = require('axios');

const testUrl = 'http://www.skillrack.com/profile/440943/bf966a469d73bfb792f4d2a72a4762937ba3fc48';

console.log('Testing URL:', testUrl);

// Test the API endpoint locally
const testApiCall = async () => {
  try {
    // First, let's just fetch the HTML to see what we get
    console.log('Fetching profile HTML...');
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers['content-type']);
    console.log('HTML length:', response.data.length);
    
    // Look for statistics in the HTML
    const html = response.data;
    const statisticMatches = html.match(/<div class="statistic">/g);
    console.log('Found statistic elements:', statisticMatches ? statisticMatches.length : 0);
    
    // Look for specific labels
    const labels = ['CODE TEST', 'CODE TRACK', 'DC', 'DT', 'CODE TUTOR'];
    labels.forEach(label => {
      const found = html.includes(label);
      console.log(`Found "${label}":`, found);
    });
    
    // Try to extract some sample values
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    
    console.log('\nExtracting values:');
    $('.statistic').each((i, element) => {
      const label = $(element).find('.label').text().trim();
      const value = $(element).find('.value').text().trim();
      if (label && value) {
        console.log(`${label}: ${value}`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
};

testApiCall();