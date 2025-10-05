import React from 'react';
import type { ResultsDisplayProps, AchievementPath } from '../types';
import './ResultsDisplay.css';

/**
 * ResultsDisplay component for showing goal calculation results
 * Implements requirements 2.2, 2.3, 2.4
 */
const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ goalResults }) => {
  const { targetPoints, currentPoints, timelineDays, requiredPoints, suggestions } = goalResults;

  /**
   * Check if goal is already achieved
   * Requirement 2.4: Show congratulatory message when goal is already achieved
   */
  const isGoalAchieved = currentPoints >= targetPoints;

  /**
   * Format numbers for display
   */
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  /**
   * Get icon for achievement path strategy
   */
  const getStrategyIcon = (strategy: string): string => {
    if (strategy.includes('Code Track')) return '🏃';
    if (strategy.includes('Daily Test')) return '📅';
    if (strategy.includes('Code Test')) return '📝';
    if (strategy.includes('Daily Challenge')) return '⚡';
    if (strategy.includes('Mixed')) return '🎯';
    return '📊';
  };

  /**
   * Get feasibility badge styling
   */
  const getFeasibilityClass = (feasible: boolean): string => {
    return feasible ? 'feasible' : 'challenging';
  };

  /**
   * Calculate timeline information
   */
  const getTimelineInfo = () => {
    const weeks = Math.floor(timelineDays / 7);
    const remainingDays = timelineDays % 7;
    
    if (weeks === 0) {
      return `${timelineDays} day${timelineDays === 1 ? '' : 's'}`;
    } else if (remainingDays === 0) {
      return `${weeks} week${weeks === 1 ? '' : 's'}`;
    } else {
      return `${weeks} week${weeks === 1 ? '' : 's'} and ${remainingDays} day${remainingDays === 1 ? '' : 's'}`;
    }
  };

  // If goal is already achieved, show congratulatory message
  if (isGoalAchieved) {
    return (
      <div className="results-display">
        <div className="congratulations-card">
          <div className="congrats-icon">🎉</div>
          <h2 className="congrats-title">Congratulations!</h2>
          <p className="congrats-message">
            You've already achieved your goal! Your current score of{' '}
            <strong>{formatNumber(currentPoints)} points</strong> exceeds your target of{' '}
            <strong>{formatNumber(targetPoints)} points</strong>.
          </p>
          <div className="congrats-stats">
            <div className="congrats-stat">
              <span className="stat-label">Current Points:</span>
              <span className="stat-value">{formatNumber(currentPoints)}</span>
            </div>
            <div className="congrats-stat">
              <span className="stat-label">Target Points:</span>
              <span className="stat-value">{formatNumber(targetPoints)}</span>
            </div>
            <div className="congrats-stat">
              <span className="stat-label">Exceeded by:</span>
              <span className="stat-value highlight">{formatNumber(currentPoints - targetPoints)}</span>
            </div>
          </div>
          <p className="next-goal-suggestion">
            Ready for a new challenge? Set a higher target to keep improving!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-display">
      {/* Goal Summary */}
      <div className="goal-summary">
        <h2 className="results-title">Your Achievement Plan</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Target</span>
            <span className="summary-value">{formatNumber(targetPoints)} points</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Current</span>
            <span className="summary-value">{formatNumber(currentPoints)} points</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Required</span>
            <span className="summary-value highlight">{formatNumber(requiredPoints)} points</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Timeline</span>
            <span className="summary-value">{getTimelineInfo()}</span>
          </div>
        </div>
      </div>

      {/* Achievement Paths */}
      <div className="achievement-paths">
        <h3 className="paths-title">Achievement Path Options</h3>
        <p className="paths-subtitle">
          Choose the strategy that works best for your schedule and preferences:
        </p>
        
        <div className="paths-grid">
          {suggestions.map((path: AchievementPath, index: number) => (
            <div 
              key={index} 
              className={`path-card ${getFeasibilityClass(path.feasible)}`}
            >
              <div className="path-header">
                <div className="path-icon">{getStrategyIcon(path.strategy)}</div>
                <div className="path-title-section">
                  <h4 className="path-title">{path.strategy}</h4>
                  <div className={`feasibility-badge ${getFeasibilityClass(path.feasible)}`}>
                    {path.feasible ? 'Recommended' : 'Challenging'}
                  </div>
                </div>
              </div>
              
              <div className="path-content">
                <p className="path-description">{path.description}</p>
                
                {path.dailyRequirement && (
                  <div className="daily-requirement">
                    <strong>Daily Goal:</strong> {path.dailyRequirement}
                  </div>
                )}
                
                {!path.feasible && (
                  <div className="feasibility-warning">
                    <span className="warning-icon">⚠️</span>
                    This path may be challenging to maintain consistently. Consider extending your timeline or choosing a mixed strategy.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Limits Information */}
      <div className="limits-info">
        <h4 className="limits-title">Important Limits to Remember</h4>
        <div className="limits-grid">
          <div className="limit-item">
            <span className="limit-icon">📅</span>
            <div className="limit-content">
              <strong>Daily Tests:</strong> Maximum 1 per day (20 points each)
            </div>
          </div>
          <div className="limit-item">
            <span className="limit-icon">⚡</span>
            <div className="limit-content">
              <strong>Daily Challenges:</strong> Maximum 1 per day (2 points each)
            </div>
          </div>
          <div className="limit-item">
            <span className="limit-icon">🏃</span>
            <div className="limit-content">
              <strong>Code Tracks:</strong> No daily limit (2 points each)
            </div>
          </div>
          <div className="limit-item">
            <span className="limit-icon">📝</span>
            <div className="limit-content">
              <strong>Code Tests:</strong> No daily limit (30 points each)
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracking Tips */}
      <div className="tips-section">
        <h4 className="tips-title">Tips for Success</h4>
        <ul className="tips-list">
          <li>Start with easier Code Track problems to build momentum</li>
          <li>Don't miss Daily Tests - they provide the highest points per problem</li>
          <li>Mix different problem types to avoid burnout</li>
          <li>Track your daily progress to stay motivated</li>
          <li>Adjust your plan if you fall behind - consistency is key</li>
        </ul>
      </div>
    </div>
  );
};

export default ResultsDisplay;