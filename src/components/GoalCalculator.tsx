import React, { useState } from 'react';
import type { GoalCalculatorProps } from '../types';
import ValidationError from './ValidationError';
import './GoalCalculator.css';

/**
 * GoalCalculator component for goal input and achievement path suggestions
 * Implements requirements 2.1, 2.2, 2.3, 2.5
 */
const GoalCalculator: React.FC<GoalCalculatorProps> = ({ currentPoints, onCalculate }) => {
  const [targetPoints, setTargetPoints] = useState<string>('');
  const [timelineDays, setTimelineDays] = useState<string>('');
  const [errors, setErrors] = useState<{ target?: string; timeline?: string }>({});

  /**
   * Validates goal inputs for positive numbers and reasonable ranges
   * Requirement 2.5: Validate goal inputs
   */
  const validateInputs = (): boolean => {
    const newErrors: { target?: string; timeline?: string } = {};
    
    // Validate target points
    const target = parseInt(targetPoints);
    if (!targetPoints || isNaN(target)) {
      newErrors.target = 'Please enter a valid target points number';
    } else if (target <= 0) {
      newErrors.target = 'Target points must be greater than 0';
    } else if (target > 1000000) {
      newErrors.target = 'Target points seems unreasonably high (max: 1,000,000)';
    } else if (target <= currentPoints) {
      newErrors.target = `Target must be higher than your current points (${currentPoints.toLocaleString()})`;
    }

    // Validate timeline
    const timeline = parseInt(timelineDays);
    if (!timelineDays || isNaN(timeline)) {
      newErrors.timeline = 'Please enter a valid number of days';
    } else if (timeline <= 0) {
      newErrors.timeline = 'Timeline must be at least 1 day';
    } else if (timeline > 3650) {
      newErrors.timeline = 'Timeline seems unreasonably long (max: 10 years)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  /**
   * Handles form submission and goal calculation
   * Requirements 2.1, 2.2: Calculate required additional points
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }

    const target = parseInt(targetPoints);
    const timeline = parseInt(timelineDays);
    
    onCalculate(target, timeline);
  };

  /**
   * Handles input changes with validation
   */
  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTargetPoints(value);
    
    // Clear error when user starts typing
    if (errors.target) {
      setErrors(prev => ({ ...prev, target: undefined }));
    }
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimelineDays(value);
    
    // Clear error when user starts typing
    if (errors.timeline) {
      setErrors(prev => ({ ...prev, timeline: undefined }));
    }
  };

  /**
   * Quick preset buttons for common goals
   */
  const handlePreset = (points: number, days: number) => {
    setTargetPoints(points.toString());
    setTimelineDays(days.toString());
    setErrors({});
  };

  return (
    <div className="goal-calculator">
      <h2 className="calculator-title">Set Your Goal</h2>
      
      <div className="current-points-display">
        <span className="current-label">Current Points:</span>
        <span className="current-value">{currentPoints.toLocaleString()}</span>
      </div>

      {/* Quick Presets */}
      <div className="preset-buttons">
        <h3>Quick Goals</h3>
        <div className="preset-grid">
          <button 
            type="button" 
            className="preset-button"
            onClick={() => handlePreset(currentPoints + 1000, 30)}
          >
            +1,000 points
            <span>in 30 days</span>
          </button>
          <button 
            type="button" 
            className="preset-button"
            onClick={() => handlePreset(currentPoints + 2000, 60)}
          >
            +2,000 points
            <span>in 60 days</span>
          </button>
          <button 
            type="button" 
            className="preset-button"
            onClick={() => handlePreset(currentPoints + 5000, 90)}
          >
            +5,000 points
            <span>in 90 days</span>
          </button>
        </div>
      </div>

      {/* Goal Input Form */}
      <form onSubmit={handleSubmit} className="goal-form">
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="target-points" className="input-label">
              Target Points
            </label>
            <input
              id="target-points"
              type="number"
              value={targetPoints}
              onChange={handleTargetChange}
              placeholder={`e.g., ${(currentPoints + 1000).toLocaleString()}`}
              className={`goal-input ${errors.target ? 'error' : ''}`}
              min="1"
              max="1000000"
            />
            {errors.target && (
              <ValidationError 
                message={errors.target}
                fieldName="target-points"
              />
            )}
          </div>

          <div className="input-group">
            <label htmlFor="timeline-days" className="input-label">
              Timeline (Days)
            </label>
            <input
              id="timeline-days"
              type="number"
              value={timelineDays}
              onChange={handleTimelineChange}
              placeholder="e.g., 30"
              className={`goal-input ${errors.timeline ? 'error' : ''}`}
              min="1"
              max="3650"
            />
            {errors.timeline && (
              <ValidationError 
                message={errors.timeline}
                fieldName="timeline-days"
              />
            )}
          </div>
        </div>

        <button 
          type="submit" 
          className="calculate-button"
          disabled={!targetPoints || !timelineDays}
        >
          Calculate Achievement Plan
        </button>
      </form>

      {/* Goal Information */}
      {targetPoints && timelineDays && !errors.target && !errors.timeline && (
        <div className="goal-preview">
          <h4>Goal Preview</h4>
          <div className="preview-stats">
            <div className="preview-item">
              <span className="preview-label">Target:</span>
              <span className="preview-value">{parseInt(targetPoints).toLocaleString()} points</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Timeline:</span>
              <span className="preview-value">{parseInt(timelineDays)} days</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Required:</span>
              <span className="preview-value highlight">
                {(parseInt(targetPoints) - currentPoints).toLocaleString()} additional points
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalCalculator;