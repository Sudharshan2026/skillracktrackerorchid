import React from 'react';
import { render, screen } from '@testing-library/react';
import ResultsDisplay from '../../src/components/ResultsDisplay';
import type { GoalCalculation, AchievementPath } from '../../src/types';

describe('ResultsDisplay Component', () => {
  const mockAchievementPaths: AchievementPath[] = [
    {
      strategy: 'Code Tracks Only',
      description: 'Focus on solving Code Track problems exclusively',
      dailyRequirement: 'Solve 5 Code Track problems per day',
      feasible: true
    },
    {
      strategy: 'Daily Tests Only',
      description: 'Complete Daily Tests consistently',
      dailyRequirement: 'Complete 1 Daily Test per day',
      feasible: false
    },
    {
      strategy: 'Mixed Strategy',
      description: 'Combine different problem types for balanced progress',
      dailyRequirement: '2 Code Tracks + 1 Daily Test every 2 days',
      feasible: true
    }
  ];

  const mockGoalResults: GoalCalculation = {
    targetPoints: 3000,
    currentPoints: 1000,
    timelineDays: 60,
    requiredPoints: 2000,
    suggestions: mockAchievementPaths
  };

  const achievedGoalResults: GoalCalculation = {
    targetPoints: 1000,
    currentPoints: 1500,
    timelineDays: 30,
    requiredPoints: 0,
    suggestions: []
  };

  describe('Goal Achievement Scenarios', () => {
    test('should show congratulations when goal is already achieved', () => {
      render(<ResultsDisplay goalResults={achievedGoalResults} />);
      
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      expect(screen.getByText('🎉')).toBeInTheDocument();
      expect(screen.getByText(/You've already achieved your goal!/)).toBeInTheDocument();
      expect(screen.getByText('1,500 points')).toBeInTheDocument();
      expect(screen.getByText('1,000 points')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument(); // Exceeded by
    });

    test('should show achievement plan when goal is not yet achieved', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      expect(screen.getByText('Your Achievement Plan')).toBeInTheDocument();
      expect(screen.queryByText('Congratulations!')).not.toBeInTheDocument();
    });

    test('should display correct exceeded amount in congratulations', () => {
      const customAchievedGoal: GoalCalculation = {
        targetPoints: 2000,
        currentPoints: 2750,
        timelineDays: 30,
        requiredPoints: 0,
        suggestions: []
      };
      
      render(<ResultsDisplay goalResults={customAchievedGoal} />);
      
      expect(screen.getByText('750')).toBeInTheDocument(); // 2750 - 2000
    });
  });

  describe('Goal Summary Display', () => {
    test('should display goal summary with correct values', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      expect(screen.getByText('3,000 points')).toBeInTheDocument(); // Target
      expect(screen.getByText('1,000 points')).toBeInTheDocument(); // Current
      expect(screen.getByText('2,000 points')).toBeInTheDocument(); // Required
    });

    test('should format large numbers with commas', () => {
      const largeNumberGoal: GoalCalculation = {
        targetPoints: 50000,
        currentPoints: 25000,
        timelineDays: 90,
        requiredPoints: 25000,
        suggestions: mockAchievementPaths
      };
      
      render(<ResultsDisplay goalResults={largeNumberGoal} />);
      
      expect(screen.getByText('50,000 points')).toBeInTheDocument();
      expect(screen.getByText('25,000 points')).toBeInTheDocument();
    });

    test('should display timeline information correctly', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      expect(screen.getByText('8 weeks and 4 days')).toBeInTheDocument(); // 60 days
    });

    test('should handle different timeline formats', () => {
      // Test exact weeks
      const weekGoal = { ...mockGoalResults, timelineDays: 14 };
      const { rerender } = render(<ResultsDisplay goalResults={weekGoal} />);
      expect(screen.getByText('2 weeks')).toBeInTheDocument();
      
      // Test single week
      rerender(<ResultsDisplay goalResults={{ ...mockGoalResults, timelineDays: 7 }} />);
      expect(screen.getByText('1 week')).toBeInTheDocument();
      
      // Test days only
      rerender(<ResultsDisplay goalResults={{ ...mockGoalResults, timelineDays: 5 }} />);
      expect(screen.getByText('5 days')).toBeInTheDocument();
      
      // Test single day
      rerender(<ResultsDisplay goalResults={{ ...mockGoalResults, timelineDays: 1 }} />);
      expect(screen.getByText('1 day')).toBeInTheDocument();
    });
  });

  describe('Achievement Paths Display', () => {
    test('should display all achievement path suggestions', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      expect(screen.getByText('Achievement Path Options')).toBeInTheDocument();
      expect(screen.getByText('Code Tracks Only')).toBeInTheDocument();
      expect(screen.getByText('Daily Tests Only')).toBeInTheDocument();
      expect(screen.getByText('Mixed Strategy')).toBeInTheDocument();
    });

    test('should show correct strategy icons', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      expect(screen.getByText('🏃')).toBeInTheDocument(); // Code Track
      expect(screen.getByText('📅')).toBeInTheDocument(); // Daily Test
      expect(screen.getByText('🎯')).toBeInTheDocument(); // Mixed
    });

    test('should display strategy descriptions', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      expect(screen.getByText('Focus on solving Code Track problems exclusively')).toBeInTheDocument();
      expect(screen.getByText('Complete Daily Tests consistently')).toBeInTheDocument();
      expect(screen.getByText('Combine different problem types for balanced progress')).toBeInTheDocument();
    });

    test('should show daily requirements when provided', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      expect(screen.getByText('Solve 5 Code Track problems per day')).toBeInTheDocument();
      expect(screen.getByText('Complete 1 Daily Test per day')).toBeInTheDocument();
      expect(screen.getByText('2 Code Tracks + 1 Daily Test every 2 days')).toBeInTheDocument();
    });

    test('should display feasibility badges correctly', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      const recommendedBadges = screen.getAllByText('Recommended');
      const challengingBadges = screen.getAllByText('Challenging');
      
      expect(recommendedBadges).toHaveLength(2); // Code Tracks Only and Mixed Strategy
      expect(challengingBadges).toHaveLength(1); // Daily Tests Only
    });

    test('should show warning for challenging paths', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByText(/This path may be challenging to maintain consistently/)).toBeInTheDocument();
    });

    test('should handle paths without daily requirements', () => {
      const pathsWithoutRequirements: AchievementPath[] = [
        {
          strategy: 'Code Tracks Only',
          description: 'Focus on solving Code Track problems exclusively',
          feasible: true
        }
      ];
      
      const goalWithoutRequirements = {
        ...mockGoalResults,
        suggestions: pathsWithoutRequirements
      };
      
      render(<ResultsDisplay goalResults={goalWithoutRequirements} />);
      
      expect(screen.getByText('Code Tracks Only')).toBeInTheDocument();
      expect(screen.getByText('Focus on solving Code Track problems exclusively')).toBeInTheDocument();
      expect(screen.queryByText('Daily Goal:')).not.toBeInTheDocument();
    });
  });

  describe('Daily Limits Information', () => {
    test('should display daily limits information', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      expect(screen.getByText('Important Limits to Remember')).toBeInTheDocument();
      expect(screen.getByText('Daily Tests:')).toBeInTheDocument();
      expect(screen.getByText('Maximum 1 per day (20 points each)')).toBeInTheDocument();
      expect(screen.getByText('Daily Challenges:')).toBeInTheDocument();
      expect(screen.getByText('Maximum 1 per day (2 points each)')).toBeInTheDocument();
      expect(screen.getByText('Code Tracks:')).toBeInTheDocument();
      expect(screen.getByText('No daily limit (2 points each)')).toBeInTheDocument();
      expect(screen.getByText('Code Tests:')).toBeInTheDocument();
      expect(screen.getByText('No daily limit (30 points each)')).toBeInTheDocument();
    });

    test('should show correct limit icons', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      // Check for limit icons (these appear in both achievement paths and limits sections)
      expect(screen.getAllByText('📅')).toHaveLength(2); // Daily Test icon appears twice
      expect(screen.getAllByText('⚡')).toHaveLength(1); // Daily Challenge icon
      expect(screen.getAllByText('🏃')).toHaveLength(2); // Code Track icon appears twice
      expect(screen.getAllByText('📝')).toHaveLength(1); // Code Test icon
    });
  });

  describe('Tips Section', () => {
    test('should display success tips', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      expect(screen.getByText('Tips for Success')).toBeInTheDocument();
      expect(screen.getByText('Start with easier Code Track problems to build momentum')).toBeInTheDocument();
      expect(screen.getByText("Don't miss Daily Tests - they provide the highest points per problem")).toBeInTheDocument();
      expect(screen.getByText('Mix different problem types to avoid burnout')).toBeInTheDocument();
      expect(screen.getByText('Track your daily progress to stay motivated')).toBeInTheDocument();
      expect(screen.getByText('Adjust your plan if you fall behind - consistency is key')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty suggestions array', () => {
      const emptyGoal: GoalCalculation = {
        targetPoints: 2000,
        currentPoints: 1000,
        timelineDays: 30,
        requiredPoints: 1000,
        suggestions: []
      };
      
      render(<ResultsDisplay goalResults={emptyGoal} />);
      
      expect(screen.getByText('Your Achievement Plan')).toBeInTheDocument();
      expect(screen.getByText('Achievement Path Options')).toBeInTheDocument();
      expect(screen.queryByText('Code Tracks Only')).not.toBeInTheDocument();
    });

    test('should handle zero required points (edge case)', () => {
      const zeroRequiredGoal: GoalCalculation = {
        targetPoints: 1000,
        currentPoints: 1000,
        timelineDays: 30,
        requiredPoints: 0,
        suggestions: []
      };
      
      render(<ResultsDisplay goalResults={zeroRequiredGoal} />);
      
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
    });

    test('should handle very large numbers', () => {
      const largeGoal: GoalCalculation = {
        targetPoints: 1000000,
        currentPoints: 500000,
        timelineDays: 365,
        requiredPoints: 500000,
        suggestions: mockAchievementPaths
      };
      
      render(<ResultsDisplay goalResults={largeGoal} />);
      
      expect(screen.getByText('1,000,000 points')).toBeInTheDocument();
      expect(screen.getByText('500,000 points')).toBeInTheDocument();
    });

    test('should handle single day timeline', () => {
      const singleDayGoal = { ...mockGoalResults, timelineDays: 1 };
      
      render(<ResultsDisplay goalResults={singleDayGoal} />);
      
      expect(screen.getByText('1 day')).toBeInTheDocument();
    });
  });

  describe('Strategy Icon Mapping', () => {
    test('should show correct icons for different strategies', () => {
      const diverseStrategies: AchievementPath[] = [
        { strategy: 'Code Track Focus', description: 'Test', feasible: true },
        { strategy: 'Daily Test Strategy', description: 'Test', feasible: true },
        { strategy: 'Code Test Approach', description: 'Test', feasible: true },
        { strategy: 'Daily Challenge Method', description: 'Test', feasible: true },
        { strategy: 'Mixed Approach', description: 'Test', feasible: true },
        { strategy: 'Unknown Strategy', description: 'Test', feasible: true }
      ];
      
      const diverseGoal = { ...mockGoalResults, suggestions: diverseStrategies };
      
      render(<ResultsDisplay goalResults={diverseGoal} />);
      
      expect(screen.getByText('🏃')).toBeInTheDocument(); // Code Track
      expect(screen.getByText('📅')).toBeInTheDocument(); // Daily Test
      expect(screen.getByText('📝')).toBeInTheDocument(); // Code Test
      expect(screen.getByText('⚡')).toBeInTheDocument(); // Daily Challenge
      expect(screen.getByText('🎯')).toBeInTheDocument(); // Mixed
      expect(screen.getByText('📊')).toBeInTheDocument(); // Unknown/Default
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading structure', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      expect(screen.getByRole('heading', { level: 2, name: 'Your Achievement Plan' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Achievement Path Options' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4, name: 'Important Limits to Remember' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4, name: 'Tips for Success' })).toBeInTheDocument();
    });

    test('should have meaningful text content for screen readers', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      expect(screen.getByText('Target')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Required')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
    });

    test('should have proper list structure for tips', () => {
      render(<ResultsDisplay goalResults={mockGoalResults} />);
      
      const tipsList = screen.getByRole('list');
      expect(tipsList).toBeInTheDocument();
      
      const tips = screen.getAllByRole('listitem');
      expect(tips).toHaveLength(5);
    });
  });
});