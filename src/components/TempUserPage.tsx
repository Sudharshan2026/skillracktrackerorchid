import { useState } from 'react';
import type { SkillRackProfile, GoalCalculation } from '../types';
import StatsDisplay from './StatsDisplay';
import ResultsDisplay from './ResultsDisplay';
import GoalCalculator from './GoalCalculator';
import './TempUserPage.css';

export function TempUserPage() {
  const [profileUrl, setProfileUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [goalResults, setGoalResults] = useState<GoalCalculation | null>(null);

  const sampleProfile: SkillRackProfile = {
    profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    name: 'John Doe',
    id: 'SEC23AD073',
    department: 'Computer Science and Engineering',
    college: 'Example Engineering College',
    year: '2023-2027',
    gender: 'Male',
    stats: {
      codeTutor: 45,
      codeTrack: 120,
      codeTest: 8,
      dailyTest: 25,
      dailyChallenge: 30,
      rank: 142,
      level: 12,
      gold: 15,
      silver: 30,
      bronze: 20,
      programsSolved: 250,
      totalPoints: 1100
    },
    languages: {
      'Python': 85,
      'Java': 65,
      'C': 50,
      'C++': 30,
      'JavaScript': 20
    },
    certificates: [
      {
        title: 'Python Programming Mastery',
        date: '2024-03-15',
        link: 'https://skillrack.com/cert/example1'
      },
      {
        title: 'Data Structures Champion',
        date: '2024-02-10',
        link: 'https://skillrack.com/cert/example2'
      }
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileUrl.trim()) {
      setShowPreview(true);
    }
  };

  const handleReset = () => {
    setShowPreview(false);
    setProfileUrl('');
    setGoalResults(null);
  };

  const handleGoalCalculate = (targetPoints: number, timelineDays: number) => {
    const currentPoints = sampleProfile.stats.totalPoints;
    const requiredPoints = Math.max(0, targetPoints - currentPoints);

    const suggestions = [];

    if (requiredPoints === 0) {
      suggestions.push({
        strategy: 'Goal Already Achieved',
        description: 'Congratulations! You have already reached your target points.',
        feasible: true,
      });
    } else {
      const codeTracksNeeded = Math.ceil(requiredPoints / 2);
      const codeTracksPerDay = Math.ceil(codeTracksNeeded / timelineDays);
      suggestions.push({
        strategy: 'Code Tracks Only',
        description: `Solve ${codeTracksNeeded} Code Track problems`,
        dailyRequirement: `${codeTracksPerDay} Code Tracks per day`,
        feasible: codeTracksPerDay <= 10,
      });

      const dailyTestsNeeded = Math.ceil(requiredPoints / 20);
      suggestions.push({
        strategy: 'Daily Tests Only',
        description: `Complete ${dailyTestsNeeded} Daily Tests`,
        dailyRequirement: '1 Daily Test per day',
        feasible: dailyTestsNeeded <= timelineDays,
      });

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
  };

  if (!showPreview) {
    return (
      <div className="temp-user-container">
        <div className="temp-user-card">
          <div className="demo-badge">Demo Mode</div>
          <h1 className="temp-user-title">Profile Preview</h1>
          <p className="temp-user-description">
            Enter any SkillRack profile URL to see how your profile data will be displayed in the tracker
          </p>

          <form onSubmit={handleSubmit} className="temp-user-form">
            <div className="input-group">
              <label htmlFor="profileUrl" className="input-label">
                SkillRack Profile URL
              </label>
              <input
                id="profileUrl"
                type="url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://www.skillrack.com/faces/resume.xhtml?id=..."
                className="profile-url-input"
                required
              />
              <p className="input-help">
                This is a demo with sample data. The actual app will parse your real profile.
              </p>
            </div>

            <button type="submit" className="submit-button">
              Preview Profile Display
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="temp-user-results">
      <header className="temp-user-header">
        <div className="header-content">
          <button onClick={handleReset} className="back-button">
            ← Back to Input
          </button>
          <div className="demo-indicator">
            <span className="demo-label">Demo Mode</span>
            <span className="demo-note">Showing sample data</span>
          </div>
        </div>
        <div className="analyzed-url-display">
          <span className="url-label">Analyzing:</span>
          <span className="url-text">{profileUrl}</span>
        </div>
      </header>

      <div className="temp-user-content">
        <section id="stats" className="profile-section minimal-section">
          <StatsDisplay profileData={sampleProfile} />
        </section>

        <section id="goals" className="goal-section minimal-section">
          <h2 className="section-title">Goal Planning</h2>
          <div className="section-body">
            <GoalCalculator
              currentPoints={sampleProfile.stats.totalPoints}
              onCalculate={handleGoalCalculate}
            />
          </div>
        </section>

        {goalResults && (
          <section id="plan" className="results-section minimal-section">
            <ResultsDisplay goalResults={goalResults} />
          </section>
        )}
      </div>

      <footer className="temp-user-footer">
        <div className="footer-content">
          <p className="footer-text">
            This is a preview with sample data. The actual application will parse your real SkillRack profile.
          </p>
          <button onClick={handleReset} className="footer-button">
            Try Another URL
          </button>
        </div>
      </footer>
    </div>
  );
}
