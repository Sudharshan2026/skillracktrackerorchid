import React from 'react';
import './ValidationError.css';

interface ValidationErrorProps {
  /** Error message to display */
  message: string;
  
  /** Field name for accessibility */
  fieldName?: string;
  
  /** Additional CSS class */
  className?: string;
  
  /** Show error with icon */
  showIcon?: boolean;
}

/**
 * Validation error component for form inputs
 * Implements requirement 2.5: Show validation errors for invalid inputs
 */
const ValidationError: React.FC<ValidationErrorProps> = ({ 
  message, 
  fieldName, 
  className = '', 
  showIcon = true 
}) => {
  const errorId = fieldName ? `${fieldName}-error` : undefined;

  return (
    <div 
      className={`validation-error ${className}`}
      role="alert"
      id={errorId}
      aria-live="polite"
    >
      {showIcon && (
        <span className="validation-error-icon" aria-hidden="true">
          ⚠️
        </span>
      )}
      <span className="validation-error-message">
        {message}
      </span>
    </div>
  );
};

export default ValidationError;