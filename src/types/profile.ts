/**
 * Interface representing SkillRack profile statistics
 * Based on requirements 6.1-6.6 for accurate point calculations
 */
export interface ProfileStats {
  /** Count of Code Tutor problems (0 points each) - Requirement 6.2 */
  codeTutor: number;
  
  /** Count of Code Track problems (2 points each) - Requirement 6.1 */
  codeTrack: number;
  
  /** Count of Code Tests (30 points each) - Requirement 6.5 */
  codeTest: number;
  
  /** Count of Daily Tests (20 points each, max 1/day) - Requirement 6.3 */
  dailyTest: number;
  
  /** Count of Daily Challenges (2 points each, max 1/day) - Requirement 6.4 */
  dailyChallenge: number;
  
  /** Student's rank */
  rank: number;
  
  /** Student's level */
  level: number;
  
  /** Gold medal count */
  gold: number;
  
  /** Silver medal count */
  silver: number;
  
  /** Bronze medal count */
  bronze: number;
  
  /** Total programs solved */
  programsSolved: number;
  
  /** Calculated total points from all categories - Requirement 6.6 */
  totalPoints: number;
}

/**
 * Interface representing certificate information
 */
export interface Certificate {
  /** Certificate title */
  title: string;
  
  /** Certificate date */
  date: string;
  
  /** Certificate verification link */
  link: string;
}

/**
 * Interface representing complete SkillRack profile data
 */
export interface SkillRackProfile {
  /** Profile image URL */
  profileImage?: string;
  
  /** Student name */
  name: string;
  
  /** Student ID (e.g., SEC23AD073) */
  id: string;
  
  /** Department/Course */
  department: string;
  
  /** College name */
  college: string;
  
  /** Academic year */
  year: string;
  
  /** Student gender */
  gender: string;
  
  /** Programming statistics */
  stats: ProfileStats;
  
  /** Programming languages with problem counts */
  languages: Record<string, number>;
  
  /** List of certificates */
  certificates: Certificate[];
}