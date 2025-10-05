import React, { useState } from 'react';
import type { ProfileInputProps } from '../types';
import ValidationError from './ValidationError';
import { preprocessUrl, validateSkillRackUrl, getPreprocessingFeedback } from '../utils/urlPreprocessing';
import './ProfileInput.css';

/**
 * ProfileInput component for URL input and instructions display
 * Implements requirements 7.1-7.5 and 4.1, 4.4
 */
const ProfileInput: React.FC<ProfileInputProps> = ({ onSubmit, loading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [preprocessingFeedback, setPreprocessingFeedback] = useState<string | null>(null);

  /**
   * Validates SkillRack profile URL format using the utility function
   * Requirement 7.1: Display validation errors for invalid inputs
   */
  const validateUrl = (inputUrl: string): boolean => {
    return validateSkillRackUrl(inputUrl);
  };

  /**
   * Handles form submission with URL preprocessing and validation
   * Requirements 7.4, 4.1, 4.7: Handle form submission, validation errors, and URL preprocessing
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter your SkillRack profile URL');
      return;
    }

    // Preprocess the URL to clean whitespace and normalize format
    const preprocessingResult = preprocessUrl(url);
    const { cleanedUrl, wasModified } = preprocessingResult;
    
    // Validate the cleaned URL first
    if (!validateUrl(cleanedUrl)) {
      setError('Please enter a valid SkillRack profile URL (e.g., https://www.skillrack.com/profile/123456/abcdef)');
      return;
    }

    // Show user feedback if URL was modified
    if (wasModified) {
      const feedback = getPreprocessingFeedback(preprocessingResult);
      setPreprocessingFeedback(feedback);
      // Update the input field with the cleaned URL
      setUrl(cleanedUrl);
    } else {
      setPreprocessingFeedback(null);
    }

    setError('');
    // Submit the cleaned URL
    onSubmit(cleanedUrl);
  };

  /**
   * Handles URL input changes with real-time validation
   */
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    // Clear error and preprocessing feedback when user starts typing
    if (error) {
      setError('');
    }
    if (preprocessingFeedback) {
      setPreprocessingFeedback(null);
    }
  };

  return (
    <div className="profile-input">
      {/* Step-by-step instructions - Requirements 7.1, 7.2, 7.3 */}

      {/* URL input form - Requirements 4.1, 7.4 */}
      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-group">
          <label htmlFor="profile-url" className="input-label">
            SkillRack Profile URL:
          </label>
          <input
            id="profile-url"
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://www.skillrack.com/profile/123456/abcdef"
            className={`url-input ${error ? 'error' : ''}`}
            disabled={loading}
            required
            autoComplete="url"
            inputMode="url"
          />
          
          {/* Loading state - Requirement 7.4 */}
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || !url.trim()}
          >
            {loading ? 'Analyzing Profile...' : 'Analyze Profile'}
          </button>
        </div>

        {/* Enhanced validation error display - Requirements 4.4, 2.5 */}
        {error && (
          <ValidationError 
            message={error}
            fieldName="profile-url"
          />
        )}

        {/* URL preprocessing feedback - Requirement 4.7 */}
        {preprocessingFeedback && (
          <div className="preprocessing-feedback">
            <div className="feedback-icon">ℹ️</div>
            <span className="feedback-message">{preprocessingFeedback}</span>
          </div>
        )}

        {/* Enhanced loading indicator - Requirement 7.4 */}
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <div className="loading-content">
              <span className="loading-message">Fetching your SkillRack profile data...</span>
              <span className="loading-submessage">This may take a few seconds</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileInput;