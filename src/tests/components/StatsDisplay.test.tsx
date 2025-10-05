import React from 'react';
import { render, screen } from '@testing-library/react';
import StatsDisplay from '../../src/components/StatsDisplay';
import type { SkillRackProfile } from '../../src/types';

describe('StatsDisplay Component', () => {
  const mockProfileData: SkillRackProfile = {
    profileImage: 'https://example.com/profile.jpg',
    name: 'John Doe',
    id: 'SEC23AD073',
    department: 'Computer Science Engineering',
    college: 'Test College',
    year: '2024',
    gender: 'Male',
    stats: {
      codeTutor: 100,
      codeTrack: 470,
      codeTest: 15,
      dailyTest: 30,
      dailyChallenge: 25,
      rank: 50,
      level: 8,
      gold: 5,
      silver: 10,
      bronze: 15,
      programsSolved: 540,
      totalPoints: 2040
    },
    languages: {
      'Python': 200,
      'Java': 150,
      'C': 100
    },
    certificates: [
      {
        title: 'Programming Fundamentals',
        date: '01-01-2024 10:00',
        link: 'https://example.com/cert1'
      }
    ]
  };

  const zeroProfileData: SkillRackProfile = {
    profileImage: '',
    name: 'Test User',
    id: 'TEST00000',
    department: 'Computer Science',
    college: 'Test College',
    year: '2024',
    gender: 'Other',
    stats: {
      codeTutor: 0,
      codeTrack: 0,
      codeTest: 0,
      dailyTest: 0,
      dailyChallenge: 0,
      rank: 0,
      level: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      programsSolved: 0,
      totalPoints: 0
    },
    languages: {},
    certificates: []
  };

  describe('Rendering', () => {
    test('should render component title', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      expect(screen.getByText('Your SkillRack Statistics')).toBeInTheDocument();
    });

    test('should render statistics table with all categories', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      // Check table headers
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Problems Solved')).toBeInTheDocument();
      expect(screen.getByText('Points Calculation')).toBeInTheDocument();
      expect(screen.getByText('Total Points')).toBeInTheDocument();
      
      // Check all categories are present
      expect(screen.getByText('Code Track')).toBeInTheDocument();
      expect(screen.getByText('Code Test')).toBeInTheDocument();
      expect(screen.getByText('Daily Test')).toBeInTheDocument();
      expect(screen.getByText('Daily Challenge')).toBeInTheDocument();
      expect(screen.getByText('Code Tutor')).toBeInTheDocument();
    });

    test('should display category icons', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      expect(screen.getByText('🏃')).toBeInTheDocument(); // Code Track
      expect(screen.getByText('📝')).toBeInTheDocument(); // Code Test
      expect(screen.getByText('📅')).toBeInTheDocument(); // Daily Test
      expect(screen.getByText('⚡')).toBeInTheDocument(); // Daily Challenge
      expect(screen.getByText('👨‍🏫')).toBeInTheDocument(); // Code Tutor
    });
  });

  describe('Point Calculations', () => {
    test('should display correct point calculations for all categories', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      // Code Track: 470 × 2 = 940
      expect(screen.getByText('470 × 2 = 940')).toBeInTheDocument();
      
      // Code Test: 15 × 30 = 450
      expect(screen.getByText('15 × 30 = 450')).toBeInTheDocument();
      
      // Daily Test: 30 × 20 = 600
      expect(screen.getByText('30 × 20 = 600')).toBeInTheDocument();
      
      // Daily Challenge: 25 × 2 = 50
      expect(screen.getByText('25 × 2 = 50')).toBeInTheDocument();
      
      // Code Tutor: 100 × 0 = 0
      expect(screen.getByText('100 × 0 = 0')).toBeInTheDocument();
    });

    test('should verify SkillRack scoring system requirements', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      // Requirement 6.1: Code Track = 2 points per problem
      expect(screen.getByText('470 × 2 = 940')).toBeInTheDocument();
      
      // Requirement 6.2: Code Tutor = 0 points per problem
      expect(screen.getByText('100 × 0 = 0')).toBeInTheDocument();
      expect(screen.getByText('(No points)')).toBeInTheDocument();
      
      // Requirement 6.3: Daily Test = 20 points per test
      expect(screen.getByText('30 × 20 = 600')).toBeInTheDocument();
      
      // Requirement 6.4: Daily Challenge = 2 points per challenge
      expect(screen.getByText('25 × 2 = 50')).toBeInTheDocument();
      
      // Requirement 6.5: Code Test = 30 points per test
      expect(screen.getByText('15 × 30 = 450')).toBeInTheDocument();
    });

    test('should display total points prominently', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      expect(screen.getByText('Total Points')).toBeInTheDocument();
      expect(screen.getByText('2,040')).toBeInTheDocument();
    });

    test('should show points breakdown in total section', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      expect(screen.getByText('Code Track: 940')).toBeInTheDocument();
      expect(screen.getByText('Code Test: 450')).toBeInTheDocument();
      expect(screen.getByText('Daily Test: 600')).toBeInTheDocument();
      expect(screen.getByText('Daily Challenge: 50')).toBeInTheDocument();
    });
  });

  describe('Zero Values Handling', () => {
    test('should handle zero values appropriately', () => {
      render(<StatsDisplay profileData={zeroProfileData} />);
      
      // All calculations should show 0
      expect(screen.getByText('0 × 2 = 0')).toBeInTheDocument();
      expect(screen.getByText('0 × 30 = 0')).toBeInTheDocument();
      expect(screen.getByText('0 × 20 = 0')).toBeInTheDocument();
      expect(screen.getByText('0 × 0 = 0')).toBeInTheDocument();
      
      // Total should be 0
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    test('should show zero stats message when no points', () => {
      render(<StatsDisplay profileData={zeroProfileData} />);
      
      expect(screen.getByText('No points found in your profile.')).toBeInTheDocument();
      expect(screen.getByText('Start solving problems on SkillRack to see your statistics here!')).toBeInTheDocument();
    });

    test('should not show achievement highlights when no points', () => {
      render(<StatsDisplay profileData={zeroProfileData} />);
      
      expect(screen.queryByText('Quick Stats')).not.toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    test('should format large numbers with commas', () => {
      const largeNumberData: ProfileStats = {
        codeTutor: 1000,
        codeTrack: 5000,
        codeTest: 100,
        dailyTest: 500,
        dailyChallenge: 1000,
        totalPoints: 42000
      };
      
      render(<StatsDisplay profileData={largeNumberData} />);
      
      expect(screen.getByText('5,000')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('42,000')).toBeInTheDocument();
    });

    test('should handle single digit numbers correctly', () => {
      const singleDigitData: ProfileStats = {
        codeTutor: 1,
        codeTrack: 2,
        codeTest: 3,
        dailyTest: 4,
        dailyChallenge: 5,
        totalPoints: 176 // (2*2) + (3*30) + (4*20) + (5*2) = 4 + 90 + 80 + 10 = 184
      };
      
      render(<StatsDisplay profileData={singleDigitData} />);
      
      expect(screen.getByText('1 × 0 = 0')).toBeInTheDocument();
      expect(screen.getByText('2 × 2 = 4')).toBeInTheDocument();
      expect(screen.getByText('3 × 30 = 90')).toBeInTheDocument();
      expect(screen.getByText('4 × 20 = 80')).toBeInTheDocument();
      expect(screen.getByText('5 × 2 = 10')).toBeInTheDocument();
    });
  });

  describe('Achievement Highlights', () => {
    test('should show achievement highlights when points exist', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      expect(screen.getByText('Quick Stats')).toBeInTheDocument();
      expect(screen.getByText('Total Problems')).toBeInTheDocument();
      expect(screen.getByText('Best Category')).toBeInTheDocument();
      expect(screen.getByText('Top Points')).toBeInTheDocument();
    });

    test('should calculate total problems correctly', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      // Total: 470 + 15 + 30 + 25 = 540
      expect(screen.getByText('540')).toBeInTheDocument();
    });

    test('should identify best category correctly', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      // Best category should be Code Track with 470 problems
      expect(screen.getByText('470')).toBeInTheDocument();
    });

    test('should show top points correctly', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      // Top points should be Code Track with 940 points
      expect(screen.getByText('940')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle mixed zero and non-zero values', () => {
      const mixedData: ProfileStats = {
        codeTutor: 0,
        codeTrack: 100,
        codeTest: 0,
        dailyTest: 10,
        dailyChallenge: 0,
        totalPoints: 400 // (100*2) + (10*20) = 200 + 200 = 400
      };
      
      render(<StatsDisplay profileData={mixedData} />);
      
      expect(screen.getByText('0 × 0 = 0')).toBeInTheDocument();
      expect(screen.getByText('100 × 2 = 200')).toBeInTheDocument();
      expect(screen.getByText('0 × 30 = 0')).toBeInTheDocument();
      expect(screen.getByText('10 × 20 = 200')).toBeInTheDocument();
      expect(screen.getByText('0 × 2 = 0')).toBeInTheDocument();
      
      expect(screen.getByText('400')).toBeInTheDocument();
    });

    test('should handle very large numbers', () => {
      const largeData: ProfileStats = {
        codeTutor: 999999,
        codeTrack: 999999,
        codeTest: 999,
        dailyTest: 999,
        dailyChallenge: 999999,
        totalPoints: 50000000
      };
      
      render(<StatsDisplay profileData={largeData} />);
      
      expect(screen.getByText('999,999')).toBeInTheDocument();
      expect(screen.getByText('50,000,000')).toBeInTheDocument();
    });

    test('should maintain table structure with varying data', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(6); // 1 header + 5 data rows
    });
  });

  describe('Accessibility', () => {
    test('should have proper table structure', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      expect(screen.getAllByRole('row')).toHaveLength(6); // header + 5 data rows
    });

    test('should have meaningful text content for screen readers', () => {
      render(<StatsDisplay profileData={mockProfileData} />);
      
      expect(screen.getByText('Your SkillRack Statistics')).toBeInTheDocument();
      expect(screen.getByText('Total Points')).toBeInTheDocument();
      expect(screen.getByText('(No points)')).toBeInTheDocument();
    });
  });
});