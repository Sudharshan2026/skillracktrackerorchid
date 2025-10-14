// SkillRack profile scraper for client-side use
// Usage: Pass HTML string from CORS proxy fetch to parseSkillRackProfile(html)

export interface ProfileStats {
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

export interface Certificate {
  title: string;
  date: string;
  link: string;
}

export interface SkillRackProfile {
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

// Calculate total points based on SkillRack scoring
function calculateTotalPoints(stats: Omit<ProfileStats, 'totalPoints'>): number {
  const codeTrackPoints = stats.codeTrack * 2;
  const dailyTestPoints = stats.dailyTest * 20;
  const dailyChallengePoints = stats.dailyChallenge * 2;
  const codeTestPoints = stats.codeTest * 30;
  return codeTrackPoints + dailyTestPoints + dailyChallengePoints + codeTestPoints;
}

// Parse SkillRack profile HTML using DOMParser (browser)
export function parseSkillRackProfile(html: string): SkillRackProfile {
  const doc = new window.DOMParser().parseFromString(html, 'text/html');

  // Extract profile image
  const profileImage = doc.querySelector('#j_id_s')?.getAttribute('src') || undefined;

  // Extract name
  const name = doc.querySelector('.ui.big.label.black')?.textContent?.trim() || '';

  // Extract ID
  const idElement = doc.querySelector('.ui.four.wide.center.aligned.column')?.textContent || '';
  const idMatch = idElement.match(/([A-Z]{3}\d{2}[A-Z]{2}\d{3})/);
  const id = idMatch ? idMatch[1] : '';

  // Extract department
  const department = doc.querySelector('.ui.large.label')?.textContent?.trim() || '';

  // Extract college and year
  const collegeYearText = idElement;
  const collegeRegex = new RegExp(department + '\\s*\\n\\s*(.+?)\\s*\\n\\s*\\(');
  const collegeMatch = collegeYearText.match(collegeRegex);
  const college = collegeMatch ? collegeMatch[1].trim() : '';
  const yearMatch = collegeYearText.match(/\(([^)]+)\s+(\d{4})\)/);
  const year = yearMatch ? yearMatch[2].trim() : '';

  // Extract gender
  const gender = doc.querySelector('.ui.fourteen.wide.left.aligned.column')?.textContent?.trim() || '';

  // Extract values by label matching from .statistic elements
  function extractStatValue(labelText: string): number {
    const stats = Array.from(doc.querySelectorAll('.statistic'));
    for (const el of stats) {
      const label = el.querySelector('.label')?.textContent?.trim();
      if (label === labelText) {
        const valueText = el.querySelector('.value')?.textContent?.replace(/[^\d]/g, '');
        return parseInt(valueText || '0') || 0;
      }
    }
    return 0;
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
    codeTutor: extractStatValue('CODE TUTOR'),
  };
  const totalPoints = calculateTotalPoints(stats);

  // Extract programming languages
  const languages: Record<string, number> = {};
  const languageStats = doc.querySelectorAll('div.ui.six.small.statistics')[1];
  if (languageStats) {
    for (const el of Array.from(languageStats.querySelectorAll('.statistic'))) {
      const label = el.querySelector('.label')?.textContent?.trim();
      const valueText = el.querySelector('.value')?.textContent;
      const value = parseInt((valueText || '').replace(/[^0-9]/g, '')) || 0;
      if (label && value) {
        languages[label] = value;
      }
    }
  }

  // Extract certificates
  const certificates: Certificate[] = [];
  for (const el of Array.from(doc.querySelectorAll('.ui.brown.card'))) {
    const title = el.querySelector('b')?.textContent?.trim() || '';
    let date = '';
    const contentText = el.querySelector('.content')?.textContent || '';
    const dateMatch = contentText.match(/(\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2})/);
    if (dateMatch) {
      date = dateMatch[1];
    }
    const link = el.querySelector('a')?.getAttribute('href') || '';
    certificates.push({ title, date, link });
  }

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
    certificates,
  };
}
