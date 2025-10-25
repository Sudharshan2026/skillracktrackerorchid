/**
 * Copyright (c) 2025 Sudharshan2026
 * Licensed under the MIT License
 */

import { ProfileInput, ErrorDisplay, NetworkStatus } from './index';
import { StatsDisplaySkeleton } from './StatsDisplaySkeleton';
import type { ApiResponse } from '../types';
import './HomePage.css';

/**
 * Props for the HomePage component
 */
export interface HomePageProps {
  /** Callback function when profile analysis is requested */
  onAnalyze: (url: string) => void;
  
  /** Loading state during API requests */
  loading: boolean;
  
  /** Error state for display */
  error?: string | ApiResponse | null;
  
  /** Callback to clear error state */
  onClearError: () => void;
  
  /** Callback for network status changes */
  onNetworkStatusChange: (isOnline: boolean) => void;
}

/**
 * HomePage component - Landing page with URL input and instructions
 * Implements requirements 7.1, 7.2, 7.3, 7.4, 7.5, 4.1, 4.7, 8.1
 */
export function HomePage({ 
  onAnalyze, 
  loading, 
  error, 
  onClearError,
  onNetworkStatusChange 
}: HomePageProps) {
  return (
    <div className="home-page">
      {/* Network Status Indicator */}
      <NetworkStatus onStatusChange={onNetworkStatusChange} />
      
      <header className="home-hero">
        <div className="hero-content">
          <h1 className="hero-title">Track Your SkillRack Progress</h1>
          <p className="hero-subtitle">Analyze your profile, understand your stats, and plan goals to level up.</p>
          <a href="#analyze" className="btn btn-primary hero-cta">Get Started</a>
        </div>
        <div className="hero-steps" aria-label="Steps">
          <div className="step active"><span className="step-index">1</span><span className="step-label">Link</span></div>
          <div className="step"><span className="step-index">2</span><span className="step-label">Analyze</span></div>
          <div className="step"><span className="step-index">3</span><span className="step-label">Plan</span></div>
        </div>
      </header>

      <main className="home-main">
        {/* Instructions Section - Progressive Disclosure */}

        {/* Profile Input Section - Requirements 4.1, 4.7, 8.1 */}
        <section id="analyze" className="profile-input-section">
          <ProfileInput 
            onSubmit={onAnalyze} 
            loading={loading} 
          />
          
          {/* Loading skeleton - Better UX during API calls */}
          {loading && <StatsDisplaySkeleton />}
          
          {/* Error Display - Requirement 4.1 */}
          {error && (
            <ErrorDisplay
              error={error}
              onRetry={() => {
                onClearError();
                // Could trigger a retry of the last attempted URL if we stored it
              }}
              onClear={onClearError}
              context="profile"
            />
          )}
        </section>
                <details className="instructions-section" open>
          <summary className="instructions-summary">How to find your SkillRack profile link</summary>
          <div className="instructions-content">
            <ol className="instructions-list">
              <li>Login to your SkillRack account</li>
              <li>Navigate to your Profile page</li>
              <li>Enter your password when prompted</li>
              <li>Click the 'View' button to access your profile</li>
              <li>Copy the URL from your browser's address bar</li>
              <li>Paste the URL in the field below</li>
            </ol>
            <p className="instructions-note">
              <strong>Note:</strong> Make sure you're on your actual profile page, not just the login page.
            </p>
          </div>
        </details>
        {/* Features Section */}
        <section className="features-section">
          <h2>What You'll Get</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📊 Profile Statistics</h3>
              <p>View your complete SkillRack statistics with point calculations</p>
            </div>
            <div className="feature-card">
              <h3>🎯 Goal Planning</h3>
              <p>Set target points and get personalized achievement strategies</p>
            </div>
            <div className="feature-card">
              <h3>🔒 Privacy First</h3>
              <p>No data is stored - everything happens in your browser</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>
          SkillRack Tracker - No data is stored or shared. Your privacy is protected.
        </p>
      </footer>
    </div>
  );
}