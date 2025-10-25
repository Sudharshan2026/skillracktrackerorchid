/**
 * Copyright (c) 2025 Sudharshan2026
 * Licensed under the MIT License
 */

import React, { useState } from 'react';
import { AlertCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import './ReportForm.css';

/**
 * Props for the ReportForm component
 */
export interface ReportFormProps {
  /** Variant of the trigger button */
  variant?: 'button' | 'link' | 'icon';
  /** Custom label for the trigger */
  triggerLabel?: string;
}

/**
 * ReportForm component - Allows users to report problems or send feedback
 */
export function ReportForm({ variant = 'button', triggerLabel = 'Report a Problem' }: ReportFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit report');
      }

      setSubmitStatus('success');
      
      // Reset form
      setFormData({ name: '', email: '', message: '' });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const TriggerButton = () => {
    if (variant === 'link') {
      return (
        <button 
          type="button" 
          className="report-trigger-link"
          onClick={() => setIsOpen(true)}
        >
          {triggerLabel}
        </button>
      );
    }
    
    if (variant === 'icon') {
      return (
        <button 
          type="button" 
          className="report-trigger-icon"
          onClick={() => setIsOpen(true)}
          aria-label="Report a problem"
        >
          <AlertCircle size={20} />
        </button>
      );
    }

    return (
      <Button 
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="report-trigger-button"
      >
        <AlertCircle size={16} className="mr-2" />
        {triggerLabel}
      </Button>
    );
  };

  return (
    <>
      <TriggerButton />

      {isOpen && (
        <div className="report-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <h2 className="report-modal-title">
                <AlertCircle size={24} className="mr-2" />
                Report a Problem
              </h2>
              <button 
                className="report-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="report-form">
              <div className="report-form-description">
                <p>Encountered an issue? We're here to help! Please describe the problem you're facing.</p>
              </div>

              <div className="report-form-group">
                <label htmlFor="report-name" className="report-form-label">
                  Your Name
                </label>
                <input
                  type="text"
                  id="report-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="report-form-input"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="report-form-group">
                <label htmlFor="report-email" className="report-form-label">
                  Your Email
                </label>
                <input
                  type="email"
                  id="report-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="report-form-input"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="report-form-group">
                <label htmlFor="report-message" className="report-form-label">
                  Problem Description
                </label>
                <textarea
                  id="report-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="report-form-textarea"
                  placeholder="Please describe the problem you encountered in detail..."
                  rows={5}
                  required
                />
              </div>

              {submitStatus === 'success' && (
                <div className="report-success-message">
                  <span>✓</span>
                  <span>Thank you! Your report has been submitted successfully.</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="report-error-message">
                  <AlertCircle size={16} />
                  <span>Failed to submit report. Please try again.</span>
                </div>
              )}

              <div className="report-form-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || submitStatus === 'success'}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ReportForm;

