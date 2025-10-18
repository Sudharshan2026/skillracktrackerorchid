import { useState, useCallback } from 'react';
import type { SkillRackProfile, GoalCalculation, ApiResponse } from './types';
import { HomePage, ResultsPage, TempUserPage } from './components';
import { useNavigation } from './hooks/useNavigation';
import './App.css';

/**
 * Main App component with routing and state management
 * Implements requirements 3.1, 3.2, 3.3, 3.4, 8.1, 8.2, 8.6 for stateless design and navigation
 */
function App() {
  // Check if demo mode is enabled via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isDemoMode = urlParams.get('demo') === 'true';

  // Navigation state and actions
  const navigation = useNavigation();

  // Application state - Requirement 3.2: No data persistence
  const [profileData, setProfileData] = useState<SkillRackProfile | null>(null);
  const [goalResults, setGoalResults] = useState<GoalCalculation | null>(null);

  /**
   * API integration for profile parsing
   * Requirement 3.1: No user registration required
   * Requirement 3.4: Independent sessions with no data sharing
   */
  const handleProfileSubmit = useCallback(async (url: string) => {
    navigation.setLoading(true);
    navigation.clearError();
    setProfileData(null);
    setGoalResults(null); // Clear previous goal calculations

    try {
      const response = await fetch('/api/parse-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setProfileData(data.data);
        // Navigate to results page with the profile data - Requirement 8.2
        navigation.navigateToResults(url, data.data);
      } else {
        navigation.setError(data);
      }
    } catch (err) {
      console.error('Profile parsing error:', err);
      
      // Create structured error response for better error handling
      const errorResponse: ApiResponse = {
        success: false,
        error: err instanceof Error 
          ? `Network error: ${err.message}` 
          : 'Failed to fetch profile data. Please check your connection and try again.',
        code: 'NETWORK_ERROR'
      };
      
      navigation.setError(errorResponse);
    } finally {
      navigation.setLoading(false);
    }
  }, [navigation]);

  /**
   * Goal calculation handler
   * Implements stateless calculation without data persistence
   */
  const handleGoalCalculate = useCallback((targetPoints: number, timelineDays: number) => {
    if (!profileData) {
      navigation.setError('Please load your profile data first');
      return;
    }

    const currentPoints = profileData.stats.totalPoints;
    const requiredPoints = Math.max(0, targetPoints - currentPoints);

    // Calculate achievement path suggestions
    const suggestions = [];

    if (requiredPoints === 0) {
      suggestions.push({
        strategy: 'Goal Already Achieved',
        description: 'Congratulations! You have already reached your target points.',
        feasible: true,
      });
    } else {
      // Code Tracks only (2 points each)
      const codeTracksNeeded = Math.ceil(requiredPoints / 2);
      const codeTracksPerDay = Math.ceil(codeTracksNeeded / timelineDays);
      suggestions.push({
        strategy: 'Code Tracks Only',
        description: `Solve ${codeTracksNeeded} Code Track problems`,
        dailyRequirement: `${codeTracksPerDay} Code Tracks per day`,
        feasible: codeTracksPerDay <= 10, // Reasonable daily limit
      });

      // Daily Tests only (20 points each, max 1/day)
      const dailyTestsNeeded = Math.ceil(requiredPoints / 20);
      suggestions.push({
        strategy: 'Daily Tests Only',
        description: `Complete ${dailyTestsNeeded} Daily Tests`,
        dailyRequirement: '1 Daily Test per day',
        feasible: dailyTestsNeeded <= timelineDays,
      });

      // Mixed strategy
      const dailyTestDays = Math.min(timelineDays, Math.ceil(requiredPoints / 20));
      const remainingPoints = Math.max(0, requiredPoints - (dailyTestDays * 20));
      const additionalCodeTracks = Math.ceil(remainingPoints / 2);
      
      if (dailyTestDays > 0 && additionalCodeTracks > 0) {
        suggestions.push({
          strategy: 'Mixed Strategy',
          description: `${dailyTestDays} Daily Tests + ${additionalCodeTracks} Code Tracks`,
          dailyRequirement: `1 Daily Test + ${Math.ceil(additionalCodeTracks / timelineDays)} Code Tracks per day`,
          feasible: Math.ceil(additionalCodeTracks / timelineDays) <= 5,
        });
      }
    }

    const calculation: GoalCalculation = {
      targetPoints,
      currentPoints,
      timelineDays,
      requiredPoints,
      suggestions,
    };

    setGoalResults(calculation);
  }, [profileData, navigation]);

  /**
   * Reset application state and navigate to home - Requirement 3.3: Clean state on refresh
   */
  const handleReset = useCallback(() => {
    setProfileData(null);
    setGoalResults(null);
    navigation.navigateToHome();
  }, [navigation]);

  // Render demo page if demo mode is enabled
  if (isDemoMode) {
    return (
      <div className="app">
        <TempUserPage />
      </div>
    );
  }

  // Render appropriate page based on navigation state - Requirements 8.1, 8.2, 8.6
  return (
    <div className="app">
      {/* Theme Toggle - Available on all pages */}

      {navigation.currentPage === 'home' && (
        <HomePage
          onAnalyze={handleProfileSubmit}
          loading={navigation.loading}
          error={navigation.error}
          onClearError={navigation.clearError}
          onNetworkStatusChange={() => {}}
        />
      )}

      {navigation.currentPage === 'results' && profileData && navigation.analyzedUrl && (
        <ResultsPage
          profileData={profileData}
          analyzedUrl={navigation.analyzedUrl}
          goalResults={goalResults}
          onCalculateGoal={handleGoalCalculate}
          onGoHome={handleReset}
        />
      )}
    </div>
  );
}

export default App;
