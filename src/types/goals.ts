/**
 * Interface for achievement path suggestions in goal planning
 */
export interface AchievementPath {
  /** Strategy name (e.g., "Code Tracks Only", "Daily Tests Only", "Mixed Strategy") */
  strategy: string;
  
  /** Human-readable description of the achievement path */
  description: string;
  
  /** Optional daily requirement breakdown */
  dailyRequirement?: string;
  
  /** Whether this path is feasible given the timeline constraints */
  feasible: boolean;
}

/**
 * Interface for goal calculation results and achievement planning
 */
export interface GoalCalculation {
  /** User's target points goal */
  targetPoints: number;
  
  /** Current points from profile */
  currentPoints: number;
  
  /** Timeline in days to achieve the goal */
  timelineDays: number;
  
  /** Additional points needed to reach the target */
  requiredPoints: number;
  
  /** Array of suggested achievement paths */
  suggestions: AchievementPath[];
}