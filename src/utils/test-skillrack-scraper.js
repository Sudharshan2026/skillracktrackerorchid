// Test script for SkillRack client-side scraper
import { parseSkillRackProfile } from './skillrack-scraper';

const skillrackUrl = 'https://www.skillrack.com/profile/440943/bf966a469d73bfb792f4d2a72a4762937ba3fc48';
const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(skillrackUrl);

async function testScraper() {
  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error('Failed to fetch profile HTML');
    const html = await res.text();
    const profile = parseSkillRackProfile(html);
    console.log('Parsed profile:', profile);
    // Optionally, display profile fields for manual verification
    document.body.innerHTML = `<pre>${JSON.stringify(profile, null, 2)}</pre>`;
  } catch (err) {
    console.error('Scraper test failed:', err);
    document.body.innerHTML = `<pre>Scraper test failed: ${err}</pre>`;
  }
}

testScraper();
