import type { GoalCalculation, SkillRackProfile } from './index';

/**
 * Props for the ProfileInput component
 */
export interface ProfileInputProps {
  /** Callback function when URL is submitted */
  onSubmit: (url: string) => void;
  
  /** Loading state during API requests */
  loading: boolean;
}

/**
 * Props for the StatsDisplay component
 */
export interface StatsDisplayProps {
  /** Parsed profile data to display */
  profileData: SkillRackProfile;
}

/**
 * Props for the GoalCalculator component
 */
export interface GoalCalculatorProps {
  /** Current points from the user's profile */
  currentPoints: number;
  
  /** Callback function when goal calculation is requested */
  onCalculate: (targetPoints: number, timelineDays: number) => void;
}

/**
 * Props for the ResultsDisplay component
 */
export interface ResultsDisplayProps {
  /** Goal calculation results to display */
  goalResults: GoalCalculation;
}