import React from 'react';
import type { ApiErrorResponse, ApiResponse } from '../types';
import './ErrorDisplay.css';

interface ErrorDisplayProps {
  /** Error information from API or validation */
  error: string | ApiErrorResponse | ApiResponse;
  
  /** Callback for retry functionality */
  onRetry?: () => void;
  
  /** Callback to clear the error */
  onClear?: () => void;
  
  /** Additional context for the error */
  context?: 'profile' | 'goal' | 'validation';
}

/**
 * Enhanced error display component with user-friendly messages and retry functionality
 * Implements requirements 1.4, 2.5, 4.4 for comprehensive error handling
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  onClear, 
  context = 'profile' 
}) => {
  // Parse error information
  const errorInfo = typeof error === 'string' 
    ? { message: error, code: undefined }
    : error.success === false 
      ? { message: error.error, code: error.code }
      : { message: 'Unexpected error format', code: undefined };

  /**
   * Get user-friendly error message and guidance based on error type
   * Requirement 1.4: Clear error messages for different failure scenarios
   */
  const getErrorDetails = () => {
    const { message, code } = errorInfo;

    switch (code) {
      case 'INVALID_URL':
        return {
          title: 'Invalid Profile URL',
          message: 'The URL you entered is not a valid SkillRack profile link.',
          guidance: [
            'Make sure you copied the complete URL from your browser',
            'The URL should look like: https://skillrack.com/profile/123456/abcdef',
            'Ensure you are logged into SkillRack and viewing your profile',
            'Try refreshing your SkillRack profile page and copying the URL again'
          ],
          icon: '⚠️',
          severity: 'warning' as const,
          showRetry: false
        };

      case 'NETWORK_ERROR':
        return {
          title: 'Connection Problem',
          message: 'Unable to connect to SkillRack or fetch your profile data.',
          guidance: [
            'Check your internet connection',
            'SkillRack might be temporarily unavailable',
            'Try again in a few moments',
            'If the problem persists, SkillRack servers might be down'
          ],
          icon: '🌐',
          severity: 'error' as const,
          showRetry: true
        };

      case 'NOT_FOUND':
        return {
          title: 'Profile Not Found',
          message: 'The profile could not be accessed or does not exist.',
          guidance: [
            'Verify that the profile URL is correct',
            'Make sure your SkillRack profile is public',
            'You might need to be logged into SkillRack',
            'Check if the profile link has expired or changed'
          ],
          icon: '🔍',
          severity: 'warning' as const,
          showRetry: true
        };

      case 'PARSE_ERROR':
        return {
          title: 'Profile Parsing Failed',
          message: 'Unable to extract statistics from your SkillRack profile.',
          guidance: [
            'Your profile page might have an unexpected format',
            'SkillRack may have updated their website structure',
            'Try refreshing your profile page and copying the URL again',
            'Contact support if this problem continues'
          ],
          icon: '🔧',
          severity: 'error' as const,
          showRetry: true
        };

      default:
        // Handle validation errors and generic errors
        if (context === 'validation') {
          return {
            title: 'Input Error',
            message: message,
            guidance: [
              'Please check your input and try again',
              'Make sure all required fields are filled correctly'
            ],
            icon: '📝',
            severity: 'warning' as const,
            showRetry: false
          };
        }

        if (context === 'goal') {
          return {
            title: 'Goal Calculation Error',
            message: message,
            guidance: [
              'Check that your target points and timeline are valid',
              'Target points should be higher than your current points',
              'Timeline should be a reasonable number of days'
            ],
            icon: '🎯',
            severity: 'warning' as const,
            showRetry: false
          };
        }

        return {
          title: 'Something Went Wrong',
          message: message || 'An unexpected error occurred.',
          guidance: [
            'Please try again',
            'If the problem persists, try refreshing the page',
            'Check your internet connection'
          ],
          icon: '❌',
          severity: 'error' as const,
          showRetry: true
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className={`error-display ${errorDetails.severity}`} role="alert">
      <div className="error-header">
        <span className="error-icon" aria-hidden="true">
          {errorDetails.icon}
        </span>
        <div className="error-title-section">
          <h3 className="error-title">{errorDetails.title}</h3>
          <p className="error-message">{errorDetails.message}</p>
        </div>
        {onClear && (
          <button 
            className="error-close"
            onClick={onClear}
            aria-label="Close error message"
            type="button"
          >
            ×
          </button>
        )}
      </div>

      {errorDetails.guidance.length > 0 && (
        <div className="error-guidance">
          <h4 className="guidance-title">What you can try:</h4>
          <ul className="guidance-list">
            {errorDetails.guidance.map((tip, index) => (
              <li key={index} className="guidance-item">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="error-actions">
        {errorDetails.showRetry && onRetry && (
          <button 
            className="retry-button"
            onClick={onRetry}
            type="button"
          >
            🔄 Try Again
          </button>
        )}
        
        {context === 'profile' && (
          <button 
            className="help-button"
            onClick={() => {
              // Scroll to instructions
              const instructions = document.querySelector('.instructions');
              if (instructions) {
                instructions.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            type="button"
          >
            📖 View Instructions
          </button>
        )}
        
        <button 
          className="contact-button"
          onClick={() => {
            // Open a new tab with a pre-filled issue report
            const issueBody = encodeURIComponent(
              `Error Details:\n` +
              `- Title: ${errorDetails.title}\n` +
              `- Message: ${errorDetails.message}\n` +
              `- Code: ${errorInfo.code || 'N/A'}\n` +
              `- Context: ${context}\n\n` +
              `Please describe what you were trying to do when this error occurred:`
            );
            window.open(
              `https://github.com/your-repo/skillrack-tracker/issues/new?title=Error%20Report&body=${issueBody}`,
              '_blank'
            );
          }}
          type="button"
        >
          🐛 Report Issue
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;