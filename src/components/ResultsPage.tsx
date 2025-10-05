import { StatsDisplay, GoalCalculator, ResultsDisplay } from './index';
import type { SkillRackProfile, GoalCalculation } from '../types';
import './ResultsPage.css';
import ResultsHeader from './ResultsHeader';

/**
 * Props for the ResultsPage component
 */
export interface ResultsPageProps {
  /** Parsed profile data to display */
  profileData: SkillRackProfile;
  
  /** The profile URL that was analyzed */
  analyzedUrl: string;
  
  /** Goal calculation results (if any) */
  goalResults: GoalCalculation | null;
  
  /** Callback function when goal calculation is requested */
  onCalculateGoal: (targetPoints: number, timelineDays: number) => void;
  
  /** Callback to navigate back to home page */
  onGoHome: () => void;
}

/**
 * ResultsPage component - Dedicated page for displaying profile analysis results
 * Implements requirements 8.2, 8.3, 8.4, 8.5, 4.2, 4.3
 */
export function ResultsPage({ 
  profileData, 
  analyzedUrl, 
  goalResults,
  onCalculateGoal,
  onGoHome 
}: ResultsPageProps) {
  return (
    <div className="results-page">
      {/* <header className="results-header"> */}

        
        {/* Display analyzed URL - Requirement 8.4 */}
        {/* <div className="analyzed-url-section">
          <label className="url-label">SkillRack Profile URL:</label>
          <div className="url-display">
            <a 
              href={analyzedUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="profile-link"
            >
              {analyzedUrl}
            </a>
          </div>
        </div> */}
      {/* </header> */}

      {/* Centered section links header */}
      <ResultsHeader analyzedUrl={analyzedUrl} onGoHome={onGoHome} showPlan={!!goalResults} />

      <main className="results-main-direct">
        {/* Profile Statistics */}
        <div id="stats" className="subsection-direct">
          <h3 className="subsection-title">Profile Statistics</h3>
          <StatsDisplay profileData={profileData} />
        </div>

        {/* Goal Planning */}
        <div id="goals" className="subsection-direct">
          <h3 className="subsection-title">Goal Planning</h3>
          <GoalCalculator 
            currentPoints={profileData.stats.totalPoints}
            onCalculate={onCalculateGoal}
          />
        </div>

        {/* Results Display */}
        {goalResults && (
          <div id="plan" className="subsection-direct">
            <h3 className="subsection-title">Achievement Plan</h3>
            <ResultsDisplay goalResults={goalResults} />
          </div>
        )}
      </main>

      <footer className="results-footer">
        <div className="footer-content">
          <p>
            Analysis completed. No data has been stored.
          </p>
          <button 
            onClick={onGoHome}
            className="footer-home-button"
            type="button"
          >
            Start New Analysis
          </button>
        </div>
      </footer>
    </div>
  );
}